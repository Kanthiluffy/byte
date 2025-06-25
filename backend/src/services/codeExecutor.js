const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

class CodeExecutor {  constructor() {
    this.tempDir = path.join(__dirname, '../../temp');
    // Check platform and environment variables for executable handling
    this.isWindows = os.platform() === 'win32';
    // Allow override via environment variable for containerized deployments
    this.useWindowsExecutables = process.env.USE_WINDOWS_EXECUTABLES === 'true' || this.isWindows;
    this.pythonCommand = 'python3'; // Default to python3, will be updated in checkLanguageAvailability
    this.javaVersion = 11; // Default to assuming Java 11+ is available
    this.canUseJavaDirectExecution = true; // Default to using direct execution feature
    this.ensureTempDir();
  }

  async ensureTempDir() {
    await fs.ensureDir(this.tempDir);
  }  generateFileName(language, submissionId) {
    const extensions = {
      python: 'py',
      cpp: 'cpp',
      java: 'java'
    };
    
    const timestamp = Date.now();
    const extension = extensions[language];
    
    // Using UUID for all languages, including Java
    return `${submissionId}_${timestamp}.${extension}`;
  }  getCompileCommand(language, fileName, outputName) {
    const commands = {
      cpp: this.useWindowsExecutables 
        ? `g++ -o ${outputName}.exe ${fileName}` // Windows: generate .exe
        : `g++ -o ${outputName} ${fileName}`,    // Linux: no .exe extension
    };
    
    // Only compile Java if we're not using direct execution (Java < 11)
    if (language === 'java' && !this.canUseJavaDirectExecution) {
      commands.java = `javac ${fileName}`;
    }
    
    return commands[language] || null;
  }  getExecuteCommand(language, fileName, outputName) {
    // Create input file for cleaner input handling
    const inputFile = `${fileName}.input`;    
    
    const commands = {
      python: `${this.pythonCommand || 'python3'} ${fileName} < ${inputFile}`,
      cpp: this.useWindowsExecutables 
        ? `${outputName}.exe < ${inputFile}`  // Windows: run .exe
        : `./${outputName} < ${inputFile}`,   // Linux: run without extension, with ./
    };
    
    // Choose Java execution method based on version
    if (language === 'java') {
      if (this.canUseJavaDirectExecution) {
        // Java 11+ can directly run source files without compilation
        commands.java = `java ${fileName} < ${inputFile}`;
      } else {
        // For older Java versions, run the compiled class file
        // For this to work, the code should have a 'public class Solution'
        commands.java = `java Solution < ${inputFile}`;
      }
    }
    
    return commands[language];
  }
  async executeCode(code, language, testCases, timeLimit = 5000) {
    const submissionId = Date.now().toString();
    const fileName = this.generateFileName(language, submissionId);
    const filePath = path.join(this.tempDir, fileName);
    const outputName = `${submissionId}_output`;
    const outputPath = path.join(this.tempDir, outputName);

    try {
      // Check if the required language tools are available
      const isLanguageAvailable = await this.checkLanguageAvailability(language);
      if (!isLanguageAvailable) {
        const languageNames = {
          python: 'Python',
          cpp: 'C++ (g++)',
          java: 'Java (JDK)'
        };
          return {
          status: 'Internal Error',
          error: `${languageNames[language] || language} is not installed on this server. Please contact the administrator.`,
          testCaseResults: []
        };
      }

      // Write code to file
      await fs.writeFile(filePath, code);

      // Compile if necessary
      const compileCommand = this.getCompileCommand(language, fileName, outputName);
      if (compileCommand) {
        try {
          await this.runCommand(compileCommand, this.tempDir, 10000);
        } catch (compileError) {
          await this.cleanup(filePath, outputPath, language);
          return {
            status: 'Compilation Error',
            error: compileError.message,
            testCaseResults: []
          };
        }
      }

      // Execute against test cases
      const testCaseResults = [];
      let passedCount = 0;
      let totalExecutionTime = 0;

      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const inputFile = `${fileName}.input`;
        const inputFilePath = path.join(this.tempDir, inputFile);
        
        try {
          // Create input file
          await fs.writeFile(inputFilePath, testCase.input);
          
          const executeCommand = this.getExecuteCommand(
            language, 
            fileName, 
            outputName
          );

          const startTime = Date.now();
          const result = await this.runCommand(executeCommand, this.tempDir, timeLimit);
          const executionTime = Date.now() - startTime;
          totalExecutionTime += executionTime;

          const actualOutput = result.stdout.trim();
          const expectedOutput = testCase.expectedOutput.trim();
          const passed = actualOutput === expectedOutput;

          if (passed) passedCount++;          testCaseResults.push({
            testCaseId: testCase._id,
            passed,
            status: passed ? 'Accepted' : 'Wrong Answer',
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput,
            executionTime,
            error: result.stderr || ''
          });

          // Clean up input file
          await fs.remove(inputFilePath);

        } catch (error) {
          // Clean up input file on error
          try {
            await fs.remove(inputFilePath);
          } catch (cleanupError) {
            // Ignore cleanup errors
          }
          
          let status = 'Runtime Error';
          if (error.code === 'TIMEOUT') {
            status = 'Time Limit Exceeded';
          }          testCaseResults.push({
            testCaseId: testCase._id,
            passed: false,
            status: status,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: '',
            executionTime: timeLimit,
            error: error.message
          });

          // If any test case fails with TLE or RE, stop execution
          if (status === 'Time Limit Exceeded' || status === 'Runtime Error') {
            await this.cleanup(filePath, outputPath, language);
            return {
              status,
              error: error.message,
              testCaseResults,
              totalTestCases: testCases.length,
              passedTestCases: passedCount,
              executionTime: totalExecutionTime
            };
          }
        }
      }

      await this.cleanup(filePath, outputPath, language);

      // Determine final status
      let status = 'Wrong Answer';
      if (passedCount === testCases.length) {
        status = 'Accepted';
      }

      return {
        status,
        testCaseResults,
        totalTestCases: testCases.length,
        passedTestCases: passedCount,
        executionTime: totalExecutionTime
      };

    } catch (error) {
      await this.cleanup(filePath, outputPath, language);
      return {
        status: 'Internal Error',
        error: error.message,
        testCaseResults: []
      };
    }
  }
  runCommand(command, cwd, timeout) {
    return new Promise((resolve, reject) => {
      const child = exec(command, { cwd, timeout }, (error, stdout, stderr) => {
        if (error) {
          if (error.code === 'TIMEOUT' || error.signal === 'SIGTERM') {
            reject({ code: 'TIMEOUT', message: 'Time Limit Exceeded' });
          } else {
            reject({ code: 'ERROR', message: stderr || error.message });
          }
        } else {
          resolve({ stdout, stderr });
        }
      });

      // Ensure process is killed on timeout
      const killTimer = setTimeout(() => {
        if (child && !child.killed) {
          child.kill('SIGKILL');
          reject({ code: 'TIMEOUT', message: 'Time Limit Exceeded' });
        }
      }, timeout + 1000); // Add 1 second buffer

      child.on('exit', () => {
        clearTimeout(killTimer);
      });

      child.on('error', (err) => {
        clearTimeout(killTimer);
        reject({ code: 'ERROR', message: err.message });
      });
    });
  }  async cleanup(filePath, outputPath, language) {
    try {
      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
      }
      if (await fs.pathExists(outputPath)) {
        await fs.remove(outputPath);
      }
        // Clean up executable files (platform-specific)
      if (this.useWindowsExecutables) {
        // Windows: clean up .exe files
        const exeFile = `${outputPath}.exe`;
        if (await fs.pathExists(exeFile)) {
          await fs.remove(exeFile);
        }
      } else {
        // Linux: clean up executable without extension (already handled above)
        // No additional cleanup needed for Linux executables
      }
      
      // Clean up Java class files (for backward compatibility with older versions of Java)
      if (language === 'java' && !this.canUseJavaDirectExecution) {
        const dir = path.dirname(filePath);
        // Look for any class files that might have been generated
        const filesInDir = await fs.readdir(dir);
        const classFiles = filesInDir.filter(file => file.endsWith('.class'));
        
        // Remove all class files
        for (const classFile of classFiles) {
          await fs.remove(path.join(dir, classFile));
        }
      }
      // Clean up input files
      const inputFile = `${filePath}.input`;
      if (await fs.pathExists(inputFile)) {
        await fs.remove(inputFile);
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
  async checkLanguageAvailability(language) {
    const checkCommands = {
      python: ['python3 --version', 'python --version'], // Try python3 first, then python
      cpp: ['g++ --version'],
      java: ['java -version'] // Using java instead of javac to check availability
    };
    
    const commands = checkCommands[language];
    if (!commands) return true; // Unknown language, let it proceed
    
    // Try each command until one succeeds
    for (const command of commands) {
      try {
        const result = await this.runCommand(command, this.tempDir, 5000);
        
        // If this is python, store which command worked for execution
        if (language === 'python') {
          this.pythonCommand = command.includes('python3') ? 'python3' : 'python';
        }
        
        // Check Java version to determine if we can use direct execution
        if (language === 'java') {
          const versionOutput = result.stderr || result.stdout; // Java version is often in stderr
          const versionMatch = versionOutput.match(/version "(\d+)/i);
          
          if (versionMatch && versionMatch[1]) {
            const javaVersion = parseInt(versionMatch[1]);
            this.javaVersion = javaVersion;
            this.canUseJavaDirectExecution = javaVersion >= 11;
            console.log(`Detected Java version: ${javaVersion}, direct execution: ${this.canUseJavaDirectExecution}`);
          } else {
            // Default to using direct execution if we can't parse the version
            this.canUseJavaDirectExecution = true;
            console.log('Could not determine Java version, assuming Java 11+');
          }
        }
        
        return true;
      } catch (error) {
        // Continue to next command
      }
    }
    
    return false; // None of the commands worked
  }
}

module.exports = new CodeExecutor();
