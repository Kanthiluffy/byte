const mongoose = require('mongoose');
const Problem = require('./src/models/Problem');
const codeExecutor = require('./src/services/codeExecutor');
require('dotenv').config();

async function testRealProblems() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test with Fibonacci problem (simpler test cases)
    const fibProblem = await Problem.findOne({ title: 'Fibonacci Number' });
    
    if (fibProblem) {
      console.log('\n=== Testing Fibonacci Number Problem ===');
      console.log('Test Cases:');
      fibProblem.testCases.forEach((tc, i) => {
        console.log(`  Test ${i+1}: Input="${tc.input}" Expected="${tc.expectedOutput}"`);
      });

      // Correct Fibonacci solution
      const fibCode = `
const n = parseInt(require('fs').readFileSync(0, 'utf8').trim());

function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

console.log(fib(n));
`;

      console.log('\n--- Testing Correct Fibonacci Solution ---');
      const result1 = await codeExecutor.executeCode(fibCode, 'javascript', fibProblem.testCases.slice(0, 4), 10000);
      console.log('Result:', JSON.stringify(result1, null, 2));

      // Wrong Fibonacci solution
      const wrongFibCode = `
const n = parseInt(require('fs').readFileSync(0, 'utf8').trim());

function fib(n) {
  return n * 2; // Wrong formula
}

console.log(fib(n));
`;

      console.log('\n--- Testing Wrong Fibonacci Solution ---');
      const result2 = await codeExecutor.executeCode(wrongFibCode, 'javascript', fibProblem.testCases.slice(0, 4));
      console.log('Result:', JSON.stringify(result2, null, 2));
    }

    // Test Palindrome Number problem
    const palindromeProblem = await Problem.findOne({ title: 'Palindrome Number' });
    
    if (palindromeProblem) {
      console.log('\n=== Testing Palindrome Number Problem ===');
      console.log('Test Cases:');
      palindromeProblem.testCases.forEach((tc, i) => {
        console.log(`  Test ${i+1}: Input="${tc.input}" Expected="${tc.expectedOutput}"`);
      });

      // Correct Palindrome solution
      const palindromeCode = `
const num = parseInt(require('fs').readFileSync(0, 'utf8').trim());

function isPalindrome(x) {
  if (x < 0) return false;
  const str = x.toString();
  return str === str.split('').reverse().join('');
}

console.log(isPalindrome(num));
`;

      console.log('\n--- Testing Correct Palindrome Solution ---');
      const result3 = await codeExecutor.executeCode(palindromeCode, 'javascript', palindromeProblem.testCases);
      console.log('Result:', JSON.stringify(result3, null, 2));
    }

    // Test with Python
    console.log('\n=== Testing Python Fibonacci ===');
    const pythonFibCode = `
n = int(input())

def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(n))
`;

    if (fibProblem) {
      const result4 = await codeExecutor.executeCode(pythonFibCode, 'python', fibProblem.testCases.slice(0, 4), 10000);
      console.log('Result:', JSON.stringify(result4, null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testRealProblems();
