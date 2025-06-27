const express = require("express");
const multer = require("multer");
const path = require("path");
const { Storage } = require("@google-cloud/storage");
const pdfParse = require("pdf-parse");
const authenticate = require("../middleware/auth.js");
const UploadModel = require("../models/UploadModel.js");

const router = express.Router();

// Multer memory storage config
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Initialize Google Cloud Storage
const gcs = new Storage({
  keyFilename: path.join(__dirname, "../../vocal-clone-464109-k4-9c3f2e7a3552.json"),
});
const bucket = gcs.bucket("obarabucket");

// Upload route
router.post("/", authenticate, upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const userId = req.user.uid;

    if (!file) return res.status(400).json({ message: "No file uploaded" });

    // Extract text from PDF or .txt
    let extractedText = "";
    if (file.mimetype === "application/pdf") {
      const parsed = await pdfParse(file.buffer);
      extractedText = parsed.text;
    } else if (file.mimetype === "text/plain") {
      extractedText = file.buffer.toString("utf-8");
    }

    // Save extracted data to MongoDB
    await UploadModel.create({
      userId,
      fileName: file.originalname,
      mimeType: file.mimetype,
      text: extractedText,
    });

    // Upload file to GCS
    const blob = bucket.file(`${userId}/${Date.now()}_${file.originalname}`);
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
    });

    blobStream.on("error", (err) => {
      console.error(err);
      return res.status(500).json({ message: "Upload failed" });
    });

    blobStream.on("finish", () => {
      return res.status(200).json({ message: "Upload successful", extractedText });
    });

    blobStream.end(file.buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
