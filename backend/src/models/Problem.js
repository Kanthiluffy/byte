const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true
  },
  expectedOutput: {
    type: String,
    required: true
  },
  isHidden: {
    type: Boolean,
    default: false
  }
});

const exampleSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true
  },
  output: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    default: ''
  }
});

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  constraints: {
    type: String,
    default: ''
  },
  timeLimit: {
    type: Number,
    default: 5000, // in milliseconds
    min: 1000,
    max: 10000
  },
  memoryLimit: {
    type: Number,
    default: 128, // in MB
    min: 64,
    max: 512
  },
  examples: [exampleSchema],
  testCases: [testCaseSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  acceptanceRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalSubmissions: {
    type: Number,
    default: 0
  },
  successfulSubmissions: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Update acceptance rate when submissions change
problemSchema.methods.updateAcceptanceRate = function() {
  if (this.totalSubmissions === 0) {
    this.acceptanceRate = 0;
  } else {
    this.acceptanceRate = Math.round((this.successfulSubmissions / this.totalSubmissions) * 100);
  }
};

// Index for efficient searching
problemSchema.index({ title: 'text', description: 'text', tags: 'text' });
problemSchema.index({ difficulty: 1, isActive: 1 });
problemSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Problem', problemSchema);
