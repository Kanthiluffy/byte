# CodeJudge Platform - Testing Guide

## 🧪 Comprehensive Test Checklist

### Server Status
- ✅ Backend running on http://localhost:5000
- ✅ Frontend running on http://localhost:5173
- ✅ Database seeded with test data

### Test Accounts
- **Admin**: admin@codejudge.com / admin123
- **User**: user@codejudge.com / user123

---

## 📋 Feature Testing Checklist

### 1. Authentication System
#### Login/Register
- [ ] Register new user with email/password
- [ ] Login with existing credentials
- [ ] Login with Google OAuth
- [ ] Toast notifications for success/error
- [ ] Protected route redirects
- [ ] Logout functionality

#### Test Cases:
1. Try registering with invalid email format
2. Try registering with weak password
3. Try logging in with wrong credentials
4. Try accessing /dashboard without login
5. Login and verify JWT token storage

### 2. User Dashboard
#### Features to Test:
- [ ] Recent problems display
- [ ] Problem difficulty badges
- [ ] Navigation to problem details
- [ ] Responsive design on mobile/tablet

#### Test Cases:
1. Login as regular user and check dashboard
2. Verify all 10 problems are displayed
3. Check difficulty color coding (Easy=green, Medium=orange, Hard=red)
4. Resize window to test responsiveness

### 3. Problem Solving Interface
#### Monaco Editor Integration:
- [ ] Code editor loads properly
- [ ] Language switching (JavaScript, Python, C++, Java)
- [ ] Syntax highlighting works
- [ ] Code templates load for each language
- [ ] Editor resizes properly

#### Code Submission:
- [ ] Submit code and see loading toast
- [ ] Real-time result polling
- [ ] Success/failure toast notifications
- [ ] Test case results display
- [ ] Compilation error handling

#### Test Cases:
1. **Palindrome Problem** - Try this C++ solution:
```c++
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

2. **Palindrome Problem** - Try this Java solution:
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

2. **Fibonacci Number** - Try this Python solution:
```python
def solution(n):
    if n <= 1:
        return n
    return solution(n-1) + solution(n-2)
```

3. **Wrong Answer Test** - Submit incorrect code to see error handling
4. **Compilation Error Test** - Submit syntax error to test error display

### 4. Admin Dashboard
#### Access Control:
- [ ] Login as admin user
- [ ] Admin-only routes protected
- [ ] Regular users cannot access admin features

#### Problem Management:
- [ ] View all problems in admin dashboard
- [ ] Create new problem with form validation
- [ ] Edit existing problem
- [ ] Delete problem with confirmation
- [ ] Toast notifications for CRUD operations

#### Dashboard Statistics:
- [ ] Total problems count
- [ ] Total users count
- [ ] Recent submissions display

#### Test Cases:
1. Login as admin@codejudge.com
2. Navigate to admin dashboard
3. Try creating a new problem:
   - Title: "Test Problem"
   - Description: "A test problem for validation"
   - Difficulty: "Easy"
   - Add test cases
4. Edit an existing problem
5. Delete a test problem

### 5. Responsive Design
#### Breakpoints to Test:
- [ ] Desktop (1200px+)
- [ ] Tablet (768px - 1199px)
- [ ] Mobile (up to 767px)

#### Components to Test:
- [ ] Navbar collapses on mobile
- [ ] Problem layout switches to vertical on tablets
- [ ] Monaco Editor adjusts height appropriately
- [ ] Form elements stack properly on mobile

### 6. Error Handling & Edge Cases
#### Network Errors:
- [ ] Offline behavior
- [ ] Server disconnection handling
- [ ] Timeout scenarios

#### Validation:
- [ ] Empty form submissions
- [ ] Invalid input formats
- [ ] SQL injection attempts (should be prevented)
- [ ] XSS attempts (should be sanitized)

---

## 🎯 Key Areas to Focus On

### 1. Monaco Editor Performance
- Check if editor loads quickly
- Verify smooth language switching
- Test code completion (if available)
- Ensure proper syntax highlighting

### 2. Code Execution
- Verify all 4 languages work (JavaScript, Python, C++, Java)
- Test timeout handling (5-second limit)
- Check memory limit enforcement
- Verify secure sandbox execution

### 3. Real-time Features
- Submission polling works correctly
- Toast notifications appear at right time
- Loading states are clear
- Error messages are helpful

### 4. Security Features
- CORS protection
- JWT token validation
- Input sanitization
- SQL injection prevention
- XSS protection

---

## 🐛 Known Issues to Watch For

1. **Monaco Editor**: May take a moment to load initially
2. **Code Execution**: Timeout handling might need adjustment
3. **Toast Notifications**: Should not overlap or persist too long
4. **Mobile Layout**: Monaco Editor height might need fine-tuning

---

## 🚀 Performance Benchmarks

### Expected Load Times:
- Home page: < 2 seconds
- Dashboard: < 3 seconds  
- Problem detail: < 2 seconds
- Code submission: < 10 seconds (including execution)

### Expected Features:
- ✅ Full CRUD operations for admin
- ✅ Real-time code execution
- ✅ Responsive design
- ✅ Toast notifications
- ✅ JWT authentication
- ✅ Google OAuth integration
- ✅ Monaco Editor integration
- ✅ Multi-language support

---

## 📞 Testing Commands

```bash
# Start both servers
cd backend && npm run dev
cd frontend && npm run dev

# Add test data
cd backend && node seed.js
cd backend && node add-test-problems.js

# Access points
Frontend: http://localhost:5173
Backend API: http://localhost:5000
```

Happy testing! 🧪✨
