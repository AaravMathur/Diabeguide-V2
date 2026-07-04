import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const connStr = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/diabeguide";
    console.log(`[Database] Attempting to connect to MongoDB URI: ${connStr}`);
    await mongoose.connect(connStr);
    console.log(`[Database] MongoDB Connected successfully to ${connStr}`);
  } catch (error) {
    const connStr = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/diabeguide";
    console.error(`[Database] MongoDB Connection Error for ${connStr}:`, error);
    process.exit(1);
  }
};
