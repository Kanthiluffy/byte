const mongoose = require('mongoose');
const Problem = require('./src/models/Problem');
const Submission = require('./src/models/Submission');
const User = require('./src/models/User');
const codeExecutor = require('./src/services/codeExecutor');
require('dotenv').config();

async function testRealSubmission() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get a user and the palindrome problem
    const user = await User.findOne({ email: 'user@codejudge.com' });
    const problem = await Problem.findOne({ title: 'Palindrome Number' });

    if (!user || !problem) {
      console.log('User or problem not found');
      return;
    }

    console.log('=== Simulating Real Frontend Submission ===');
    
    const submissionCode = `const num = parseInt(require('fs').readFileSync(0, 'utf8').trim());

function isPalindrome(x) {
  if (x < 0) return false;
  const str = x.toString();
  return str === str.split('').reverse().join('');
}

console.log(isPalindrome(num));`;

    console.log('Creating submission...');
    const submission = new Submission({
      userId: user._id,
      problemId: problem._id,
      code: submissionCode,
      language: 'javascript',
      status: 'Pending'
    });

    await submission.save();
    console.log('Submission created with ID:', submission._id);

    console.log('Executing code...');
    const startTime = Date.now();
    
    try {
      const result = await codeExecutor.executeCode(
        submissionCode,
        'javascript',
        problem.testCases,
        5000 // 5 second timeout like in production
      );

      const executionTime = Date.now() - startTime;
      console.log(`Execution completed in ${executionTime}ms`);
      console.log('Execution result:', JSON.stringify(result, null, 2));

      // Update the submission
      submission.status = result.status;
      submission.testCaseResults = result.testCaseResults;
      submission.passedTestCases = result.passedTestCases;
      submission.totalTestCases = result.totalTestCases;
      submission.executionTime = result.executionTime;
      submission.compilationError = result.error;

      await submission.save();
      console.log('Submission updated successfully');

      // Clean up
      await Submission.deleteOne({ _id: submission._id });
      console.log('Test submission cleaned up');

    } catch (error) {
      console.error('Code execution error:', error);
      
      submission.status = 'Runtime Error';
      submission.compilationError = error.message;
      await submission.save();
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testRealSubmission();
