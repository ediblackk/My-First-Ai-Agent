import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.js';
import Wish from '../models/wish.js';

dotenv.config();

const fixIndexes = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wishdb');
    console.log('Connected to MongoDB');

    // Drop existing collections
    console.log('Dropping existing collections...');
    await mongoose.connection.db.dropDatabase();
    console.log('Database dropped');

    // Create indexes for User model
    console.log('Creating User indexes...');
    await User.createIndexes();
    console.log('User indexes created');

    // Create indexes for Wish model
    console.log('Creating Wish indexes...');
    await Wish.createIndexes();
    console.log('Wish indexes created');

    console.log('All indexes created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing indexes:', error);
    process.exit(1);
  }
};

fixIndexes();
