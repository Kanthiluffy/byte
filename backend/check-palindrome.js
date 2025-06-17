const mongoose = require('mongoose');
require('dotenv').config();
const Problem = require('./src/models/Problem');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  try {
    const problem = await Problem.findOne({ title: 'Palindrome Number' });
    console.log('Palindrome Number Test Cases:');
    problem.testCases.forEach((tc, i) => {
      console.log(`Test ${i+1}:`);
      console.log(`  Input: ${tc.input}`);
      console.log(`  Expected: ${tc.expectedOutput}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
});
