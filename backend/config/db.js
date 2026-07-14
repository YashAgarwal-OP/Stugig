const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/stugig';
    
    // Log connection attempt (mask password for security)
    const maskedUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    console.log(`[MongoDB] Attempting connection to: ${maskedUri}`);
    
    const conn = await mongoose.connect(mongoUri, {
      // These options help with connection stability in cloud environments
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000,           // 45 seconds
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    
    // Provide helpful error messages for common issues
    if (error.message.includes('ENOTFOUND') || error.message.includes('querySrv')) {
      console.error('\n🔍 Troubleshooting:');
      console.error('  1. Verify MONGO_URI is correct in environment variables');
      console.error('  2. Check MongoDB Atlas Network Access allows 0.0.0.0/0');
      console.error('  3. Ensure password in connection string has no special chars (or URL-encode them)');
    }
    
    // In production on Render, don't exit immediately - allow retry
    if (process.env.NODE_ENV === 'production') {
      console.error('⚠️  Running in production mode - will retry connection on next request');
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
