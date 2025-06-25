const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const problemRoutes = require('./src/routes/problems');
const submissionRoutes = require('./src/routes/submissions');
const adminRoutes = require('./src/routes/admin');
const profileRoutes = require('./src/routes/profile');
const aiRoutes = require('./src/routes/ai');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Passport middleware
app.use(passport.initialize());
require('./src/middleware/passport')(passport);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codejudge', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'CodeJudge Backend Server is running',
    timestamp: new Date().toISOString()
  });
});

// Language availability test endpoint
app.get('/api/test/languages', async (req, res) => {
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);
  
  const languages = {
    node: 'node --version',
    python: 'python3 --version', 
    cpp: 'g++ --version',
    java: 'java -version'
  };
  
  const results = {};
  
  for (const [lang, command] of Object.entries(languages)) {
    try {
      const { stdout, stderr } = await execAsync(command);
      results[lang] = {
        available: true,
        version: (stdout || stderr).split('\n')[0].trim(),
        command: command
      };
    } catch (error) {
      results[lang] = {
        available: false,
        error: error.message,
        command: command
      };
    }
  }
  
  res.json({
    server: 'Render.com',
    timestamp: new Date().toISOString(),
    languages: results
  });
});

// Test Python execution specifically
app.post('/api/test/python', async (req, res) => {
  try {
    const codeExecutor = require('./src/services/codeExecutor');
    
    const testCode = `print("Python execution test successful!")`;
    const testCases = [{ input: '', expectedOutput: 'Python execution test successful!' }];
    
    const result = await codeExecutor.executeCode(testCode, 'python', testCases, 5000);
    
    res.json({
      pythonTest: 'executed',
      result: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.json({
      pythonTest: 'failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Process event handlers to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit the process, just log the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

module.exports = app;
