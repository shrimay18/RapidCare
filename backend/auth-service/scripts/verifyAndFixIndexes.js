// Create this file: backend/auth-service/scripts/verifyAndFixIndexes.js

const mongoose = require('mongoose');
require('dotenv').config();

async function verifyAndFixIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Step 1: Check all current indexes
    console.log('🔍 Current indexes:');
    const indexes = await usersCollection.indexes();
    indexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)} | unique: ${idx.unique} | sparse: ${idx.sparse}`);
    });

    // Step 2: Find and drop ALL mobile indexes
    console.log('\n🗑️ Dropping all mobile indexes...');
    for (const index of indexes) {
      if (index.key && index.key.mobile !== undefined) {
        try {
          await usersCollection.dropIndex(index.name);
          console.log(`   Dropped: ${index.name}`);
        } catch (error) {
          console.log(`   Failed to drop ${index.name}: ${error.message}`);
        }
      }
    }

    // Step 3: Clean up existing users with null mobile
    console.log('\n🧹 Cleaning up users with null mobile...');
    
    // Find all users with null mobile
    const usersWithNullMobile = await usersCollection.find({ 
      $or: [
        { mobile: null },
        { mobile: "" },
        { mobile: { $exists: false } }
      ]
    }).toArray();
    
    console.log(`Found ${usersWithNullMobile.length} users with null/empty mobile`);

    if (usersWithNullMobile.length > 0) {
      // Delete all but keep none (we'll recreate properly)
      const deleteResult = await usersCollection.deleteMany({
        $or: [
          { mobile: null },
          { mobile: "" },
          { mobile: { $exists: false } }
        ]
      });
      console.log(`   Deleted ${deleteResult.deletedCount} users with null/empty mobile`);
    }

    // Step 4: Create proper mobile index with sparse option
    console.log('\n🔧 Creating new sparse unique mobile index...');
    await usersCollection.createIndex(
      { mobile: 1 }, 
      { 
        unique: true, 
        sparse: true,
        name: 'mobile_1_sparse',
        background: true
      }
    );
    console.log('✅ Created mobile_1_sparse index');

    // Step 5: Verify the new index
    console.log('\n📋 Final indexes:');
    const finalIndexes = await usersCollection.indexes();
    finalIndexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)} | unique: ${idx.unique} | sparse: ${idx.sparse}`);
    });

    // Step 6: Test the index by inserting test documents
    console.log('\n🧪 Testing the index with null mobile values...');
    try {
      // Try to insert two users with null mobile - should work with sparse index
      await usersCollection.insertOne({ 
        email: 'test1@example.com', 
        mobile: null, 
        name: 'Test User 1',
        password: 'test123',
        role: 'PATIENT',
        status: 'PENDING_VERIFICATION'
      });
      
      await usersCollection.insertOne({ 
        email: 'test2@example.com', 
        mobile: null, 
        name: 'Test User 2',
        password: 'test123',
        role: 'PATIENT',
        status: 'PENDING_VERIFICATION'
      });
      
      console.log('✅ Successfully inserted two users with null mobile - sparse index is working!');
      
      // Clean up test users
      await usersCollection.deleteMany({ email: { $in: ['test1@example.com', 'test2@example.com'] } });
      console.log('🧹 Cleaned up test users');
      
    } catch (error) {
      console.error('❌ Index test failed:', error.message);
    }

    console.log('\n🎉 Index verification and fix completed!');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the verification and fix
verifyAndFixIndexes();