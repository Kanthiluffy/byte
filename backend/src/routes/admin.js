const express = require('express');
const Problem = require('../models/Problem');
const User = require('../models/User');
const Submission = require('../models/Submission');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(auth, adminAuth);

// @route   POST /api/admin/problems
// @desc    Create a new problem
// @access  Private (Admin only)
router.post('/problems', async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      tags,
      constraints,
      timeLimit,
      memoryLimit,
      examples,
      testCases
    } = req.body;

    // Validation
    if (!title || !description || !difficulty) {
      return res.status(400).json({ 
        message: 'Title, description, and difficulty are required' 
      });
    }

    if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return res.status(400).json({ 
        message: 'Difficulty must be Easy, Medium, or Hard' 
      });
    }

    if (!testCases || testCases.length === 0) {
      return res.status(400).json({ 
        message: 'At least one test case is required' 
      });
    }

    // Create problem
    const problem = new Problem({
      title,
      description,
      difficulty,
      tags: tags || [],
      constraints: constraints || '',
      timeLimit: timeLimit || 5000,
      memoryLimit: memoryLimit || 128,
      examples: examples || [],
      testCases,
      createdBy: req.user._id
    });

    await problem.save();
    await problem.populate('createdBy', 'name');

    res.status(201).json({
      message: 'Problem created successfully',
      problem
    });
  } catch (error) {
    console.error('Create problem error:', error);
    res.status(500).json({ 
      message: 'Server error while creating problem' 
    });
  }
});

// @route   PUT /api/admin/problems/:id
// @desc    Update a problem
// @access  Private (Admin only)
router.put('/problems/:id', async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      tags,
      constraints,
      timeLimit,
      memoryLimit,
      examples,
      testCases,
      isActive
    } = req.body;

    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ 
        message: 'Problem not found' 
      });
    }

    // Update fields
    if (title) problem.title = title;
    if (description) problem.description = description;
    if (difficulty && ['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      problem.difficulty = difficulty;
    }
    if (tags !== undefined) problem.tags = tags;
    if (constraints !== undefined) problem.constraints = constraints;
    if (timeLimit) problem.timeLimit = timeLimit;
    if (memoryLimit) problem.memoryLimit = memoryLimit;
    if (examples !== undefined) problem.examples = examples;
    if (testCases !== undefined) problem.testCases = testCases;
    if (typeof isActive === 'boolean') problem.isActive = isActive;

    await problem.save();
    await problem.populate('createdBy', 'name');

    res.json({
      message: 'Problem updated successfully',
      problem
    });
  } catch (error) {
    console.error('Update problem error:', error);
    res.status(500).json({ 
      message: 'Server error while updating problem' 
    });
  }
});

// @route   DELETE /api/admin/problems/:id
// @desc    Delete a problem
// @access  Private (Admin only)
router.delete('/problems/:id', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ 
        message: 'Problem not found' 
      });
    }

    // Soft delete by setting isActive to false
    problem.isActive = false;
    await problem.save();

    res.json({
      message: 'Problem deleted successfully'
    });
  } catch (error) {
    console.error('Delete problem error:', error);
    res.status(500).json({ 
      message: 'Server error while deleting problem' 
    });
  }
});

// @route   GET /api/admin/problems
// @desc    Get all problems (including inactive)
// @access  Private (Admin only)
router.get('/problems', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      difficulty,
      isActive,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (difficulty && ['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      filter.difficulty = difficulty;
    }

    if (typeof isActive === 'string') {
      filter.isActive = isActive === 'true';
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get problems
    const problems = await Problem.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name');

    // Get total count for pagination
    const total = await Problem.countDocuments(filter);

    res.json({
      problems,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProblems: total,
        hasNextPage: skip + problems.length < total,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get admin problems error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching problems' 
    });
  }
});

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProblems = await Problem.countDocuments({ isActive: true });
    const totalSubmissions = await Submission.countDocuments();
    const acceptedSubmissions = await Submission.countDocuments({ status: 'Accepted' });

    // Get recent submissions
    const recentSubmissions = await Submission.find()
      .populate('userId', 'name')
      .populate('problemId', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get problems by difficulty
    const problemsByDifficulty = await Problem.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);

    // Get submissions by status
    const submissionsByStatus = await Submission.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      statistics: {
        totalUsers,
        totalProblems,
        totalSubmissions,
        acceptedSubmissions,
        acceptanceRate: totalSubmissions > 0 ? 
          Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0
      },
      recentSubmissions,
      problemsByDifficulty,
      submissionsByStatus
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching dashboard data' 
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (role && ['user', 'admin'].includes(role)) {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get users
    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalUsers: total,
        hasNextPage: skip + users.length < total,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching users' 
    });
  }
});

module.exports = router;
