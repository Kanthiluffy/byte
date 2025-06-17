const mongoose = require('mongoose');
const Problem = require('./src/models/Problem');

async function removeDuplicateProblems() {
  try {
    await mongoose.connect('mongodb://localhost:27017/codejudge');
    
    console.log('🧹 Cleaning up duplicate problems...\n');
    
    // Find all problems with the same title
    const problemGroups = await Problem.aggregate([
      {
        $group: {
          _id: "$title",
          problems: { $push: "$$ROOT" },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);
    
    console.log(`Found ${problemGroups.length} groups of duplicate problems:`);
    
    for (const group of problemGroups) {
      console.log(`\n📋 Title: "${group._id}" (${group.count} duplicates)`);
      
      // Sort by creation date and keep the oldest one
      const sortedProblems = group.problems.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      const toKeep = sortedProblems[0];
      const toDelete = sortedProblems.slice(1);
      
      console.log(`   ✅ Keeping: ${toKeep._id} (created: ${toKeep.createdAt})`);
      
      for (const problem of toDelete) {
        console.log(`   🗑️  Deleting: ${problem._id} (created: ${problem.createdAt})`);
        await Problem.findByIdAndDelete(problem._id);
      }
    }
    
    // Show final count
    const finalCount = await Problem.countDocuments();
    console.log(`\n🎉 Cleanup complete! Total problems remaining: ${finalCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning up duplicates:', error);
    process.exit(1);
  }
}

removeDuplicateProblems();
