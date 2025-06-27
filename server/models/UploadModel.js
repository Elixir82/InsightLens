let mongoose = require("mongoose");

let uploadSchema = new mongoose.Schema({
  userId:{
    type: String,
    required: true,
  },
  filename:{
    type: String,
  },
  mimeType: { 
    type: String, 
    required: true 
  },
  text: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now }
});

module.exports = mongoose.model("Upload", uploadSchema);