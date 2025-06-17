const codeExecutor = require('./src/services/codeExecutor');
const mongoose = require('mongoose');
const Problem = require('./src/models/Problem');
require('dotenv').config();

async function debugPalindromeTimeout() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the palindrome problem
    const palindromeProblem = await Problem.findOne({ title: 'Palindrome Number' });
    
    if (palindromeProblem) {
      console.log('=== Palindrome Problem Test Cases ===');
      palindromeProblem.testCases.forEach((tc, i) => {
        console.log(`Test ${i+1}: Input="${tc.input}" Expected="${tc.expectedOutput}"`);
      });

      // Test the exact code that's timing out
      const palindromeCode = `const num = parseInt(require('fs').readFileSync(0, 'utf8').trim());

function isPalindrome(x) {
  if (x < 0) return false;
  const str = x.toString();
  return str === str.split('').reverse().join('');
}

console.log(isPalindrome(num));`;

      console.log('\n=== Testing Your Palindrome Code ===');
      console.log('Code:');
      console.log(palindromeCode);
      
      // Test with a shorter timeout first
      console.log('\n--- Testing with 3 second timeout ---');
      const result1 = await codeExecutor.executeCode(palindromeCode, 'javascript', palindromeProblem.testCases.slice(0, 2), 3000);
      console.log('Result:', JSON.stringify(result1, null, 2));

      // Test with individual test cases to see which one is problematic
      console.log('\n--- Testing Individual Test Cases ---');
      for (let i = 0; i < Math.min(palindromeProblem.testCases.length, 4); i++) {
        const testCase = palindromeProblem.testCases[i];
        console.log(`\nTesting: Input="${testCase.input}" Expected="${testCase.expectedOutput}"`);
        
        const singleResult = await codeExecutor.executeCode(palindromeCode, 'javascript', [testCase], 2000);
        console.log(`Result: ${singleResult.status} - ${singleResult.testCaseResults[0]?.actualOutput || 'No output'}`);
        
        if (singleResult.status !== 'Accepted') {
          console.log('Error details:', singleResult.error || singleResult.testCaseResults[0]?.error);
          break;
        }
      }

      // Test with a simpler version to isolate the issue
      console.log('\n--- Testing Simplified Version ---');
      const simplePalindromeCode = `const input = require('fs').readFileSync(0, 'utf8').trim();
console.log('Input received:', input);
const num = parseInt(input);
console.log('Parsed number:', num);

function isPalindrome(x) {
  console.log('Checking palindrome for:', x);
  if (x < 0) return false;
  const str = x.toString();
  const reversed = str.split('').reverse().join('');
  const result = str === reversed;
  console.log('String:', str, 'Reversed:', reversed, 'Result:', result);
  return result;
}

const result = isPalindrome(num);
console.log(result);`;

      console.log('Testing with debug output...');
      const debugResult = await codeExecutor.executeCode(simplePalindromeCode, 'javascript', [palindromeProblem.testCases[0]], 3000);
      console.log('Debug Result:', JSON.stringify(debugResult, null, 2));

    } else {
      console.log('Palindrome problem not found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugPalindromeTimeout();
