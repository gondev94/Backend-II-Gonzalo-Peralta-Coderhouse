import mongoose from "mongoose";

const MONGO_URL = process.env.MONGODB_URI || "mongodb://localhost:27017/integrative_activity";

export const mongoConnect = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        
    } catch (error) {
        console.log(error);
        throw new Error("Error connecting to MongoDB");
    }
};
