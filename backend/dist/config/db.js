import mongoose from "mongoose";
import process from "node:process";
const DEFAULT_MONGO_URI = "mongodb+srv://aarav4mathur_db_user:uvWJ1J7MYt0Gm2lO@cluster0.ji5fwke.mongodb.net/diabeguide?retryWrites=true&w=majority";
export const connectDB = async () => {
    try {
        const connStr = process.env.MONGODB_URI || DEFAULT_MONGO_URI;
        console.log(`[Database] Attempting to connect to MongoDB...`);
        await mongoose.connect(connStr);
        console.log(`[Database] MongoDB Connected successfully!`);
    }
    catch (error) {
        console.error(`[Database] MongoDB Connection Error:`, error);
        // Do not call process.exit(1) to avoid crashing container startup on Render
    }
};
