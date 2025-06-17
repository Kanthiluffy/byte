const mongoose = require('mongoose');

const testCaseResultSchema = new mongoose.Schema({
  testCaseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  input: {
    type: String,
    required: true
  },
  expectedOutput: {
    type: String,
    required: true
  },
  actualOutput: {
    type: String,
    default: ''
  },
  executionTime: {
    type: Number,
    default: 0
  },
  memoryUsed: {
    type: Number,
    default: 0
  },
  error: {
    type: String,
    default: ''
  }
});

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    enum: ['javascript', 'python', 'cpp', 'java'],
    required: true
  },
  status: {
    type: String,
    enum: [
      'Pending',
      'Running',
      'Accepted',
      'Wrong Answer',
      'Time Limit Exceeded',
      'Memory Limit Exceeded',
      'Runtime Error',
      'Compilation Error',
      'Internal Error'
    ],
    default: 'Pending'
  },
  totalTestCases: {
    type: Number,
    default: 0
  },
  passedTestCases: {
    type: Number,
    default: 0
  },
  executionTime: {
    type: Number,
    default: 0
  },
  memoryUsed: {
    type: Number,
    default: 0
  },
  compilationError: {
    type: String,
    default: ''
  },
  testCaseResults: [testCaseResultSchema],
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Index for efficient querying
submissionSchema.index({ userId: 1, problemId: 1 });
submissionSchema.index({ problemId: 1, status: 1 });
submissionSchema.index({ userId: 1, createdAt: -1 });
submissionSchema.index({ status: 1, createdAt: -1 });

// Calculate score based on passed test cases
submissionSchema.methods.calculateScore = function() {
  if (this.totalTestCases === 0) {
    this.score = 0;
  } else {
    this.score = Math.round((this.passedTestCases / this.totalTestCases) * 100);
  }
};

module.exports = mongoose.model('Submission', submissionSchema);
