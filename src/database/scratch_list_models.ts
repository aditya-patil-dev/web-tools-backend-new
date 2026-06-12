import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

const listModels = async () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error("GEMINI_API_KEY is missing from environment.");
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  try {
    const response = await axios.get(url);
    console.log("=== Supported Gemini Models ===");
    const models = response.data.models || [];
    models.forEach((m: any) => {
      console.log(`- ${m.name} (supports generateContent: ${m.supportedGenerationMethods?.includes("generateContent")})`);
    });
  } catch (error: any) {
    console.error("Error listing models:", error.response?.data || error.message);
  }
};

listModels();
