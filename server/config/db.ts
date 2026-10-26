
import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => console.log("mongodb connected "));
        
        await mongoose.connect(process.env.MONGODB_URI!);
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1); // Exit process with failure
    }
}

export default connectDB;
