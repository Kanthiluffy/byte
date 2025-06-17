const mongoose = require('mongoose');
require('dotenv').config();

const Submission = require('./src/models/Submission');
const Problem = require('./src/models/Problem');
const codeExecutor = require('./src/services/codeExecutor');

mongoose.connect(process.env.MONGODB_URI);

async function testCodeExecutionHang() {
  try {
    console.log('\n🔍 Testing Code Execution for Hang/Crash Issues...\n');

    // Get the Palindrome Number problem
    const problem = await Problem.findOne({ title: 'Palindrome Number' });
    if (!problem) {
      console.error('❌ Palindrome Number problem not found');
      return;
    }

    console.log(`📝 Problem: ${problem.title}`);
    console.log(`🧪 Test Cases: ${problem.testCases.length}`);

    // Test the EXACT code the user submitted that caused the hang
    const userCode = `const num = parseInt(require('fs').readFileSync(0, 'utf8').trim());

function isPalindrome(x) {
  if (x < 0) return false;
  const str = x.toString();
  return str === str.split('').reverse().join('');
}

console.log(isPalindrome(num));`;

    console.log('\n📝 User Code:');
    console.log(userCode);

    // Add timeout to prevent hanging
    console.log('\n🚀 Starting code execution with 10-second timeout...');
    const startTime = Date.now();

    const executionPromise = codeExecutor.executeCode(
      userCode,
      'javascript',
      problem.testCases,
      problem.timeLimit
    );

    // Race between execution and timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('EXECUTION_TIMEOUT')), 10000);
    });

    try {
      const result = await Promise.race([executionPromise, timeoutPromise]);
      
      console.log(`\n🏁 Execution completed (${Date.now() - startTime}ms)`);
      console.log(`📊 Result: ${result.status}`);
      console.log(`✅ Passed: ${result.passedTestCases}/${result.totalTestCases}`);
      
      if (result.error) {
        console.log(`❌ Error: ${result.error}`);
      }

      // Show individual test case results
      console.log('\n📋 Test Case Results:');
      result.testCaseResults.forEach((tcResult, i) => {
        console.log(`  Test ${i+1}: ${tcResult.status} (${tcResult.executionTime}ms)`);
        if (tcResult.status === 'Wrong Answer') {
          console.log(`    Expected: ${tcResult.expectedOutput}`);
          console.log(`    Got: ${tcResult.actualOutput}`);
        }
      });

    } catch (error) {
      if (error.message === 'EXECUTION_TIMEOUT') {
        console.log(`\n⚠️  EXECUTION TIMED OUT after 10 seconds!`);
        console.log(`🚨 This explains why the server hangs and frontend times out`);
      } else {
        console.log(`\n❌ Execution failed: ${error.message}`);
      }
    }

    console.log('\n✅ Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testCodeExecutionHang();
