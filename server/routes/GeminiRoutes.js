// server/routes/geminiRoutes.js
const express = require("express");
const authenticate = require("../middleware/auth.js");
const Upload = require("../models/UploadModel.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const router = express.Router();

// Init Gemini - Remove the apiVersion config
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Use the correct model name
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

router.post("/query", authenticate, async (req, res) => {
  const { question } = req.body;

  if (!question) return res.status(400).json({ message: "Question is required" });

  try {
    const userId = req.user.uid;

    // Fetch latest upload
    const latestDoc = await Upload.findOne({ userId }).sort({ createdAt: -1 });
    if (!latestDoc || !latestDoc.text) {
      return res.status(404).json({ message: "No uploaded document with extracted text found" });
    }

    // Uncomment this to see available models
    // const models = await genAI.listModels();
    // console.log("Available models:", models);

    // Construct prompt
    const prompt = `
You are a strategic analyst. Based only on the document text below, answer the user query with clear insights.

Document:
===
${latestDoc.text.slice(0, 10000)}
===

User Question:
${question}

Instructions: Be concise, strategic, and only use the document for your answer. If not enough information, say so.`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    res.json({ answer });
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({ message: "LLM query failed" });
  }
});

module.exports = router;