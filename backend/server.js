import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.route.js";
import sweetRoutes from "./routes/sweet.route.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "10mb" })); // to parse the body of the request
app.use(cookieParser());

// Serve frontend static files (index.html, cart.html, etc.)
app.use(express.static("frontend"));

app.use("/api/auth", authRoutes);
app.use("/api/sweets", sweetRoutes);

app.listen(PORT, () => {
  console.log("Server is Running on http://localhost:" + PORT);

  connectDB();
});
