"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const ai_1 = require("../ai");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const test = async () => {
    const engine = ai_1.AIEngine.getInstance();
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
    }
    catch (err) {
        console.error("Test Error:", err);
    }
};
test();
//# sourceMappingURL=scratch_test_ai.js.map