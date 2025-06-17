const mongoose = require('mongoose');
const Submission = require('./src/models/Submission');
const Problem = require('./src/models/Problem');
const User = require('./src/models/User');
const codeExecutor = require('./src/services/codeExecutor');
require('dotenv').config();

async function testSubmissionValidation() {
  try {
    console.log('\n🧪 Testing Submission Validation Fixes...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get test data
    const user = await User.findOne({ email: 'user@codejudge.com' });
    const problem = await Problem.findOne({ title: 'Palindrome Number' });

    if (!user || !problem) {
      console.error('❌ Test user or problem not found');
      return;
    }

    console.log(`👤 User: ${user.email}`);
    console.log(`📝 Problem: ${problem.title}`);

    // Test Python code
    const pythonCode = `x = int(input().strip())

def is_palindrome(x):
    if x < 0:
        return False
    
    str_x = str(x)
    return str_x == str_x[::-1]

print(str(is_palindrome(x)).lower())`;

    console.log('\n🔄 Executing Python code...');
    const result = await codeExecutor.executeCode(pythonCode, 'python', problem.testCases, 10000);

    console.log(`📊 Execution Result: ${result.status}`);
    console.log(`✅ Passed: ${result.passedTestCases}/${result.totalTestCases}`);

    // Create a submission with the results
    console.log('\n💾 Creating submission...');
    const submission = new Submission({
      userId: user._id,
      problemId: problem._id,
      code: pythonCode,
      language: 'python',
      status: result.status,
      totalTestCases: result.totalTestCases,
      passedTestCases: result.passedTestCases,
      executionTime: result.executionTime,
      testCaseResults: result.testCaseResults
    });

    // Calculate score
    submission.calculateScore();

    // Try to save the submission
    await submission.save();
    console.log(`✅ Submission saved successfully! ID: ${submission._id}`);
    console.log(`🏆 Score: ${submission.score}/100`);

    // Verify the submission data
    const savedSubmission = await Submission.findById(submission._id);
    console.log('\n📋 Saved Submission Details:');
    console.log(`   Status: ${savedSubmission.status}`);
    console.log(`   Test Cases: ${savedSubmission.passedTestCases}/${savedSubmission.totalTestCases}`);
    console.log(`   Test Case Results:`);
    
    savedSubmission.testCaseResults.forEach((tcResult, i) => {
      console.log(`     Test ${i+1}: ${tcResult.status} - ${tcResult.passed ? 'PASS' : 'FAIL'}`);
      console.log(`       Input: "${tcResult.input}"`);
      console.log(`       Expected: "${tcResult.expectedOutput}"`);
      console.log(`       Got: "${tcResult.actualOutput}"`);
    });

    console.log('\n🎉 All validation tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.name === 'ValidationError') {
      console.error('Validation errors:');
      Object.keys(error.errors).forEach(key => {
        console.error(`  ${key}: ${error.errors[key].message}`);
      });
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testSubmissionValidation();
