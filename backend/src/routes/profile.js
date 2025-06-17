const express = require('express');
const bcrypt = require('bcryptjs');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Submission = require('../models/Submission');

const router = express.Router();

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile by ID (public view)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -email');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if profile is public
    if (user.profileVisibility === 'private') {
      return res.status(403).json({ message: 'Profile is private' });
    }

    // Get user's submission statistics
    const submissions = await Submission.find({ userId: user._id })
      .populate('problemId', 'title difficulty');

    const userStats = {
      ...user.toObject(),
      recentSubmissions: submissions.slice(-5).reverse() // Last 5 submissions
    };

    res.json(userStats);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/me', auth, async (req, res) => {
  try {
    const {
      name,
      bio,
      location,
      website,
      github,
      linkedin,
      skills,
      preferredLanguage,
      profileVisibility
    } = req.body;

    // Validate input
    if (bio && bio.length > 500) {
      return res.status(400).json({ message: 'Bio must be less than 500 characters' });
    }

    if (skills && (!Array.isArray(skills) || skills.length > 10)) {
      return res.status(400).json({ message: 'Skills must be an array with maximum 10 items' });
    }

    const updateData = {
      name,
      bio,
      location,
      website,
      github,
      linkedin,
      skills: skills || [],
      preferredLanguage,
      profileVisibility
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user.id);

    // Check if user has a password (not Google OAuth user)
    if (!user.password) {
      return res.status(400).json({ message: 'Cannot change password for OAuth users' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user statistics (called when user submits code)
router.put('/stats', auth, async (req, res) => {
  try {
    const { problemDifficulty, isSuccess } = req.body;

    const user = await User.findById(req.user.id);
    
    // Update submission stats
    user.stats.totalSubmissions += 1;
    
    if (isSuccess) {
      user.stats.successfulSubmissions += 1;
      
      // Update difficulty-specific stats
      switch (problemDifficulty) {
        case 'Easy':
          user.stats.easyProblems += 1;
          break;
        case 'Medium':
          user.stats.mediumProblems += 1;
          break;
        case 'Hard':
          user.stats.hardProblems += 1;
          break;
      }
      
      user.stats.problemsSolved = user.stats.easyProblems + 
                                   user.stats.mediumProblems + 
                                   user.stats.hardProblems;
    }

    await user.save();
    res.json({ message: 'Stats updated successfully' });
  } catch (error) {
    console.error('Error updating user stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload avatar (placeholder for future file upload implementation)
router.put('/avatar', auth, async (req, res) => {
  try {
    const { avatarUrl } = req.body;
    
    if (!avatarUrl) {
      return res.status(400).json({ message: 'Avatar URL is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
