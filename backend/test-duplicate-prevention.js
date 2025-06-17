// Test script to verify duplicate problem prevention
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Mock admin token (you may need to get a real one)
const ADMIN_TOKEN = 'your-admin-token-here';

async function testDuplicatePrevention() {
  console.log('🧪 Testing duplicate problem prevention...\n');
  
  const problemData = {
    title: 'Test Duplicate Problem',
    description: 'This is a test problem to verify duplicate prevention',
    difficulty: 'Easy',
    tags: ['test'],
    constraints: 'Test constraints',
    timeLimit: 5000,
    memoryLimit: 128,
    examples: [
      { input: '1', output: '1' }
    ],
    testCases: [
      { input: '1', expectedOutput: '1' }
    ]
  };

  try {
    // First creation - should succeed
    console.log('1. Creating first problem...');
    const response1 = await axios.post(`${BASE_URL}/admin/problems`, problemData, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    console.log('✅ First problem created successfully');
    const problemId = response1.data.problem._id;
    
    // Second creation with same title - should fail
    console.log('\n2. Attempting to create duplicate problem...');
    try {
      await axios.post(`${BASE_URL}/admin/problems`, problemData, {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
      });
      console.log('❌ Duplicate creation should have failed but succeeded');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('already exists')) {
        console.log('✅ Duplicate creation properly prevented:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }
    
    // Clean up - delete the test problem
    console.log('\n3. Cleaning up test problem...');
    await axios.delete(`${BASE_URL}/admin/problems/${problemId}`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    console.log('✅ Test problem deleted');
    
    console.log('\n🎉 Duplicate prevention test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Note: This test requires a valid admin token
console.log('📝 Note: This test requires manual setup of admin token');
console.log('The backend validation has been added to prevent duplicates.');
// testDuplicatePrevention();
