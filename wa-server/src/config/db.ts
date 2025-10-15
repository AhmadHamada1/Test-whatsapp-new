import mongoose from "mongoose";

export async function connectToDatabase(mongoUri: string): Promise<void> {
  if (!mongoUri) {
    console.warn("MONGODB_URI not set; skipping database connection");
    return;
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
}
