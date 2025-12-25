import mongoose from "mongoose";


export const mongoConnect = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/integrative_activity")
        
    } catch (error) {
        console.log(error)
        throw new Error("Error connecting to MongoDB")
    }
}