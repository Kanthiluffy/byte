const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

// Test the exact scenario that crashes the server
async function testMinimalReproduction() {
  const tempDir = path.join(__dirname, 'temp');
  await fs.ensureDir(tempDir);
  
  // Test the EXACT palindrome code
  const userCode = `const num = parseInt(require('fs').readFileSync(0, 'utf8').trim());

function isPalindrome(x) {
  if (x < 0) return false;
  const str = x.toString();
  return str === str.split('').reverse().join('');
}

console.log(isPalindrome(num));`;

  const testCases = [
    { input: '121', expectedOutput: 'true' },
    { input: '-121', expectedOutput: 'false' },
    { input: '10', expectedOutput: 'false' },
    { input: '0', expectedOutput: 'true' }
  ];

  console.log('🔍 Testing minimal reproduction of server crash...\n');

  try {
    const timestamp = Date.now();
    const fileName = `test_${timestamp}.js`;
    const filePath = path.join(tempDir, fileName);
    
    // Write the code file
    await fs.writeFile(filePath, userCode);
    console.log(`✅ Code file created: ${fileName}`);

    // Test each test case
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`\n📝 Testing case ${i + 1}: input="${testCase.input}", expected="${testCase.expectedOutput}"`);
      
      try {
        // Create input file
        const inputFilePath = `${filePath}.input`;
        await fs.writeFile(inputFilePath, testCase.input);
        
        // Execute with timeout
        const command = `node ${fileName} < ${fileName}.input`;
        console.log(`   🚀 Running: ${command}`);
        
        const result = await new Promise((resolve, reject) => {
          const child = exec(command, { cwd: tempDir, timeout: 5000 }, (error, stdout, stderr) => {
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

          // Add manual timeout handling
          const killTimer = setTimeout(() => {
            if (child && !child.killed) {
              console.log('   ⚠️  Manual timeout - killing process');
              child.kill('SIGKILL');
              reject({ code: 'TIMEOUT', message: 'Manual timeout' });
            }
          }, 6000);

          child.on('exit', () => {
            clearTimeout(killTimer);
          });

          child.on('error', (err) => {
            clearTimeout(killTimer);
            reject({ code: 'ERROR', message: err.message });
          });
        });

        const actualOutput = result.stdout.trim();
        const passed = actualOutput === testCase.expectedOutput;
        
        console.log(`   ✅ Output: "${actualOutput}" (${passed ? 'PASS' : 'FAIL'})`);
        
        // Clean up input file
        await fs.remove(inputFilePath);
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message} (Code: ${error.code})`);
        
        // Clean up input file on error
        try {
          await fs.remove(`${filePath}.input`);
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
      }
    }

    // Clean up code file
    await fs.remove(filePath);
    console.log(`\n🧹 Cleaned up: ${fileName}`);
    console.log('\n✅ Test completed successfully - no crash!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

testMinimalReproduction().then(() => {
  console.log('\n🎯 If this test passes, the issue is elsewhere in the server setup');
  process.exit(0);
});
