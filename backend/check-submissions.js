const mongoose = require('mongoose');
const User = require('./src/models/User');
const Problem = require('./src/models/Problem');
const Submission = require('./src/models/Submission');

async function checkSubmissions() {
  try {
    await mongoose.connect('mongodb://localhost:27017/codejudge');
    const submissions = await Submission.find({}).populate('userId', 'name').populate('problemId', 'title');
    console.log('Total submissions:', submissions.length);
    
    submissions.forEach((s, i) => {
      console.log(`Submission ${i + 1}:`, {
        id: s._id,
        status: s.status,
        statusType: typeof s.status,
        hasNullStatus: s.status === null,
        hasUndefinedStatus: s.status === undefined,
        userId: s.userId?.name || 'Unknown',
        problemId: s.problemId?.title || 'Unknown'
      });
    });
    
    const submissionsWithNullStatus = submissions.filter(s => s.status === null || s.status === undefined);
    console.log('\nSubmissions with null/undefined status:', submissionsWithNullStatus.length);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkSubmissions();
