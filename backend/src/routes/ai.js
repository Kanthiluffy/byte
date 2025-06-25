const express = require('express');
const { auth } = require('../middleware/auth');
const { aiCodeReview, aiHint } = require('../services/aiService');
const Problem = require('../models/Problem');

const router = express.Router();

// @route   POST /api/ai/code-review
// @desc    Get AI code review for submitted code
// @access  Private
router.post('/code-review', auth, async (req, res) => {
    try {
        const { code, language = 'javascript' } = req.body;

        if (!code || !code.trim()) {
            return res.status(400).json({
                message: 'Code is required for review'
            });
        }

        if (code.length > 10000) {
            return res.status(400).json({
                message: 'Code is too long. Maximum 10,000 characters allowed.'
            });
        }

        const result = await aiCodeReview(code, language);

        if (!result.success) {
            return res.status(500).json({
                message: 'Failed to generate code review',
                error: result.error
            });
        }

        res.json({
            success: true,
            review: result.review,
            language,
            timestamp: result.timestamp
        });

    } catch (error) {
        console.error('Code review route error:', error);
        res.status(500).json({
            message: 'Server error during code review',
            error: error.message
        });
    }
});

// @route   POST /api/ai/hint
// @desc    Get AI hint for a coding problem
// @access  Private
router.post('/hint', auth, async (req, res) => {
    try {
        const { problemId, code, language = 'javascript' } = req.body;

        if (!problemId) {
            return res.status(400).json({
                message: 'Problem ID is required'
            });
        }

        if (!code || !code.trim()) {
            return res.status(400).json({
                message: 'Current code is required to provide relevant hints'
            });
        }

        // Get problem details
        const problem = await Problem.findById(problemId).select('title description examples constraints');
        
        if (!problem) {
            return res.status(404).json({
                message: 'Problem not found'
            });
        }

        const problemDescription = `
        Title: ${problem.title}
        Description: ${problem.description}
        ${problem.constraints ? `Constraints: ${problem.constraints}` : ''}
        ${problem.examples && problem.examples.length > 0 ? 
            `Examples: ${problem.examples.map(ex => `Input: ${ex.input}, Output: ${ex.output}`).join('; ')}` 
            : ''
        }
        `;

        const result = await aiHint(problemDescription, code, language);

        if (!result.success) {
            return res.status(500).json({
                message: 'Failed to generate hint',
                error: result.error
            });
        }

        res.json({
            success: true,
            hint: result.hint,
            problemTitle: problem.title,
            language,
            timestamp: result.timestamp
        });

    } catch (error) {
        console.error('AI hint route error:', error);
        res.status(500).json({
            message: 'Server error during hint generation',
            error: error.message
        });
    }
});

// @route   GET /api/ai/status
// @desc    Check if AI services are available
// @access  Private
router.get('/status', auth, async (req, res) => {
    try {
        
        const isConfigured = !!process.env.GOOGLE_API_KEY;
        
        res.json({
            available: isConfigured,
            message: isConfigured ? 'AI services available' : 'AI services not configured',
            services: {
                codeReview: isConfigured,
                hints: isConfigured
            }
        });
    } catch (error) {
        console.error('AI status check error:', error);
        res.status(500).json({
            available: false,
            message: 'Error checking AI services',
            error: error.message
        });
    }
});

module.exports = router;
