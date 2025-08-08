import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./Config/dbConnection.js";
import authRoutes from "./Routes/authRoute.js";
import uploadRoutes from "./Routes/uploadRoutes.js";

import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";
// Load environment variables
dotenv.config();

// Check if environment variables loaded
console.log("Database URL:", process.env.DATA_BASE);

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // to parse JSON bodies

// Connect to MongoDB
connectDB();

// Use auth routes
app.use("/api/auth", authRoutes);
app.use("/api/file", uploadRoutes);
// Error handler
app.use(notFound);
app.use(errorHandler);

// Routes
app.get("/", (req, res) => {
  res.send("API is Running...! File Storage");
});

// Use port from env or default to 5000
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

server.on("error", (error) => {
  console.error("Server error:", error);
  process.exit(1);
});
