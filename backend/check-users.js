const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  try {
    const users = await User.find({}, 'name email role');
    console.log('Available users:');
    users.forEach(u => console.log(`- ${u.email} (${u.role})`));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
});
