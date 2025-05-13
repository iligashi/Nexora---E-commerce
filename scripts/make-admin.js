const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/ecommerce';
const EMAIL_TO_UPDATE = process.argv[2];

if (!EMAIL_TO_UPDATE) {
  console.error('Please provide an email address as an argument');
  process.exit(1);
}

async function makeAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      role: String
    }));

    const result = await User.updateOne(
      { email: EMAIL_TO_UPDATE },
      { $set: { role: 'admin' } }
    );

    if (result.modifiedCount === 0) {
      console.log('No user found with that email');
    } else {
      console.log('Successfully updated user to admin');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

makeAdmin(); 