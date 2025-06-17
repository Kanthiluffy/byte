const codeExecutor = require('./src/services/codeExecutor');
const mongoose = require('mongoose');
const Problem = require('./src/models/Problem');
require('dotenv').config();

async function testPythonExecution() {
  try {
    console.log('\n🐍 Testing Python Code Execution...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the Palindrome Number problem
    const problem = await Problem.findOne({ title: 'Palindrome Number' });
    if (!problem) {
      console.error('❌ Palindrome Number problem not found');
      return;
    }

    console.log(`📝 Problem: ${problem.title}`);
    console.log(`🧪 Test Cases: ${problem.testCases.length}`);

    // Test the Python palindrome code
    const pythonCode = `x = int(input().strip())

def is_palindrome(x):
    if x < 0:
        return False
    
    str_x = str(x)
    return str_x == str_x[::-1]

print(str(is_palindrome(x)).lower())`;

    console.log('\n📝 Python Code:');
    console.log(pythonCode);

    // Test execution
    console.log('\n🔄 Executing Python code...');
    const startTime = Date.now();
    
    const result = await codeExecutor.executeCode(pythonCode, 'python', problem.testCases, 10000);
    
    const executionTime = Date.now() - startTime;
    console.log(`\n🏁 Execution completed (${executionTime}ms)`);
    console.log(`📊 Result: ${result.status}`);
    console.log(`✅ Passed: ${result.passedTestCases}/${result.totalTestCases}`);
    
    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
    }

    // Show individual test case results
    if (result.testCaseResults && result.testCaseResults.length > 0) {
      console.log('\n📋 Test Case Results:');
      result.testCaseResults.forEach((tcResult, i) => {
        const testCase = problem.testCases[i];
        console.log(`  Test ${i+1}: ${tcResult.status} (${tcResult.executionTime}ms)`);
        console.log(`    Input: "${testCase.input}"`);
        console.log(`    Expected: "${testCase.expectedOutput}"`);
        console.log(`    Got: "${tcResult.actualOutput}"`);
        if (tcResult.error) {
          console.log(`    Error: ${tcResult.error}`);
        }
      });
    }

    // Test individual test case to debug
    console.log('\n🔍 Testing individual test case...');
    const singleTest = await codeExecutor.executeCode(pythonCode, 'python', [problem.testCases[0]], 5000);
    console.log('Single test result:', JSON.stringify(singleTest, null, 2));

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testPythonExecution();
