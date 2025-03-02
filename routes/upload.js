const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const tmp = require("tmp");
const { authorize, uploadFile } = require("../database/googleDriveUpload");

const router = express.Router();

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint to handle file upload
router.post("/upload-file", upload.single("file"), async (req, res) => {
  try {
    // Create a temporary file
    const tmpFile = tmp.fileSync({
      postfix: path.extname(req.file.originalname),
    });
    fs.writeFileSync(tmpFile.name, req.file.buffer);

    const authClient = await authorize();
    const filePath = tmpFile.name;
    const mimeType = req.file.mimetype;
    const fileName = req.file.originalname;
    const file = await uploadFile(authClient, filePath, mimeType, fileName);

    // Clean up the temporary file
    tmpFile.removeCallback();

    res.send({ success: true, file });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
});

module.exports = router;
