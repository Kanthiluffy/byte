const codeExecutor = require('./src/services/codeExecutor');

async function testAdvancedJavaScript() {
  console.log('Testing Advanced JavaScript Features...\n');

  // Test 1: Array manipulation and JSON parsing
  console.log('=== Test 1: Array Manipulation ===');
  const arrayTestCases = [
    { input: '[1,2,3,4,5]\n3', expectedOutput: '[1,2,4,5]' },
    { input: '[10,20,30]\n20', expectedOutput: '[10,30]' },
    { input: '[5]\n5', expectedOutput: '[]' }
  ];

  const arrayCode = `
const input = require('fs').readFileSync(0, 'utf8').trim().split('\\n');
const arr = JSON.parse(input[0]);
const target = parseInt(input[1]);

const result = arr.filter(x => x !== target);
console.log(JSON.stringify(result));
`;

  try {
    const result1 = await codeExecutor.executeCode(arrayCode, 'javascript', arrayTestCases);
    console.log('Result:', JSON.stringify(result1, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }

  // Test 2: String manipulation with complex logic
  console.log('\n=== Test 2: String Manipulation ===');
  const stringTestCases = [
    { input: 'hello world', expectedOutput: 'dlrow olleh' },
    { input: 'JavaScript', expectedOutput: 'tpircSavaJ' },
    { input: 'a', expectedOutput: 'a' }
  ];

  const stringCode = `
const input = require('fs').readFileSync(0, 'utf8').trim();
const result = input.split('').reverse().join('');
console.log(result);
`;

  try {
    const result2 = await codeExecutor.executeCode(stringCode, 'javascript', stringTestCases);
    console.log('Result:', JSON.stringify(result2, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }

  // Test 3: Mathematical operations
  console.log('\n=== Test 3: Mathematical Operations ===');
  const mathTestCases = [
    { input: '5', expectedOutput: '120' },
    { input: '4', expectedOutput: '24' },
    { input: '3', expectedOutput: '6' },
    { input: '0', expectedOutput: '1' }
  ];

  const mathCode = `
const n = parseInt(require('fs').readFileSync(0, 'utf8').trim());

function factorial(num) {
    if (num <= 1) return 1;
    return num * factorial(num - 1);
}

console.log(factorial(n));
`;

  try {
    const result3 = await codeExecutor.executeCode(mathCode, 'javascript', mathTestCases);
    console.log('Result:', JSON.stringify(result3, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }

  // Test 4: Error handling test
  console.log('\n=== Test 4: Runtime Error Test ===');
  const errorCode = `
const input = require('fs').readFileSync(0, 'utf8').trim();
const num = parseInt(input);

// This will cause a runtime error for negative numbers
if (num < 0) {
    throw new Error('Negative number not allowed');
}

console.log(num * 2);
`;

  const errorTestCases = [
    { input: '5', expectedOutput: '10' },
    { input: '-1', expectedOutput: 'error' } // This should fail
  ];

  try {
    const result4 = await codeExecutor.executeCode(errorCode, 'javascript', errorTestCases);
    console.log('Result:', JSON.stringify(result4, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }

  // Test 5: ES6+ features
  console.log('\n=== Test 5: Modern JavaScript (ES6+) ===');
  const es6TestCases = [
    { input: '1,2,3,4,5', expectedOutput: '15' },
    { input: '10,20,30', expectedOutput: '60' },
    { input: '0', expectedOutput: '0' }
  ];

  const es6Code = `
const input = require('fs').readFileSync(0, 'utf8').trim();
const numbers = input.split(',').map(x => parseInt(x));

// Using arrow functions and reduce
const sum = numbers.reduce((acc, curr) => acc + curr, 0);

console.log(sum);
`;

  try {
    const result5 = await codeExecutor.executeCode(es6Code, 'javascript', es6TestCases);
    console.log('Result:', JSON.stringify(result5, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('\n=== Advanced JavaScript Testing Complete ===');
}

testAdvancedJavaScript();
