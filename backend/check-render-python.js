const axios = require('axios');

async function checkRenderDeployment() {
    console.log('🔍 Checking Render Deployment Language Support...\n');

    // Your Render URL - replace with your actual URL
    const RENDER_URL = process.env.RENDER_URL || 'https://your-app-name.onrender.com';
    
    console.log(`🌐 Testing: ${RENDER_URL}`);
    
    const tests = [
        {
            name: 'Health Check',
            endpoint: '/api/health',
            description: 'Basic server health and language versions'
        },
        {
            name: 'Python Availability Check', 
            endpoint: '/api/test/python',
            method: 'POST',
            data: {
                code: 'print("Python is working!")',
                input: ''
            },
            description: 'Direct Python execution test'
        }
    ];

    for (const test of tests) {
        try {
            console.log(`\n📋 ${test.name}:`);
            console.log(`   ${test.description}`);
            
            const config = {
                method: test.method || 'GET',
                url: `${RENDER_URL}${test.endpoint}`,
                timeout: 15000,
                validateStatus: () => true // Don't throw on any status
            };
            
            if (test.data) {
                config.data = test.data;
                config.headers = { 'Content-Type': 'application/json' };
            }

            const response = await axios(config);
            
            console.log(`   Status: ${response.status}`);
            
            if (response.status === 200) {
                console.log(`   ✅ SUCCESS`);
                if (response.data) {
                    console.log(`   Response:`, JSON.stringify(response.data, null, 2));
                }
            } else {
                console.log(`   ❌ FAILED`);
                console.log(`   Error:`, response.data || response.statusText);
            }
            
        } catch (error) {
            console.log(`   ❌ ERROR: ${error.message}`);
            if (error.code === 'ECONNREFUSED') {
                console.log('   💡 Tip: Make sure your Render service is running');
            }
        }
    }

    console.log('\n📝 Manual Test Instructions:');
    console.log('1. Go to your Render dashboard');
    console.log('2. Check the latest deployment logs');
    console.log('3. Verify the Docker build completed successfully');
    console.log('4. Look for "python3 --version" in the build output');
    console.log('5. If Python is missing, trigger a new deployment');
    
    console.log('\n🔧 If Python is still missing:');
    console.log('1. Make sure your latest Dockerfile is pushed to GitHub');
    console.log('2. Trigger a manual deploy in Render dashboard');
    console.log('3. Or try using the Ubuntu Dockerfile alternative');
}

// Helper function to create a test endpoint
function createTestEndpoint() {
    console.log('\n🛠️  Add this test endpoint to your backend (server.js):');
    console.log(`
app.post('/api/test/python', async (req, res) => {
  try {
    const { exec } = require('child_process');
    
    exec('python3 --version', (error, stdout, stderr) => {
      if (error) {
        return res.json({
          available: false,
          error: error.message,
          message: 'Python is not installed on this server'
        });
      }
      
      res.json({
        available: true,
        version: stdout.trim(),
        message: 'Python is available'
      });
    });
  } catch (error) {
    res.json({
      available: false,
      error: error.message
    });
  }
});
`);
}

// Main execution
async function main() {
    console.log('🚀 Render Python Deployment Checker\n');
    
    console.log('💡 Instructions:');
    console.log('1. Replace RENDER_URL with your actual Render app URL');
    console.log('2. Make sure your latest Dockerfile is deployed');
    console.log('3. Check deployment logs for Python installation\n');
    
    createTestEndpoint();
    
    await checkRenderDeployment();
}

main().catch(console.error);
