# CodeJudge Platform - Testing Guide

## Quick Testing Checklist

### 🔧 Local Development Testing

**1. Backend Server**
```bash
cd backend
npm run dev
# Should start on http://localhost:5000
```

**2. Frontend Application**
```bash
cd frontend
npm run dev
# Should start on http://localhost:5173
```

**3. Database Connection**
- Ensure MongoDB Atlas connection string is correct in `.env`
- Run `node seed.js` to populate initial data

### 🧪 Core Features Testing

**Authentication Flow:**
1. Register new user
2. Login with existing user
3. Access admin dashboard (admin@codejudge.com / admin123)

**Problem Solving:**
1. Navigate to problems list
2. Select "Palindrome Number" or "Two Sum"
3. Write solution in Python/C++/Java
4. Submit and verify results

### 📝 Sample Test Solutions

**Python Palindrome Solution:**
```python
x = int(input().strip())

def is_palindrome(x):
    if x < 0:
        return False
    
    str_x = str(x)
    return str_x == str_x[::-1]

print(str(is_palindrome(x)).lower())
```

**C++ Two Sum Solution:**
```cpp
#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    int n, target;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }
    cin >> target;
    
    unordered_map<int, int> numMap;
    for (int i = 0; i < n; i++) {
        int complement = target - nums[i];
        if (numMap.find(complement) != numMap.end()) {
            cout << numMap[complement] << " " << i << endl;
            return 0;
        }
        numMap[nums[i]] = i;
    }
    
    return 0;
}
```

### 🚀 Deployment Testing

**Pre-deployment Checks:**
1. All environment variables configured
2. MongoDB connection working
3. All three languages (Python, C++, Java) executing correctly

**Post-deployment Verification:**
1. Health check: `https://your-app.onrender.com/api/health`
2. Language check: `https://your-app.onrender.com/api/test/languages`
3. Submit test solution and verify execution

### 🐛 Common Issues & Solutions

**"Python is not installed"**
- Fixed: Deployment now uses `python3` command
- Verify: Check language endpoint for availability

**"Time Limit Exceeded"**
- Ensure solutions are optimized
- Check for infinite loops
- Verify input/output format

**Authentication Errors**
- Check JWT_SECRET is set
- Verify CORS configuration
- Ensure FRONTEND_URL matches actual frontend domain

### 🔍 Debug Commands

**Test Language Availability:**
```bash
# In backend directory
curl http://localhost:5000/api/test/languages
```

**Check Problem Seeding:**
```bash
cd backend
node seed.js
```

**Monitor Logs:**
- Check browser console for frontend errors
- Check terminal output for backend errors
- Review Render deployment logs for production issues

### ✅ Success Criteria

- [ ] All three languages execute successfully
- [ ] Authentication works for both regular and admin users
- [ ] Problems can be created, edited, and solved
- [ ] Submissions are properly validated and scored
- [ ] Frontend loads without errors
- [ ] API endpoints respond correctly

---

For detailed troubleshooting, check the deployment logs or create an issue on GitHub.
