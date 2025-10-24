import mongoose from "mongoose";

export async function connectToDatabase(mongoUri: string): Promise<void> {
  if (!mongoUri) {
    console.warn("MONGODB_URI not set; skipping database connection");
    return;
  }

  mongoose.set("strictQuery", true);
  // Disable mongoose buffering to prevent timeout issues
  mongoose.set('bufferCommands', false);
  
  // Configure connection options for better timeout handling
  const options = {
    serverSelectionTimeoutMS: 10000, // 10 seconds
    connectTimeoutMS: 10000, // 10 seconds
    socketTimeoutMS: 45000, // 45 seconds
    maxPoolSize: 10, // Maintain up to 10 socket connections
    minPoolSize: 5, // Maintain a minimum of 5 socket connections
    maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    retryWrites: true,
    w: 'majority' as const
  };

  try {
    await mongoose.connect(mongoUri, options);
    console.log("💽 MongoDB connected successfully");
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
    
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}
