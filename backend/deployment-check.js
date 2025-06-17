const { exec } = require('child_process');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const checkCommand = (command, name) => {
  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log(`${colors.red}❌ ${name}: Not available${colors.reset}`);
        console.log(`   Error: ${error.message}`);
        resolve(false);
      } else {
        console.log(`${colors.green}✅ ${name}: Available${colors.reset}`);
        console.log(`   Version: ${stdout.trim() || stderr.trim()}`);
        resolve(true);
      }
    });
  });
};

async function runDeploymentChecklist() {
  console.log(`${colors.blue}=== CodeJudge Deployment Verification ===\n${colors.reset}`);
  
  const checks = [];
  
  // 1. Language Tools Check
  console.log(`${colors.yellow}1. Checking Language Tools...${colors.reset}`);
  const pythonOk = await checkCommand('python --version', 'Python');
  const cppOk = await checkCommand('g++ --version', 'C++ Compiler (g++)');
  const javacOk = await checkCommand('javac -version', 'Java Compiler (javac)');
  const javaOk = await checkCommand('java -version', 'Java Runtime (java)');
  
  checks.push({
    name: 'Language Tools',
    passed: pythonOk && cppOk && javacOk && javaOk,
    details: `Python: ${pythonOk ? '✅' : '❌'}, C++: ${cppOk ? '✅' : '❌'}, Java: ${javacOk && javaOk ? '✅' : '❌'}`
  });
  
  // 2. Environment Variables Check
  console.log(`\n${colors.yellow}2. Checking Environment Variables...${colors.reset}`);
  const mongoUri = process.env.MONGODB_URI;
  const frontendUrl = process.env.FRONTEND_URL;
  const nodeEnv = process.env.NODE_ENV;
  const port = process.env.PORT;
  
  console.log(`${mongoUri ? colors.green + '✅' : colors.red + '❌'} MONGODB_URI: ${mongoUri ? 'Set' : 'Not set'}${colors.reset}`);
  console.log(`${frontendUrl ? colors.green + '✅' : colors.red + '❌'} FRONTEND_URL: ${frontendUrl || 'Not set'}${colors.reset}`);
  console.log(`${nodeEnv ? colors.green + '✅' : colors.yellow + '⚠️'} NODE_ENV: ${nodeEnv || 'Not set (defaulting to development)'}${colors.reset}`);
  console.log(`${port ? colors.green + '✅' : colors.yellow + '⚠️'} PORT: ${port || 'Not set (defaulting to 5000)'}${colors.reset}`);
  
  checks.push({
    name: 'Environment Variables',
    passed: !!mongoUri && !!frontendUrl,
    details: `MongoDB: ${mongoUri ? '✅' : '❌'}, Frontend URL: ${frontendUrl ? '✅' : '❌'}`
  });
  
  // 3. Directory Structure Check
  console.log(`\n${colors.yellow}3. Checking Directory Structure...${colors.reset}`);
  const tempDir = path.join(__dirname, 'temp');
  const tempExists = fs.existsSync(tempDir);
  
  if (!tempExists) {
    try {
      fs.mkdirSync(tempDir, { recursive: true });
      console.log(`${colors.green}✅ Temp directory: Created${colors.reset}`);
    } catch (error) {
      console.log(`${colors.red}❌ Temp directory: Failed to create${colors.reset}`);
      console.log(`   Error: ${error.message}`);
    }
  } else {
    console.log(`${colors.green}✅ Temp directory: Exists${colors.reset}`);
  }
  
  // Check temp directory permissions
  try {
    const testFile = path.join(tempDir, 'test-write.txt');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log(`${colors.green}✅ Temp directory: Writable${colors.reset}`);
    
    checks.push({
      name: 'Directory Structure',
      passed: true,
      details: 'Temp directory exists and is writable'
    });
  } catch (error) {
    console.log(`${colors.red}❌ Temp directory: Not writable${colors.reset}`);
    console.log(`   Error: ${error.message}`);
    
    checks.push({
      name: 'Directory Structure',
      passed: false,
      details: 'Temp directory not writable'
    });
  }
  
  // 4. MongoDB Connection Check
  console.log(`\n${colors.yellow}4. Checking MongoDB Connection...${colors.reset}`);
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { 
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000
      });
      console.log(`${colors.green}✅ MongoDB: Connected successfully${colors.reset}`);
      await mongoose.disconnect();
      
      checks.push({
        name: 'MongoDB Connection',
        passed: true,
        details: 'Successfully connected to MongoDB Atlas'
      });
    } catch (error) {
      console.log(`${colors.red}❌ MongoDB: Connection failed${colors.reset}`);
      console.log(`   Error: ${error.message}`);
      
      checks.push({
        name: 'MongoDB Connection',
        passed: false,
        details: `Connection failed: ${error.message}`
      });
    }
  } else {
    console.log(`${colors.red}❌ MongoDB: No connection string provided${colors.reset}`);
    
    checks.push({
      name: 'MongoDB Connection',
      passed: false,
      details: 'MONGODB_URI not set'
    });
  }
  
  // 5. Code Execution Test
  console.log(`\n${colors.yellow}5. Testing Code Execution...${colors.reset}`);
  try {
    const codeExecutor = require('./src/services/codeExecutor');
    
    // Test Python
    const pythonCode = 'print("Hello from Python")';
    const pythonTest = await codeExecutor.executeCode(pythonCode, 'python', [
      { input: '', expectedOutput: 'Hello from Python' }
    ]);
    const pythonWorks = pythonTest.status === 'Accepted';
    console.log(`${pythonWorks ? colors.green + '✅' : colors.red + '❌'} Python execution: ${pythonWorks ? 'Working' : 'Failed'}${colors.reset}`);
    
    // Test C++
    const cppCode = '#include <iostream>\nusing namespace std;\nint main() { cout << "Hello from C++"; return 0; }';
    const cppTest = await codeExecutor.executeCode(cppCode, 'cpp', [
      { input: '', expectedOutput: 'Hello from C++' }
    ]);
    const cppWorks = cppTest.status === 'Accepted';
    console.log(`${cppWorks ? colors.green + '✅' : colors.red + '❌'} C++ execution: ${cppWorks ? 'Working' : 'Failed'}${colors.reset}`);
    
    // Test Java
    const javaCode = 'public class Solution { public static void main(String[] args) { System.out.println("Hello from Java"); } }';
    const javaTest = await codeExecutor.executeCode(javaCode, 'java', [
      { input: '', expectedOutput: 'Hello from Java' }
    ]);
    const javaWorks = javaTest.status === 'Accepted';
    console.log(`${javaWorks ? colors.green + '✅' : colors.red + '❌'} Java execution: ${javaWorks ? 'Working' : 'Failed'}${colors.reset}`);
    
    checks.push({
      name: 'Code Execution',
      passed: pythonWorks && cppWorks && javaWorks,
      details: `Python: ${pythonWorks ? '✅' : '❌'}, C++: ${cppWorks ? '✅' : '❌'}, Java: ${javaWorks ? '✅' : '❌'}`
    });
    
  } catch (error) {
    console.log(`${colors.red}❌ Code execution test failed${colors.reset}`);
    console.log(`   Error: ${error.message}`);
    
    checks.push({
      name: 'Code Execution',
      passed: false,
      details: `Test failed: ${error.message}`
    });
  }
  
  // Summary
  console.log(`\n${colors.blue}=== Deployment Verification Summary ===${colors.reset}`);
  const passedChecks = checks.filter(check => check.passed).length;
  const totalChecks = checks.length;
  
  checks.forEach(check => {
    const status = check.passed ? colors.green + '✅ PASS' : colors.red + '❌ FAIL';
    console.log(`${status} ${check.name}: ${check.details}${colors.reset}`);
  });
  
  console.log(`\n${colors.yellow}Overall Status: ${passedChecks}/${totalChecks} checks passed${colors.reset}`);
  
  if (passedChecks === totalChecks) {
    console.log(`${colors.green}🎉 Deployment Ready! All systems operational.${colors.reset}`);
  } else {
    console.log(`${colors.red}⚠️  Deployment Issues Found. Please resolve the failed checks above.${colors.reset}`);
    
    console.log(`\n${colors.yellow}Quick Fix Commands:${colors.reset}`);
    if (!checks.find(c => c.name === 'Language Tools')?.passed) {
      console.log('Language Tools: sudo apt install openjdk-11-jdk g++ python3');
    }
    if (!checks.find(c => c.name === 'Environment Variables')?.passed) {
      console.log('Environment: Set MONGODB_URI and FRONTEND_URL in your .env file');
    }
    if (!checks.find(c => c.name === 'Directory Structure')?.passed) {
      console.log('Directory: chmod 755 temp/ or mkdir -p temp');
    }
  }
  
  console.log(`\n${colors.blue}For detailed troubleshooting, see JAVA_INSTALLATION_GUIDE.md${colors.reset}`);
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  console.error(`${colors.red}Unexpected error:${colors.reset}`, error.message);
  process.exit(1);
});

runDeploymentChecklist();
