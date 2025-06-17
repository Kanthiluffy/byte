const mongoose = require('mongoose');
const Problem = require('./src/models/Problem');
require('dotenv').config();

async function checkTestCases() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const problems = await Problem.find({}).limit(3);
    
    for (const problem of problems) {
      console.log(`\n=== ${problem.title} ===`);
      console.log(`Difficulty: ${problem.difficulty}`);
      console.log('Test Cases:');
      
      problem.testCases.forEach((tc, i) => {
        console.log(`  Test ${i+1}:`);
        console.log(`    Input: "${tc.input}"`);
        console.log(`    Expected: "${tc.expectedOutput}"`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkTestCases();
