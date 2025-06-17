const express = require('express');
const Problem = require('../models/Problem');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/problems
// @desc    Get all problems with filters
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      difficulty,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    
    if (difficulty && ['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      filter.difficulty = difficulty;
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
      .select('title difficulty tags acceptanceRate totalSubmissions createdAt')
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
    console.error('Get problems error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching problems' 
    });
  }
});

// @route   GET /api/problems/:id
// @desc    Get specific problem by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const problem = await Problem.findOne({ 
      _id: req.params.id, 
      isActive: true 
    }).populate('createdBy', 'name');

    if (!problem) {
      return res.status(404).json({ 
        message: 'Problem not found' 
      });
    }

    // Don't send hidden test cases to non-admin users
    let response = problem.toObject();
    if (!req.user || req.user.role !== 'admin') {
      response.testCases = problem.testCases.filter(tc => !tc.isHidden);
    }

    res.json(response);
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching problem' 
    });
  }
});

// @route   GET /api/problems/:id/stats
// @desc    Get problem statistics
// @access  Public
router.get('/:id/stats', async (req, res) => {
  try {
    const problem = await Problem.findOne({ 
      _id: req.params.id, 
      isActive: true 
    }).select('totalSubmissions successfulSubmissions acceptanceRate difficulty');

    if (!problem) {
      return res.status(404).json({ 
        message: 'Problem not found' 
      });
    }

    res.json({
      totalSubmissions: problem.totalSubmissions,
      successfulSubmissions: problem.successfulSubmissions,
      acceptanceRate: problem.acceptanceRate,
      difficulty: problem.difficulty
    });
  } catch (error) {
    console.error('Get problem stats error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching problem statistics' 
    });
  }
});

module.exports = router;
