const mongoose = require('mongoose');

async function connectDb() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("❌ MONGO_URI is not defined in environment variables");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, { autoIndex: true });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { connectDb };