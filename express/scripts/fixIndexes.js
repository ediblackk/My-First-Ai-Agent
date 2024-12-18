require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/make-a-wish');
    console.log('Connected to MongoDB');

    // Get the users collection
    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // List all indexes
    console.log('\nCurrent indexes:');
    const indexes = await collection.indexes();
    console.log(indexes);

    // Drop all indexes except _id
    console.log('\nDropping all indexes...');
    await collection.dropIndexes();
    console.log('All indexes dropped');

    // Create new indexes
    console.log('\nCreating new indexes...');
    await collection.createIndex({ publicKey: 1 }, { unique: true });
    await collection.createIndex({ createdAt: -1 });
    console.log('New indexes created');

    // Verify new indexes
    console.log('\nNew indexes:');
    const newIndexes = await collection.indexes();
    console.log(newIndexes);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

fixIndexes();
