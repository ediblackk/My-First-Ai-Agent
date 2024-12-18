require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');

async function deleteUserByPublicKey(publicKey) {
  try {
    const result = await User.deleteOne({ publicKey });
    console.log(`Delete result for ${publicKey}:`, result);
    return result;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

async function cleanupUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/make-a-wish');
    console.log('Connected to MongoDB');

    // Find users with null publicKey
    const nullUsers = await User.find({ publicKey: null });
    console.log(`Found ${nullUsers.length} users with null publicKey`);

    if (nullUsers.length > 0) {
      // Delete users with null publicKey
      const result = await User.deleteMany({ publicKey: null });
      console.log(`Deleted ${result.deletedCount} users with null publicKey`);
    }

    // List all remaining users
    const remainingUsers = await User.find({}).lean();
    console.log('\nRemaining users:');
    remainingUsers.forEach(user => {
      console.log({
        id: user._id.toString(),
        publicKey: user.publicKey,
        credits: user.credits,
        activeWishes: user.activeWishes,
        createdAt: user.createdAt
      });
    });

    // Check for duplicate publicKeys
    const publicKeys = remainingUsers.map(u => u.publicKey);
    const duplicates = publicKeys.filter((item, index) => publicKeys.indexOf(item) !== index);
    if (duplicates.length > 0) {
      console.log('\nFound duplicate publicKeys:', duplicates);
      
      // Show details for duplicates
      for (const key of duplicates) {
        const dupes = remainingUsers.filter(u => u.publicKey === key);
        console.log(`\nDuplicates for ${key}:`);
        dupes.forEach(d => console.log({
          id: d._id.toString(),
          credits: d.credits,
          activeWishes: d.activeWishes,
          createdAt: d.createdAt
        }));

        // Optional: Delete duplicates keeping only the oldest one
        if (process.argv.includes('--fix-duplicates')) {
          console.log(`\nFixing duplicates for ${key}`);
          // Sort by createdAt ascending (oldest first)
          const sorted = dupes.sort((a, b) => a.createdAt - b.createdAt);
          // Keep the first (oldest) one, delete the rest
          for (let i = 1; i < sorted.length; i++) {
            console.log(`Deleting duplicate user ${sorted[i]._id}`);
            await User.deleteOne({ _id: sorted[i]._id });
          }
        }
      }
    } else {
      console.log('\nNo duplicate publicKeys found');
    }

    // If a specific public key is provided, delete that user
    const keyToDelete = process.argv[2];
    if (keyToDelete && keyToDelete !== '--fix-duplicates') {
      console.log(`\nDeleting user with public key: ${keyToDelete}`);
      const deleteResult = await deleteUserByPublicKey(keyToDelete);
      console.log('Delete result:', deleteResult);
    }

    // Drop all users if --drop-all flag is provided
    if (process.argv.includes('--drop-all')) {
      console.log('\nDropping all users...');
      await User.deleteMany({});
      console.log('All users deleted');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

cleanupUsers();
