import mongoose from "mongoose";

export const connectDB = async () => {
    const maxRetries = 10;
    const retryDelayMs = 2000;
    let attempt = 0;

    if (!process.env.MONGO_URI || typeof process.env.MONGO_URI !== "string") {
        console.log("Error in DB Connection", "MONGO_URI is not set");
        return; // Do not exit server; keep API listening
    }

    while (attempt < maxRetries) {
        try {
            const conn = await mongoose.connect(process.env.MONGO_URI);
            console.log(`MongoDB Connected: ${conn.connection.host}`);
            return;
        } catch (error) {
            attempt += 1;
            console.log(`DB connect attempt ${attempt} failed:`, error.message);
            if (attempt >= maxRetries) {
                console.log("Max DB retry attempts reached. Continuing without DB connection.");
                return;
            }
            await new Promise((res) => setTimeout(res, retryDelayMs));
        }
    }
};

