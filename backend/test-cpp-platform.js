const codeExecutor = require('./src/services/codeExecutor');
const os = require('os');

// Test C++ Two Sum solution
const cppCode = `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    vector<int> nums;
    int num, target;
    
    // Read numbers until we can't read anymore
    while (cin >> num) {
        nums.push_back(num);
    }
    
    // Last number is target
    target = nums.back();
    nums.pop_back();
    
    unordered_map<int, int> map;
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (map.find(complement) != map.end()) {
            cout << map[complement] << " " << i << endl;
            return 0;
        }
        map[nums[i]] = i;
    }
    
    return 0;
}`;

const testCases = [
  { input: "2 7 11 15\n9", expectedOutput: "0 1" },
  { input: "3 2 4\n6", expectedOutput: "1 2" },
  { input: "3 3\n6", expectedOutput: "0 1" }
];

async function testCppExecution() {
  console.log('=== Testing C++ Code Execution ===');
  console.log(`Platform: ${os.platform()}`);
  console.log(`Is Windows: ${os.platform() === 'win32'}`);
  
  try {
    const result = await codeExecutor.executeCode(cppCode, 'cpp', testCases);
    console.log('\nExecution Result:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.status === 'Accepted') {
      console.log('\n✅ SUCCESS: C++ code executed successfully on this platform!');
    } else {
      console.log('\n❌ FAILED: C++ execution failed');
      console.log('Error:', result.error);
    }
    
  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error.message);
  }
}

testCppExecution();
