// Enhanced code templates with problem-specific starters
export const codeTemplates = {
  javascript: {
    default: `// Write your solution here
function solution() {
    // Your code here
    return result;
}`,
    array: `// Array manipulation problem
function solution(arr) {
    // Process the array
    return result;
}`,
    string: `// String processing problem  
function solution(str) {
    // Process the string
    return result;
}`,
    twoSum: `// Two Sum Pattern
function twoSum(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    
    return [];
}`,
    palindrome: `// Palindrome Check
function isPalindrome(s) {
    // Remove non-alphanumeric and convert to lowercase
    const cleaned = s.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    
    let left = 0;
    let right = cleaned.length - 1;
    
    while (left < right) {
        if (cleaned[left] !== cleaned[right]) {
            return false;
        }
        left++;
        right--;
    }
    
    return true;
}`
  },
  
  python: {
    default: `# Write your solution here
def solution():
    # Your code here
    return result`,
    array: `# Array manipulation problem
def solution(arr):
    # Process the array
    return result`,
    string: `# String processing problem
def solution(s):
    # Process the string
    return result`,
    twoSum: `# Two Sum Pattern
def two_sum(nums, target):
    num_to_index = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_to_index:
            return [num_to_index[complement], i]
        num_to_index[num] = i
    
    return []`,
    palindrome: `# Palindrome Check
def is_palindrome(s):
    # Remove non-alphanumeric and convert to lowercase
    cleaned = ''.join(char.lower() for char in s if char.isalnum())
    
    left, right = 0, len(cleaned) - 1
    
    while left < right:
        if cleaned[left] != cleaned[right]:
            return False
        left += 1
        right -= 1
    
    return True`
  },
  
  cpp: {
    default: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    // Write your solution here
    return 0;
}`,
    array: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    vector<int> solution(vector<int>& arr) {
        // Process the array
        return {};
    }
};`,
    twoSum: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> numToIndex;
        
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (numToIndex.find(complement) != numToIndex.end()) {
                return {numToIndex[complement], i};
            }
            numToIndex[nums[i]] = i;
        }
        
        return {};
    }
};`
  },
  
  java: {
    default: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        // Write your solution here
    }
}`,
    array: `import java.util.*;

public class Solution {
    public int[] solution(int[] arr) {
        // Process the array
        return new int[]{};
    }
}`,
    twoSum: `import java.util.*;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> numToIndex = new HashMap<>();
        
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (numToIndex.containsKey(complement)) {
                return new int[]{numToIndex.get(complement), i};
            }
            numToIndex.put(nums[i], i);
        }
        
        return new int[]{};
    }
}`
  }
};

// Function to get appropriate template based on problem title/tags
export const getSmartTemplate = (language, problemTitle = '', tags = []) => {
  const titleLower = problemTitle.toLowerCase();
  const allTags = tags.map(tag => tag.toLowerCase());
  
  // Check for specific problem patterns
  if (titleLower.includes('two sum') || allTags.includes('two-pointers')) {
    return codeTemplates[language]?.twoSum || codeTemplates[language]?.default;
  }
  
  if (titleLower.includes('palindrome') || allTags.includes('palindrome')) {
    return codeTemplates[language]?.palindrome || codeTemplates[language]?.default;
  }
  
  if (allTags.includes('array') || allTags.includes('sorting')) {
    return codeTemplates[language]?.array || codeTemplates[language]?.default;
  }
  
  if (allTags.includes('string') || allTags.includes('string-manipulation')) {
    return codeTemplates[language]?.string || codeTemplates[language]?.default;
  }
  
  return codeTemplates[language]?.default || `// Write your solution here\n`;
};
