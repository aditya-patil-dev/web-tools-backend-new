import { AIEngine } from "../ai";
import * as dotenv from "dotenv";

dotenv.config();

const test = async () => {
  const engine = AIEngine.getInstance();
  engine.switchProvider("gemini");
  console.log("Using Active Provider:", engine.getActiveProvider());

  const systemPrompt = `You are a world-class SEO Copywriter. 
Output format must be strictly a single, raw, parseable JSON object with NO markdown formatting, NO \`\`\`json wrappers, and NO leading/trailing backticks.
The JSON object MUST have exactly these keys:
   - "primary_focus_keyword": "...",
   - "meta_title": "...",
   - "meta_description": "...",
   - "page_title": "...",
   - "page_intro": "...",
   - "long_content": "...",
   - "features": [],
   - "faqs": [],
   - "tags": []`;

  const userPrompt = `Generate SEO optimized content for tool "Sitemap Generator", category "seo-tools".`;

  try {
    const response = await engine.prompt(userPrompt, systemPrompt);
    console.log("=== RAW LLM RESPONSE ===");
    console.log(response.content);
    console.log("========================");

    const cleaned = response.content.trim().replace(/^```json|```$/g, "").trim();
    console.log("=== CLEANED RESPONSE ===");
    console.log(cleaned);
    console.log("========================");

    const parsed = JSON.parse(cleaned);
    console.log("Parsed JSON Successfully!");
    console.log("Primary Keyword:", parsed.primary_focus_keyword);
  } catch (err: any) {
    console.error("Test Error:", err);
  }
};

test();
