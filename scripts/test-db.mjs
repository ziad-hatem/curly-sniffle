import mongoose from "mongoose";

const MONGODB_URI =
  "mongodb+srv://ziadhatem2022_db_user:ciGX8QqUEwTFfroX@cluster0.sicv9gx.mongodb.net/?appName=Cluster0";

async function testConnection() {
  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connection SUCCESSFUL!");
    console.log("State:", mongoose.connection.readyState);
    await mongoose.connection.close();
  } catch (error) {
    console.error("Connection FAILED:", error);
  }
}

testConnection();
