const express = require('express');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const { auth } = require('../middleware/auth');
const codeExecutor = require('../services/codeExecutor');

const router = express.Router();

// @route   POST /api/submissions
// @desc    Submit code for a problem
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { problemId, code, language } = req.body;

    // Validation
    if (!problemId || !code || !language) {
      return res.status(400).json({ 
        message: 'Problem ID, code, and language are required' 
      });
    }

    if (!['javascript', 'python', 'cpp', 'java'].includes(language)) {
      return res.status(400).json({ 
        message: 'Unsupported programming language' 
      });
    }

    // Check if problem exists
    const problem = await Problem.findOne({ 
      _id: problemId, 
      isActive: true 
    });

    if (!problem) {
      return res.status(404).json({ 
        message: 'Problem not found' 
      });
    }

    // Create submission record
    const submission = new Submission({
      userId: req.user._id,
      problemId,
      code,
      language,
      status: 'Pending'
    });

    await submission.save();

    // Return submission ID immediately
    res.status(201).json({
      message: 'Code submitted successfully',
      submissionId: submission._id,
      status: 'Pending'
    });

    // Execute code asynchronously
    executeSubmission(submission, problem);

  } catch (error) {
    console.error('Submit code error:', error);
    res.status(500).json({ 
      message: 'Server error during code submission' 
    });
  }
});

// @route   GET /api/submissions/:id
// @desc    Get submission result
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('problemId', 'title difficulty')
      .populate('userId', 'name');

    if (!submission) {
      return res.status(404).json({ 
        message: 'Submission not found' 
      });
    }

    // Check if user owns the submission or is admin
    if (submission.userId._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied' 
      });
    }

    res.json(submission);
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching submission' 
    });
  }
});

// @route   GET /api/submissions/user/:userId
// @desc    Get user's submissions
// @access  Private
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status, problemId } = req.query;

    // Check if user can access these submissions
    if (userId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied' 
      });
    }

    // Build filter
    const filter = { userId };
    if (status) filter.status = status;
    if (problemId) filter.problemId = problemId;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get submissions
    const submissions = await Submission.find(filter)
      .populate('problemId', 'title difficulty')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Submission.countDocuments(filter);

    res.json({
      submissions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalSubmissions: total,
        hasNextPage: skip + submissions.length < total,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get user submissions error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching submissions' 
    });
  }
});

// @route   GET /api/submissions/problem/:problemId
// @desc    Get submissions for a specific problem
// @access  Private (Admin only)
router.get('/problem/:problemId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    const { problemId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    // Build filter
    const filter = { problemId };
    if (status) filter.status = status;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get submissions
    const submissions = await Submission.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Submission.countDocuments(filter);

    res.json({
      submissions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalSubmissions: total,
        hasNextPage: skip + submissions.length < total,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get problem submissions error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching problem submissions' 
    });
  }
});

// Async function to execute submission
async function executeSubmission(submission, problem) {
  let timeoutId;
  
  try {
    // Update status to Running
    submission.status = 'Running';
    await submission.save();

    // Set a maximum timeout for the entire execution (60 seconds)
    const maxExecutionTime = 60000;
    
    const executionPromise = codeExecutor.executeCode(
      submission.code,
      submission.language,
      problem.testCases,
      problem.timeLimit
    );

    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('Execution timeout - maximum time exceeded'));
      }, maxExecutionTime);
    });

    // Race between execution and timeout
    const result = await Promise.race([executionPromise, timeoutPromise]);
    
    // Clear timeout if execution completed
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Update submission with results
    submission.status = result.status;
    submission.testCaseResults = result.testCaseResults || [];
    submission.totalTestCases = result.totalTestCases || 0;
    submission.passedTestCases = result.passedTestCases || 0;
    submission.executionTime = result.executionTime || 0;
    submission.compilationError = result.error || '';

    // Calculate score
    submission.calculateScore();

    await submission.save();

    // Update problem statistics
    problem.totalSubmissions = (problem.totalSubmissions || 0) + 1;
    if (result.status === 'Accepted') {
      problem.successfulSubmissions = (problem.successfulSubmissions || 0) + 1;
    }
    problem.updateAcceptanceRate();
    await problem.save();

  } catch (error) {
    console.error('Execute submission error:', error);
    
    // Clear timeout if it was set
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Update submission with error
    submission.status = 'Internal Error';
    submission.compilationError = error.message || 'Internal server error during execution';
    
    try {
      await submission.save();
    } catch (saveError) {
      console.error('Failed to save submission error state:', saveError);
    }
  }
}

module.exports = router;
