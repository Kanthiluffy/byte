const mongoose = require('mongoose');
const Problem = require('./src/models/Problem');

async function checkProblems() {
  try {
    await mongoose.connect('mongodb://localhost:27017/codejudge');
    const problems = await Problem.find({});
    console.log('Total problems:', problems.length);
    
    problems.forEach((p, i) => {
      console.log(`Problem ${i + 1}:`, {
        id: p._id,
        title: p.title,
        difficulty: p.difficulty,
        difficultyType: typeof p.difficulty,
        hasNullDifficulty: p.difficulty === null,
        hasUndefinedDifficulty: p.difficulty === undefined
      });
    });
    
    const problemsWithNullDifficulty = problems.filter(p => p.difficulty === null || p.difficulty === undefined);
    console.log('\nProblems with null/undefined difficulty:', problemsWithNullDifficulty.length);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkProblems();
