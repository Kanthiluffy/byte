# CodeJudge Platform - Palindrome Number Solutions
# Test these codes to verify all languages work correctly

## Problem: Palindrome Number
**Description:** Given an integer x, return true if x is a palindrome, and false otherwise.

**Test Cases:**
- Input: 121 → Output: true
- Input: -121 → Output: false  
- Input: 10 → Output: false
- Input: 0 → Output: true

---

## 1. JavaScript Solution

```javascript
const num = parseInt(require('fs').readFileSync(0, 'utf8').trim());

function isPalindrome(x) {
  if (x < 0) return false;
  const str = x.toString();
  return str === str.split('').reverse().join('');
}

console.log(isPalindrome(num));
```

**Alternative JavaScript (without string conversion):**
```javascript
const num = parseInt(require('fs').readFileSync(0, 'utf8').trim());

function isPalindrome(x) {
  if (x < 0) return false;
  
  let original = x;
  let reversed = 0;
  
  while (x > 0) {
    reversed = reversed * 10 + x % 10;
    x = Math.floor(x / 10);
  }
  
  return original === reversed;
}

console.log(isPalindrome(num));
```

---

## 2. Python Solution

```python
x = int(input().strip())

def is_palindrome(x):
    if x < 0:
        return False
    
    str_x = str(x)
    return str_x == str_x[::-1]

print(str(is_palindrome(x)).lower())
```

**Alternative Python (without string conversion):**
```python
x = int(input().strip())

def is_palindrome(x):
    if x < 0:
        return False
    
    original = x
    reversed_num = 0
    
    while x > 0:
        reversed_num = reversed_num * 10 + x % 10
        x //= 10
    
    return original == reversed_num

print(str(is_palindrome(x)).lower())
```

---

## 3. C++ Solution

```cpp
#include <iostream>
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
}
```

**Alternative C++ (without string conversion):**
```cpp
#include <iostream>
using namespace std;

bool isPalindrome(int x) {
    if (x < 0) return false;
    
    long long original = x;
    long long reversed = 0;
    
    while (x > 0) {
        reversed = reversed * 10 + x % 10;
        x /= 10;
    }
    
    return original == reversed;
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
}
```

---

## 4. Java Solution

```java
import java.util.Scanner;

public class Solution {
    public static boolean isPalindrome(int x) {
        if (x < 0) return false;
        
        String str = String.valueOf(x);
        String reversed = new StringBuilder(str).reverse().toString();
        
        return str.equals(reversed);
    }
    
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int x = scanner.nextInt();
        
        System.out.println(isPalindrome(x));
        
        scanner.close();
    }
}
```

**Alternative Java (without string conversion):**
```java
import java.util.Scanner;

public class Solution {
    public static boolean isPalindrome(int x) {
        if (x < 0) return false;
        
        int original = x;
        int reversed = 0;
        
        while (x > 0) {
            reversed = reversed * 10 + x % 10;
            x /= 10;
        }
        
        return original == reversed;
    }
    
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int x = scanner.nextInt();
        
        System.out.println(isPalindrome(x));
        
        scanner.close();
    }
}
```

---

## Testing Instructions

1. **Copy any of the above solutions**
2. **Select the appropriate language** in the CodeJudge editor
3. **Paste the code** and submit
4. **Expected result:** All test cases should pass with "Accepted" status

## Key Points for CodeJudge Platform

### ✅ Do:
- Read input directly from stdin
- Output only the required result
- Use standard input/output methods
- Follow the exact output format expected

### ❌ Don't:
- Use interactive prompts (`readline`, `input()` with prompts)
- Add extra output messages
- Use `alert()`, `prompt()`, or GUI elements
- Forget to handle edge cases (negative numbers)

### Language-Specific Notes:

**JavaScript:**
- Use `require('fs').readFileSync(0, 'utf8').trim()` for input
- Output boolean as string: `true`/`false`

**Python:**
- Use `input().strip()` for input
- Convert boolean to lowercase string: `str(result).lower()`

**C++:**
- Use `cin` for input, `cout` for output
- Output boolean as string: `"true"`/`"false"`

**Java:**
- Use `Scanner` for input, `System.out.println()` for output
- Class must be named `Solution`
- Output boolean directly: `true`/`false`

All these solutions will execute in under 1 second and should receive "Accepted" status on your CodeJudge platform!
