const mongoose = require('mongoose');
require('dotenv').config();

const Submission = require('./src/models/Submission');
const Problem = require('./src/models/Problem');
const codeExecutor = require('./src/services/codeExecutor');

mongoose.connect(process.env.MONGODB_URI);

async function testPalindromeSubmission() {
  try {
    console.log('\n🔍 Testing Palindrome Submission that was timing out in frontend...\n');

    // Get the Palindrome Number problem
    const problem = await Problem.findOne({ title: 'Palindrome Number' });
    if (!problem) {
      console.error('❌ Palindrome Number problem not found');
      return;
    }

    console.log(`📝 Problem: ${problem.title}`);
    console.log(`🧪 Test Cases: ${problem.testCases.length}`);

    // Test the EXACT code the user submitted
    const userCode = `const num = parseInt(require('fs').readFileSync(0, 'utf8').trim());

function isPalindrome(x) {
  if (x < 0) return false;
  const str = x.toString();
  return str === str.split('').reverse().join('');
}

console.log(isPalindrome(num));`;

    console.log('\n📝 User Code:');
    console.log(userCode);

    // Create a submission
    const submission = new Submission({
      userId: new mongoose.Types.ObjectId(), // Dummy user ID
      problemId: problem._id,
      code: userCode,
      language: 'javascript',
      status: 'Pending'
    });

    await submission.save();
    console.log(`\n✅ Submission created: ${submission._id}`);
    console.log(`⏳ Initial status: ${submission.status}`);

    // Start timer
    const startTime = Date.now();

    // Simulate the executeSubmission function exactly as backend does
    console.log('\n🚀 Starting execution...');
    
    // Update to Running
    submission.status = 'Running';
    await submission.save();
    console.log(`⚡ Status updated to: ${submission.status} (${Date.now() - startTime}ms)`);

    // Execute code with exact same logic as backend
    const result = await codeExecutor.executeCode(
      submission.code,
      submission.language,
      problem.testCases,
      problem.timeLimit
    );

    console.log(`\n🏁 Execution completed (${Date.now() - startTime}ms)`);
    console.log(`📊 Result: ${result.status}`);
    console.log(`✅ Passed: ${result.passedTestCases}/${result.totalTestCases}`);
    
    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
    }

    // Show individual test case results
    console.log('\n📋 Test Case Results:');
    result.testCaseResults.forEach((tcResult, i) => {
      console.log(`  Test ${i+1}: ${tcResult.status} (${tcResult.executionTime}ms)`);
      if (tcResult.status === 'Wrong Answer') {
        console.log(`    Expected: ${tcResult.expectedOutput}`);
        console.log(`    Got: ${tcResult.actualOutput}`);
      }
    });

    // Update submission with results
    submission.status = result.status;
    submission.testCaseResults = result.testCaseResults || [];
    submission.totalTestCases = result.totalTestCases || 0;
    submission.passedTestCases = result.passedTestCases || 0;
    submission.executionTime = result.executionTime || 0;
    submission.compilationError = result.error || '';

    submission.calculateScore();
    await submission.save();

    const finalTime = Date.now() - startTime;
    console.log(`\n💾 Final status saved: ${submission.status} (${finalTime}ms total)`);

    // Simulate frontend polling with exact same intervals
    console.log('\n🔄 Simulating Frontend Polling (30 attempts, 1 second each)...');
    
    for (let attempt = 1; attempt <= 5; attempt++) {
      const polledSubmission = await Submission.findById(submission._id);
      console.log(`📡 Poll #${attempt}: Status = ${polledSubmission.status} (${Date.now() - startTime}ms from start)`);
      
      // Check the exact same condition as frontend
      if (polledSubmission.status !== 'Pending' && polledSubmission.status !== 'Running') {
        console.log(`🎯 Frontend would stop polling here with result: ${polledSubmission.status}`);
        console.log(`⏱️  Total time from submission to result: ${Date.now() - startTime}ms`);
        break;
      }
      
      console.log('   ⏳ Status is still Pending/Running, continuing to poll...');
      // Wait 1 second like frontend does
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Clean up
    await Submission.findByIdAndDelete(submission._id);
    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testPalindromeSubmission();
