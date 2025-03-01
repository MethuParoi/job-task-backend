// require("dotenv").config();
// const express = require("express");
// const cookieParser = require("cookie-parser");
// const cors = require("cors");

// const connectToDatabase = require("./database/mongoClient");
// const authRoutes = require("./routes/auth");
// const userRoutes = require("./routes/user");

// const app = express();

// // Middleware
// app.use(
//   cors({
//     origin: ["http://localhost:5173", "https://my-task-handler.web.app"],
//     credentials: true,
//   })
// );
// app.use(express.json());
// app.use(cookieParser());

// // Main Function
// async function main() {
//   try {
//     const client = await connectToDatabase();
//     const db = client.db("task-handler");

//     // Routes
//     app.use("/api/auth", authRoutes);
//     app.use("/api/user", userRoutes(db));

//     //err handle
//     app.get("/favicon.ico", (req, res) => res.status(204).end());
//     app.get("/favicon.png", (req, res) => res.status(204).end());

//     // Root Endpoint
//     app.get("/", (req, res) => {
//       res.send("TaskHandler server running");
//     });

//     // Start Server
//     const port = process.env.PORT || 3000;
//     app.listen(port, () => console.log(`Server running on port: ${port}`));
//   } catch (error) {
//     console.error("Failed to start server:", error);
//   }
// }

// main();

require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const connectToDatabase = require("./database/mongoClient");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const { authorize, uploadFile } = require("./database/googleDriveUpload");

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://my-task-handler.web.app"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Main Function
async function main() {
  try {
    const client = await connectToDatabase();
    const db = client.db("task-handler");

    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/user", userRoutes(db));

    //err handle
    app.get("/favicon.ico", (req, res) => res.status(204).end());
    app.get("/favicon.png", (req, res) => res.status(204).end());

    // Root Endpoint
    app.get("/", (req, res) => {
      res.send("ShareLink server running");
    });

    // Endpoint to handle file upload
    app.post("/upload-file", upload.single("file"), async (req, res) => {
      try {
        const authClient = await authorize();
        const filePath = req.file.path;
        const mimeType = req.file.mimetype;
        const fileName = req.file.originalname;
        const file = await uploadFile(authClient, filePath, mimeType, fileName);
        res.send({ success: true, file });
      } catch (error) {
        res.status(500).send({ success: false, error: error.message });
      }
    });

    // Start Server
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server running on port: ${port}`));
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

main();
