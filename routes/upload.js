const express = require("express");
const multer = require("multer");
const path = require("path");
const { authorize, uploadFile } = require("../database/googleDriveUpload");

const router = express.Router();

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

// Endpoint to handle file upload
router.post("/upload-file", upload.single("file"), async (req, res) => {
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

module.exports = router;
