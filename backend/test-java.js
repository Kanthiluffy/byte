const codeExecutor = require('./src/services/codeExecutor');

async function testJavaExecution() {
  console.log('Testing Java Code Execution...\n');

  // Test 1: Simple addition in Java
  console.log('=== Test 1: Java Simple Addition ===');
  const simpleTestCases = [
    { input: '2\n3', expectedOutput: '5' },
    { input: '10\n20', expectedOutput: '30' },
    { input: '0\n0', expectedOutput: '0' }
  ];

  const javaCode = `
import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int a = scanner.nextInt();
        int b = scanner.nextInt();
        System.out.println(a + b);
        scanner.close();
    }
}`;

  try {
    const result1 = await codeExecutor.executeCode(javaCode, 'java', simpleTestCases);
    console.log('Result:', JSON.stringify(result1, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }

  // Test 2: Fibonacci in Java
  console.log('\n=== Test 2: Java Fibonacci ===');
  const fibTestCases = [
    { input: '0', expectedOutput: '0' },
    { input: '1', expectedOutput: '1' },
    { input: '2', expectedOutput: '1' },
    { input: '3', expectedOutput: '2' },
    { input: '4', expectedOutput: '3' }
  ];

  const javaFibCode = `
import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        System.out.println(fibonacci(n));
        scanner.close();
    }
    
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}`;

  try {
    const result2 = await codeExecutor.executeCode(javaFibCode, 'java', fibTestCases);
    console.log('Result:', JSON.stringify(result2, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }

  // Test 3: Java compilation error
  console.log('\n=== Test 3: Java Compilation Error ===');
  const javaErrorCode = `
public class Solution {
    public static void main(String[] args) {
        System.out.println("Hello")
        // Missing semicolon - should cause compilation error
    }
}`;

  try {
    const result3 = await codeExecutor.executeCode(javaErrorCode, 'java', simpleTestCases.slice(0, 1));
    console.log('Result:', JSON.stringify(result3, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('\n=== Java Testing Complete ===');
}

testJavaExecution();
