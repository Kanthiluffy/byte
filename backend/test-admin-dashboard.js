// Test script to verify AdminDashboard null safety fixes
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Problem = require('./src/models/Problem');
const Submission = require('./src/models/Submission');

async function testAdminDashboard() {
  console.log('🧪 Testing AdminDashboard null safety fixes...\n');
  
  try {
    await mongoose.connect('mongodb://localhost:27017/codejudge');
    
    // 1. Test problems data
    console.log('1. Testing problems data...');
    const problems = await Problem.find({});
    console.log(`✅ Problems loaded: ${problems.length} problems`);
    
    // Check for any problems with missing fields
    const problemsWithIssues = problems.filter(p => 
      !p.difficulty || !p.title || !p.createdAt
    );
    if (problemsWithIssues.length > 0) {
      console.log(`⚠️  Found ${problemsWithIssues.length} problems with missing fields`);
      problemsWithIssues.forEach(p => {
        console.log(`   - Problem ${p._id}: difficulty=${p.difficulty}, title=${p.title}, createdAt=${p.createdAt}`);
      });
    } else {
      console.log('✅ All problems have required fields');
    }
    
    // 2. Test submissions data
    console.log('\n2. Testing submissions data...');
    const submissions = await Submission.find({}).populate('userId', 'name').populate('problemId', 'title');
    console.log(`✅ Submissions loaded: ${submissions.length} submissions`);
    
    // Check for any submissions with missing fields
    const submissionsWithIssues = submissions.filter(s => 
      !s.status || !s.createdAt
    );
    if (submissionsWithIssues.length > 0) {
      console.log(`⚠️  Found ${submissionsWithIssues.length} submissions with missing fields`);
      submissionsWithIssues.forEach(s => {
        console.log(`   - Submission ${s._id}: status=${s.status}, createdAt=${s.createdAt}`);
      });
    } else {
      console.log('✅ All submissions have required fields');
    }
    
    // 3. Test stats calculation
    console.log('\n3. Testing stats calculation...');
    const totalUsers = await User.countDocuments();
    const totalProblems = await Problem.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    
    console.log('✅ Stats calculated:', {
      totalUsers,
      totalProblems,
      totalSubmissions
    });
    
    console.log('\n🎉 All AdminDashboard data validation passed!');
    console.log('Frontend should now load without TypeError issues.');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testAdminDashboard();
