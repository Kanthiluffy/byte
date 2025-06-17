const mongoose = require('mongoose');
require('dotenv').config();

const Submission = require('./src/models/Submission');
const Problem = require('./src/models/Problem');
const codeExecutor = require('./src/services/codeExecutor');

mongoose.connect(process.env.MONGODB_URI);

async function testCppCode() {
  try {
    console.log('\n🔍 Testing C++ Code with Windows-specific fixes...\n');

    // Get the Palindrome Number problem
    const problem = await Problem.findOne({ title: 'Palindrome Number' });
    if (!problem) {
      console.error('❌ Palindrome Number problem not found');
      return;
    }

    console.log(`📝 Problem: ${problem.title}`);
    console.log(`🧪 Test Cases: ${problem.testCases.length}`);

    // Test the C++ palindrome code
    const cppCode = `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

bool isPalindrome(int x) {
    if (x < 0) return false;
    
    string str = to_string(x);
    string reversed = str;
    reverse(reversed.begin(), reversed.end());
    
    return str == reversed;
}

int main() {
    int x;
    cin >> x;
    
    if (isPalindrome(x)) {
        cout << "true" << endl;
    } else {
        cout << "false" << endl;
    }
    
    return 0;
}`;

    console.log('\n📝 C++ Code:');
    console.log(cppCode);

    console.log('\n🚀 Starting C++ code execution...');
    const startTime = Date.now();

    const result = await codeExecutor.executeCode(
      cppCode,
      'cpp',
      problem.testCases,
      problem.timeLimit
    );

    console.log(`\n🏁 Execution completed (${Date.now() - startTime}ms)`);
    console.log(`📊 Result: ${result.status}`);
    console.log(`✅ Passed: ${result.passedTestCases}/${result.totalTestCases}`);
    
    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
    }

    // Show individual test case results
    console.log('\n📋 Test Case Results:');
    result.testCaseResults.forEach((tcResult, i) => {
      console.log(`  Test ${i+1}: ${tcResult.status || 'Unknown'} (${tcResult.executionTime || 0}ms)`);
      if (tcResult.status === 'Wrong Answer') {
        console.log(`    Expected: ${tcResult.expectedOutput}`);
        console.log(`    Got: ${tcResult.actualOutput}`);
      }
      if (tcResult.error) {
        console.log(`    Error: ${tcResult.error}`);
      }
    });

    console.log('\n✅ C++ test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testCppCode();
