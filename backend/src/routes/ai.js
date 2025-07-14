const express = require('express');
const { auth } = require('../middleware/auth');
const { aiCodeReview, aiHint } = require('../services/aiService');
const { aiPersonalTutor, startTutorSession, addToConversation, getConversationHistory, endTutorSession, getSession } = require('../services/aiTutorService');
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

// @route   POST /api/ai/tutor/start
// @desc    Start a new tutoring session
// @access  Private
router.post('/tutor/start', auth, async (req, res) => {
    try {
        const { problemId } = req.body;

        if (!problemId) {
            return res.status(400).json({
                message: 'Problem ID is required'
            });
        }

        // Get problem details
        const problem = await Problem.findById(problemId).select('title description examples constraints difficulty');
        
        if (!problem) {
            return res.status(404).json({
                message: 'Problem not found'
            });
        }

        const sessionId = startTutorSession(req.user.id, problemId, problem);

        res.json({
            success: true,
            sessionId,
            message: "Hi! I'm your AI tutor. Before you start coding, tell me your initial approach or plan for solving this problem. What's your first thought on how to tackle it?",
            problem: {
                title: problem.title,
                difficulty: problem.difficulty
            }
        });

    } catch (error) {
        console.error('Start tutor session error:', error);
        res.status(500).json({
            message: 'Server error starting tutor session',
            error: error.message
        });
    }
});

// @route   POST /api/ai/tutor/chat
// @desc    Continue conversation with AI tutor
// @access  Private
router.post('/tutor/chat', auth, async (req, res) => {
    try {
        const { sessionId, message } = req.body;

        if (!sessionId || !message) {
            return res.status(400).json({
                message: 'Session ID and message are required'
            });
        }

        if (message.length > 2000) {
            return res.status(400).json({
                message: 'Message is too long. Maximum 2000 characters allowed.'
            });
        }

        const conversationHistory = getConversationHistory(sessionId);
        const session = getSession(sessionId);

        if (!session) {
            return res.status(404).json({
                message: 'Session not found or expired'
            });
        }

        // Add user message to conversation
        addToConversation(sessionId, 'user', message);

        // Get AI tutor response
        const result = await aiPersonalTutor(
            req.user.id,
            session.problemId,
            session.problemData,
            message,
            conversationHistory
        );

        if (!result.success) {
            return res.status(500).json({
                message: 'Failed to generate tutor response',
                error: result.error
            });
        }

        // Add tutor response to conversation
        addToConversation(sessionId, 'tutor', result.response);

        res.json({
            success: true,
            response: result.response,
            timestamp: result.timestamp
        });

    } catch (error) {
        console.error('Tutor chat error:', error);
        res.status(500).json({
            message: 'Server error during tutoring session',
            error: error.message
        });
    }
});

// @route   GET /api/ai/tutor/history/:sessionId
// @desc    Get conversation history
// @access  Private
router.get('/tutor/history/:sessionId', auth, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const history = getConversationHistory(sessionId);

        res.json({
            success: true,
            history
        });

    } catch (error) {
        console.error('Get tutor history error:', error);
        res.status(500).json({
            message: 'Server error retrieving conversation history',
            error: error.message
        });
    }
});

// @route   POST /api/ai/tutor/end
// @desc    End tutoring session
// @access  Private
router.post('/tutor/end', auth, async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                message: 'Session ID is required'
            });
        }

        endTutorSession(sessionId);

        res.json({
            success: true,
            message: 'Tutoring session ended successfully'
        });

    } catch (error) {
        console.error('End tutor session error:', error);
        res.status(500).json({
            message: 'Server error ending tutor session',
            error: error.message
        });
    }
});

module.exports = router;
