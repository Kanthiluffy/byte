const mongoose = require('mongoose');
require('dotenv').config();

const Submission = require('./src/models/Submission');
const Problem = require('./src/models/Problem');
const codeExecutor = require('./src/services/codeExecutor');

mongoose.connect(process.env.MONGODB_URI);

async function testSubmissionFlow() {
  try {
    console.log('\n🔍 Testing Submission Flow for Frontend Timeout Issue...\n');

    // Get a problem (Two Sum)
    const problem = await Problem.findOne({ title: 'Two Sum' });
    if (!problem) {
      console.error('❌ Two Sum problem not found');
      return;
    }

    console.log(`📝 Problem: ${problem.title}`);
    console.log(`🧪 Test Cases: ${problem.testCases.length}`);    // Test the Two Sum code in the correct format
    const twoSumCode = `function twoSum(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        map.set(nums[i], i);
    }
    
    return [];
}

// Read input from stdin
const input = require('fs').readFileSync(0, 'utf8').trim().split('\\n');
const nums = input[0].split(' ').map(Number);
const target = parseInt(input[1]);

const result = twoSum(nums, target);
console.log(result.join(' '));`;

    // Create a submission
    const submission = new Submission({
      userId: new mongoose.Types.ObjectId(), // Dummy user ID
      problemId: problem._id,
      code: twoSumCode,
      language: 'javascript',
      status: 'Pending'
    });

    await submission.save();
    console.log(`✅ Submission created: ${submission._id}`);
    console.log(`⏳ Initial status: ${submission.status}`);

    // Start timer
    const startTime = Date.now();

    // Simulate the executeSubmission function
    console.log('\n🚀 Starting execution...');
    
    // Update to Running
    submission.status = 'Running';
    await submission.save();
    console.log(`⚡ Status updated to: ${submission.status} (${Date.now() - startTime}ms)`);

    // Execute code
    const result = await codeExecutor.executeCode(
      submission.code,
      submission.language,
      problem.testCases,
      problem.timeLimit
    );

    console.log(`🏁 Execution completed (${Date.now() - startTime}ms)`);
    console.log(`📊 Result: ${result.status}`);
    console.log(`✅ Passed: ${result.passedTestCases}/${result.totalTestCases}`);

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
    console.log(`💾 Final status saved: ${submission.status} (${finalTime}ms total)`);

    // Now simulate frontend polling
    console.log('\n🔄 Simulating Frontend Polling...');
    
    for (let attempt = 1; attempt <= 5; attempt++) {
      const polledSubmission = await Submission.findById(submission._id);
      console.log(`📡 Poll #${attempt}: Status = ${polledSubmission.status} (${Date.now() - startTime}ms)`);
      
      if (polledSubmission.status !== 'Pending' && polledSubmission.status !== 'Running') {
        console.log(`🎯 Frontend would stop polling here with result: ${polledSubmission.status}`);
        break;
      }
      
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

testSubmissionFlow();
