const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.REACT_APP_MONGODB_URI) {
      console.warn('MongoDB URI not found. Database features will be disabled.');
      return;
    }

    const conn = await mongoose.connect(process.env.REACT_APP_MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
