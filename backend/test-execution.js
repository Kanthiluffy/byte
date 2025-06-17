const codeExecutor = require('./src/services/codeExecutor');

async function testCodeExecution() {
  console.log('Testing Code Execution System...\n');

  // Test 1: Simple addition (should pass)
  console.log('=== Test 1: Simple Addition ===');
  const simpleTestCases = [
    { input: '2\n3', expectedOutput: '5' },
    { input: '10\n20', expectedOutput: '30' },
    { input: '0\n0', expectedOutput: '0' }
  ];

  const simpleCode = `
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputs = [];
rl.on('line', (line) => {
  inputs.push(line);
  if (inputs.length === 2) {
    const a = parseInt(inputs[0]);
    const b = parseInt(inputs[1]);
    console.log(a + b);
    rl.close();
  }
});
`;

  try {
    const result1 = await codeExecutor.executeCode(simpleCode, 'javascript', simpleTestCases);
    console.log('Result:', JSON.stringify(result1, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('\n=== Test 2: Python Simple Addition ===');
  const pythonCode = `
a = int(input())
b = int(input())
print(a + b)
`;

  try {
    const result2 = await codeExecutor.executeCode(pythonCode, 'python', simpleTestCases);
    console.log('Result:', JSON.stringify(result2, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }

  // Test 3: Wrong answer (should fail)
  console.log('\n=== Test 3: Wrong Answer Test ===');
  const wrongCode = `
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputs = [];
rl.on('line', (line) => {
  inputs.push(line);
  if (inputs.length === 2) {
    const a = parseInt(inputs[0]);
    const b = parseInt(inputs[1]);
    console.log(a - b); // Wrong operation (subtraction instead of addition)
    rl.close();
  }
});
`;

  try {
    const result3 = await codeExecutor.executeCode(wrongCode, 'javascript', simpleTestCases);
    console.log('Result:', JSON.stringify(result3, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }

  // Test 4: Compilation error
  console.log('\n=== Test 4: Compilation Error Test ===');
  const cppCode = `
#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
    // Missing closing brace - should cause compilation error
`;

  try {
    const result4 = await codeExecutor.executeCode(cppCode, 'cpp', simpleTestCases);
    console.log('Result:', JSON.stringify(result4, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }

  // Test 5: Timeout test
  console.log('\n=== Test 5: Timeout Test ===');
  const timeoutCode = `
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputs = [];
rl.on('line', (line) => {
  inputs.push(line);
  if (inputs.length === 2) {
    // Infinite loop to test timeout
    while(true) {
      // Do nothing
    }
  }
});
`;

  try {
    const result5 = await codeExecutor.executeCode(timeoutCode, 'javascript', simpleTestCases.slice(0, 1), 2000); // 2 second timeout
    console.log('Result:', JSON.stringify(result5, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('\n=== Testing Complete ===');
}

testCodeExecution();
