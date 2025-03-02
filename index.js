require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const connectToDatabase = require("./database/mongoClient");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const uploadRoutes = require("./routes/upload");
const linkRoutes = require("./routes/manageLink");

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://share-link-c8efb.web.app"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Main Function
async function main() {
  try {
    const client = await connectToDatabase();
    const db = client.db("task-handler");

    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/upload", uploadRoutes);
    app.use("/api/user", userRoutes(db));
    app.use("/api/link", linkRoutes(db));

    //err handle
    app.get("/favicon.ico", (req, res) => res.status(204).end());
    app.get("/favicon.png", (req, res) => res.status(204).end());

    // Root Endpoint
    app.get("/", (req, res) => {
      res.send("ShareLink server running");
    });

    // Start Server
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server running on port: ${port}`));
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

main();
