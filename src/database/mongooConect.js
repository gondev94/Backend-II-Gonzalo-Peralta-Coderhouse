import mongoose from "mongoose";


export const mongoConnect = async () => {
    try {
        await mongoose.connect("mongodb://localhost:2017/integrative_activity")
        console.log("Connected to MongoDB")
    } catch (error) {
        console.log(error)
        throw new Error("Error connecting to MongoDB")
    }
}