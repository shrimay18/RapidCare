const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Disable strict query for compatibility
    mongoose.set('strictQuery', false);
    
    // MongoDB connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      w: 'majority'
    };

    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rapidcare';
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('📍 URI:', mongoURI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs

    const conn = await mongoose.connect(mongoURI, options);

    console.log('✅ MongoDB Connected Successfully');
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    console.log(`🔌 Port: ${conn.connection.port}`);

    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    return conn;

  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('   Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('   💡 Make sure MongoDB is running on your system');
      console.error('   💡 Try: mongod --dbpath /path/to/your/db');
    }
    
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;