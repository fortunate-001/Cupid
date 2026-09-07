// lib/mongodb.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error(' MONGODB_URI not defined in .env');
  throw new Error('MONGODB_URI is required');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log(' Connecting to MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    }).then((mongoose) => {
      console.log(' MongoDB connected!');
      return mongoose;
    }).catch((err) => {
      console.error(' MongoDB connection error:', err.message);
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}




export default connectDB;