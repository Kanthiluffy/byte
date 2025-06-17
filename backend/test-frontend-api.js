const http = require('http');

const API_URL = 'http://localhost:5000';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${parsed.message || body}`));
          } else {
            resolve(parsed);
          }
        } catch (err) {
          reject(new Error(`Invalid JSON: ${body}`));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testFrontendFlow() {
  try {
    console.log('\n🌐 Testing Frontend API Flow for Palindrome Timeout Issue...\n');

    // First, login to get a token
    console.log('🔐 Logging in...');    const loginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'user@codejudge.com',
      password: 'user123'
    });

    const token = loginResponse.token;
    const authHeaders = { 'Authorization': `Bearer ${token}` };
    console.log('✅ Login successful');

    // Get the Palindrome Number problem
    console.log('\n📝 Fetching Palindrome Number problem...');
    const problemsResponse = await makeRequest('GET', '/api/problems', null, authHeaders);
    const palindromeProblem = problemsResponse.problems.find(p => p.title === 'Palindrome Number');
    
    if (!palindromeProblem) {
      console.error('❌ Palindrome Number problem not found');
      return;
    }

    console.log(`✅ Found problem: ${palindromeProblem.title} (ID: ${palindromeProblem._id})`);

    // Submit the user's code
    const userCode = `const num = parseInt(require('fs').readFileSync(0, 'utf8').trim());

function isPalindrome(x) {
  if (x < 0) return false;
  const str = x.toString();
  return str === str.split('').reverse().join('');
}

console.log(isPalindrome(num));`;

    console.log('\n📤 Submitting code...');
    const startTime = Date.now();
    
    const submitResponse = await makeRequest('POST', '/api/submissions', {
      problemId: palindromeProblem._id,
      code: userCode,
      language: 'javascript'
    }, authHeaders);

    const submissionId = submitResponse.submissionId;
    console.log(`✅ Submission created: ${submissionId}`);
    console.log(`⏳ Initial status: ${submitResponse.status}`);

    // Simulate frontend polling exactly
    console.log('\n🔄 Starting frontend-style polling...');
    const maxAttempts = 30;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        console.log(`📡 Poll attempt #${attempts + 1} (${Date.now() - startTime}ms from start)`);
        
        const result = await makeRequest('GET', `/api/submissions/${submissionId}`, null, authHeaders);

        console.log(`   Status: ${result.status}`);

        // Check the exact same condition as frontend
        if (result.status !== 'Pending' && result.status !== 'Running') {
          console.log(`\n🎯 Polling complete! Final status: ${result.status}`);
          console.log(`⏱️  Total time: ${Date.now() - startTime}ms`);
          console.log(`✅ Passed: ${result.passedTestCases}/${result.totalTestCases}`);
          
          if (result.status === 'Accepted') {
            console.log('🎉 SUCCESS: Frontend would show "Congratulations!"');
          } else {
            console.log(`❌ FAILURE: Frontend would show "${result.status}"`);
          }
          
          return; // Exit successfully
        }

        attempts++;
        
        if (attempts < maxAttempts) {
          console.log(`   ⏳ Still ${result.status}, waiting 1 second...`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        } else {
          console.log(`\n⚠️  TIMEOUT: Reached ${maxAttempts} attempts`);
          console.log(`🚨 Frontend would show "Submission timed out"`);
          console.log(`⏱️  Total time: ${Date.now() - startTime}ms`);
          return;
        }      } catch (err) {
        console.error(`❌ Error during poll #${attempts + 1}:`, err.message);
        console.error(`   Error details:`, err);
        attempts++;
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Wait a bit for server to start, then run test
setTimeout(testFrontendFlow, 2000);
