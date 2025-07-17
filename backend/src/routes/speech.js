const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const whisperService = require('../services/whisperService');
const { auth } = require('../middleware/auth');

// Configure multer for audio uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../temp'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `audio-${uniqueSuffix}.webm`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  }
});

// Test endpoint - no auth required for testing
router.post('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Whisper speech service is running',
    supportedFormats: ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/ogg']
  });
});

// Transcribe audio to text
router.post('/transcribe', auth, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No audio file provided'
      });
    }

    const result = await whisperService.transcribeAudio(req.file.path);
    
    res.json({
      success: true,
      transcription: result.text,
      confidence: result.confidence,
      processingTime: result.processingTime
    });
  } catch (error) {
    console.error('Error in transcribe endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to transcribe audio',
      error: error.message
    });
  }
});

module.exports = router;
