const codeExecutor = require('./src/services/codeExecutor');

// Test Java Simple Addition
const javaCode = `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(a + b);
        sc.close();
    }
}`;

// Test Java Palindrome
const javaPalindromeCode = `import java.util.Scanner;

public class Solution {
    public static boolean isPalindrome(int x) {
        if (x < 0) return false;
        String s = String.valueOf(x);
        return s.equals(new StringBuilder(s).reverse().toString());
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int x = sc.nextInt();
        System.out.println(isPalindrome(x));
        sc.close();
    }
}`;

async function testJavaAvailability() {
  console.log('=== Testing Java Language Availability ===\n');
  
  // Test 1: Simple addition
  console.log('Test 1: Simple Addition');
  const additionTestCases = [
    { input: "5 3", expectedOutput: "8" },
    { input: "10 20", expectedOutput: "30" },
    { input: "0 0", expectedOutput: "0" }
  ];
  
  try {
    const result1 = await codeExecutor.executeCode(javaCode, 'java', additionTestCases);
    console.log('Result:', JSON.stringify(result1, null, 2));
    
    if (result1.status === 'Accepted') {
      console.log('✅ Java simple addition: PASSED\n');
    } else if (result1.status === 'System Error') {
      console.log('❌ Java is not installed:', result1.error);
      console.log('\n=== Installation Required ===');
      console.log('Please install Java JDK:');
      console.log('Ubuntu/Debian: sudo apt install openjdk-11-jdk');
      console.log('CentOS/RHEL: sudo yum install java-11-openjdk-devel');
      console.log('Alpine: apk add openjdk11-jdk');
      return;
    } else {
      console.log('⚠️ Java installed but test failed:', result1.status);
      console.log('Error:', result1.error);
    }
  } catch (error) {
    console.error('❌ Critical error testing Java:', error.message);
    return;
  }
  
  // Test 2: Palindrome (more complex)
  console.log('Test 2: Palindrome Number');
  const palindromeTestCases = [
    { input: "121", expectedOutput: "true" },
    { input: "-121", expectedOutput: "false" },
    { input: "10", expectedOutput: "false" },
    { input: "0", expectedOutput: "true" }
  ];
  
  try {
    const result2 = await codeExecutor.executeCode(javaPalindromeCode, 'java', palindromeTestCases);
    
    if (result2.status === 'Accepted') {
      console.log('✅ Java palindrome: PASSED');
    } else {
      console.log('❌ Java palindrome: FAILED');
      console.log('Status:', result2.status);
      console.log('Error:', result2.error);
    }
  } catch (error) {
    console.error('❌ Error testing Java palindrome:', error.message);
  }
  
  // Test 3: Language availability check
  console.log('\nTest 3: Language Availability Check');
  try {
    const isAvailable = await codeExecutor.checkLanguageAvailability('java');
    console.log(`Java availability: ${isAvailable ? '✅ Available' : '❌ Not Available'}`);
    
    // Test other languages too
    const pythonAvailable = await codeExecutor.checkLanguageAvailability('python');
    const cppAvailable = await codeExecutor.checkLanguageAvailability('cpp');
    
    console.log(`Python availability: ${pythonAvailable ? '✅ Available' : '❌ Not Available'}`);
    console.log(`C++ availability: ${cppAvailable ? '✅ Available' : '❌ Not Available'}`);
    
  } catch (error) {
    console.error('Error checking language availability:', error.message);
  }
  
  console.log('\n=== Java Testing Complete ===');
}

testJavaAvailability();
