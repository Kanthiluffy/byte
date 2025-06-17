const axios = require('axios');

async function verifyRenderDeployment() {
    console.log('🚀 Verifying Render.com deployment...\n');

    // Your Render backend URL - update this when you have it
    const RENDER_URL = process.env.RENDER_URL || 'https://your-app-name.onrender.com';
    
    const tests = [
        {
            name: 'Health Check',
            url: `${RENDER_URL}/api/health`,
            expectedStatus: 200
        },
        {
            name: 'Get Problems',
            url: `${RENDER_URL}/api/problems`,
            expectedStatus: 200
        },
        {
            name: 'Language Support Check',
            url: `${RENDER_URL}/api/test/languages`,
            expectedStatus: 200,
            method: 'GET'
        }
    ];

    let passedTests = 0;
    let totalTests = tests.length;

    for (const test of tests) {
        try {
            console.log(`Testing: ${test.name}...`);
            
            const response = await axios({
                method: test.method || 'GET',
                url: test.url,
                timeout: 10000,
                validateStatus: () => true // Don't throw on any status
            });

            if (response.status === test.expectedStatus) {
                console.log(`✅ ${test.name}: PASSED (${response.status})`);
                passedTests++;
            } else {
                console.log(`❌ ${test.name}: FAILED (Expected ${test.expectedStatus}, got ${response.status})`);
                if (response.data) {
                    console.log(`   Response: ${JSON.stringify(response.data).substring(0, 200)}...`);
                }
            }
        } catch (error) {
            console.log(`❌ ${test.name}: ERROR - ${error.message}`);
        }
        console.log('');
    }

    console.log(`\n📊 Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests passed! Deployment is working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Check the logs above.');
        console.log('\n🔧 Common issues:');
        console.log('   - Update RENDER_URL to your actual Render app URL');
        console.log('   - Ensure environment variables are set in Render dashboard');
        console.log('   - Check Render build logs for deployment errors');
        console.log('   - Verify MongoDB connection string is correct');
    }

    console.log('\n📋 Next steps:');
    console.log('   1. Update RENDER_URL in this script with your actual URL');
    console.log('   2. Set MONGODB_URI and FRONTEND_URL in Render dashboard');
    console.log('   3. Test frontend deployment separately');
    console.log('   4. Run end-to-end tests with real users');
}

// Also create a health check endpoint test
async function testHealthEndpoint() {
    console.log('\n🏥 Testing if health endpoint works locally...\n');
    
    try {
        const response = await axios.get('http://localhost:5000/api/health', {
            timeout: 5000
        });
        
        console.log('✅ Local health check:', response.data);
        return true;
    } catch (error) {
        console.log('❌ Local health check failed:', error.message);
        console.log('   Make sure your backend is running on port 5000');
        return false;
    }
}

// Main execution
async function main() {
    console.log('🔍 CodeJudge Render Deployment Verification\n');
    
    // Test local health first
    const localHealthy = await testHealthEndpoint();
    
    if (localHealthy) {
        console.log('\n✅ Local backend is healthy. Proceeding with Render verification...\n');
    } else {
        console.log('\n⚠️  Local backend not available. Skipping to Render verification...\n');
    }
    
    await verifyRenderDeployment();
}

main().catch(console.error);
