import React from "react";
import axios from "axios";
import { Upload, FileText, CheckCircle, XCircle, Loader2, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "../context/authContext";

function UploadIT() {
  const [file, setFile] = React.useState(null);
  const [progress, setProgress] = React.useState('');
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [extractedText, setExtractedText] = React.useState("");
  const [question, setQuestion] = React.useState("");
  const [answer, setAnswer] = React.useState("");
  const [isThinking, setIsThinking] = React.useState(false);

  const { user } = useAuth();

  const handleUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      setProgress("Uploading...");

      const formData = new FormData();
      formData.append("file", file);

      const token = await user.getIdToken();

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200) {
        setProgress("✅ File uploaded successfully");
        setExtractedText(res.data.extractedText || "No text extracted");
      } else {
        setProgress("❌ Upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setProgress("❌ Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleQuestionSubmit = async () => {
    if (!question.trim() || !extractedText) return;
    setIsThinking(true);
    setAnswer("");

    try {
      const token = await user.getIdToken();
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/ask/query`, {
        text: extractedText,
        question,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      setAnswer(res.data.answer || "No answer returned.");
    } catch (error) {
      console.error("Error getting answer:", error);
      setAnswer("❌ Failed to get an answer from the LLM.");
    } finally {
      setIsThinking(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.type === "text/plain")) {
      setFile(droppedFile);
    }
  };

  const getProgressIcon = () => {
    if (isUploading) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (progress.includes("✅")) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (progress.includes("❌")) return <XCircle className="w-4 h-4 text-red-500" />;
    return null;
  };

  const getProgressColor = () => {
    if (progress.includes("✅")) return "text-green-600";
    if (progress.includes("❌")) return "text-red-600";
    return "text-blue-600";
  };

  return (
    <Card className="w-full max-w-lg bg-white/80 backdrop-blur-sm shadow-2xl border-0 ring-1 ring-black/5 transition-all duration-300 hover:shadow-3xl hover:scale-[1.02]">
      <CardHeader className="text-center pb-6">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg transform hover:rotate-3 transition-transform duration-300">
          <Upload className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Upload Document
        </CardTitle>
        <CardDescription className="text-gray-500 text-base mt-2">
          Drag & drop or select your PDF or text files
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${isDragOver
              ? "border-blue-400 bg-blue-50/50 scale-105"
              : file
                ? "border-green-300 bg-green-50/30"
                : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/20"
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-3">
            {file ? (
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <FileText className="w-8 h-8" />
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            ) : (
              <>
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <Upload className={`w-6 h-6 transition-colors duration-300 ${isDragOver ? "text-blue-500" : "text-gray-400"}`} />
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Drop your files here</p>
                  <p className="text-sm text-gray-400">or click to browse</p>
                </div>
              </>
            )}
          </div>

          <Input
            type="file"
            accept=".pdf,.txt"
            onChange={(e) => setFile(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        <div className="flex justify-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span>PDF</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>TXT</span>
          </div>
        </div>

        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >

          <div className="flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </div>

        </Button>

        {progress && (
          <div className={`flex items-center justify-center space-x-2 p-3 rounded-lg bg-gray-50/50 transition-all duration-500 ${getProgressColor()}`}>
            {getProgressIcon()}
            <span className="font-medium">{progress}</span>
          </div>
        )}

        {extractedText && (
          <div className="mt-6 p-4 rounded-lg bg-gray-100 text-sm text-gray-700 max-h-60 overflow-y-auto shadow-inner">
            <p className="font-semibold text-gray-800 mb-2">Extracted Text Preview:</p>
            <pre className="whitespace-pre-wrap">{extractedText}</pre>
          </div>
        )}

        {extractedText && (
          <div className="space-y-4">
            <Label className="font-medium text-gray-700">Ask a question about the document</Label>
            <Input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What are the strategic insights?"
              className="h-12"
            />
            <Button
              onClick={handleQuestionSubmit}
              disabled={!question || isThinking}
              className="w-full"
            >
              {isThinking ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating answer...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Submit Question</span>
                </div>
              )}
            </Button>
          </div>
        )}

        {answer && (
          <div className="mt-6 p-4 bg-indigo-50 text-sm text-gray-800 rounded-lg shadow">
            <p className="font-semibold text-indigo-700 mb-1">LLM Response:</p>
            <pre className="whitespace-pre-wrap text-gray-700">{answer}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default UploadIT;
