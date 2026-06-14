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
const index_schema_1 = __importStar(require("./index.schema"));
const ai_1 = require("../ai");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
// ── Helper: Sleep/Delay ──────────────────────────────────────────────────────
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// ── Google Suggest Scraper ───────────────────────────────────────────────────
// Fetches real autocompletes from Google for high-intent search keywords
async function fetchGoogleSuggestions(query) {
    try {
        const url = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}&hl=en&gl=us`;
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
        });
        if (!response.ok)
            return [];
        const data = await response.json();
        return data[1] || [];
    }
    catch (error) {
        console.error(`[Suggest Error] Failed fetching suggests for: "${query}":`, error);
        return [];
    }
}
// Conducts keyword research for a tool by crawling different seed query variations
async function conductKeywordResearch(toolTitle) {
    const normalizedTitle = toolTitle.split("(")[0].trim().toLowerCase(); // Remove parentheticals (e.g. "Hash Generator (MD5...)")
    const seeds = [
        normalizedTitle,
        `${normalizedTitle} online`,
        `free ${normalizedTitle}`,
        `${normalizedTitle} tool`,
    ];
    const allSuggestions = new Set();
    for (const seed of seeds) {
        const suggestions = await fetchGoogleSuggestions(seed);
        suggestions.slice(0, 3).forEach((s) => allSuggestions.add(s.toLowerCase()));
    }
    return Array.from(allSuggestions);
}
// ── Main Generation Routine ──────────────────────────────────────────────────
async function generateToolSeo(tool, suggestedKeywords, engine, specifiedModel) {
    const systemPrompt = `You are a world-class, premium SEO Copywriter and Developer. 
Your objective is to generate uniquely structured, human-written, and conversion-optimized SEO data for a web tool.

Rules:
1. Output format must be strictly a single, raw, parseable JSON object with NO markdown formatting, NO \`\`\`json wrappers, and NO leading/trailing backticks.
2. The JSON object MUST have exactly these keys:
   - "primary_focus_keyword": A single high-volume, low-competition phrase matching user intent.
   - "meta_title": A catchy title under 60 characters containing the focus keyword, optimized for high click-through-rates (CTR).
   - "meta_description": An actionable, engaging description between 120 and 155 characters starting with an action verb, containing the focus keyword naturally.
   - "page_title": A compelling heading (H1 equivalent) that sounds professional yet highly accessible (e.g., "Free Online Image Compressor").
   - "page_intro": A concise, 2-3 sentence introductory hook (H2 sub-heading compatible) explaining the main benefit.
   - "long_content": An extremely comprehensive, detailed, and human-readable HTML guide of 300 to 500 words. 
     - Do NOT use <h1> tags (the layout already renders the page title as an H1).
     - Start directly with an <h2> tag for the overview.
     - Weave in <h2> and <h3> subheadings naturally.
     - Include a detailed step-by-step "How to Use" guide, explanation of why this tool is useful, and tips for best results.
     - Use clean semantic HTML like <p>, <ul>, <li>, <strong>, and <ol> tags.
     - The copy must read naturally, feel written by an expert human developer, and avoid robotic or repetitive keyword stuffing.
   - "features": An array of 3 to 5 items of shape { "title": "...", "description": "..." } highlighting key software features (e.g. secure processing, instant results, browser-based, no limits).
   - "faqs": An array of 3 to 5 high-quality, schema-friendly FAQs of shape { "question": "...", "answer": "..." } that actual users ask about this tool.
   - "tags": An array of 4 to 6 relevant search tags or keywords.`;
    const userPrompt = `Tool Details:
- Name: "${tool.title}"
- Slug: "${tool.slug}"
- Category: "${tool.category_slug}"
- Short Description: "${tool.short_description || "Free web utility tool"}"

Suggested Keywords from Real Search Suggestions:
${suggestedKeywords.map((k) => `- ${k}`).join("\n")}

Please perform comprehensive analysis, identify the absolute best low-competition primary focus keyword, and return the fully completed JSON output. Ensure all HTML inside "long_content" is beautifully structured and complete.`;
    const result = await engine.prompt(userPrompt, systemPrompt, Object.assign({ temperature: 0.65, maxTokens: 2500 }, (specifiedModel ? { model: specifiedModel } : {})));
    const cleanedContent = result.content.trim().replace(/^```json|```$/g, "").trim();
    try {
        const parsed = JSON.parse(cleanedContent);
        return parsed;
    }
    catch (error) {
        console.error(`[AI JSON Error] Failed to parse AI response for "${tool.title}". Content output was:`, result.content);
        throw new Error("AI output was not valid JSON");
    }
}
// ── Auto-Retry wrapper for Rate Limits ────────────────────────────────────────
async function generateToolSeoWithRetry(tool, suggestedKeywords, engine, retries = 3, delayMs = 65000, specifiedModel) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await generateToolSeo(tool, suggestedKeywords, engine, specifiedModel);
        }
        catch (error) {
            const isRateLimit = error.status === 429 ||
                String(error.message).includes("429") ||
                String(error.message).includes("Rate limit");
            if (isRateLimit && attempt < retries) {
                console.warn(`⚠️ [Rate Limit] Hit 429. Waiting ${delayMs / 1000}s before attempt ${attempt + 1}/${retries}...`);
                await sleep(delayMs);
                delayMs *= 1.5; // Exponential backoff
                continue;
            }
            throw error;
        }
    }
    throw new Error("Failed to generate SEO content after all retries");
}
// ── Execution Pipeline ───────────────────────────────────────────────────────
async function run() {
    var _a, _b;
    console.log("=========================================");
    console.log("🤖 STARTING AUTOMATED AI SEO OPTIMIZER  ");
    console.log("=========================================");
    // ── Parse arguments ──
    const args = process.argv.slice(2);
    const limitArg = args.find((a) => a.startsWith("--limit="));
    const dryRun = args.includes("--dry-run");
    const force = args.includes("--force");
    const providerArg = args.find((a) => a.startsWith("--provider="));
    const modelArg = args.find((a) => a.startsWith("--model="));
    const limit = limitArg ? Number(limitArg.split("=")[1]) : null;
    const specifiedProvider = providerArg ? providerArg.split("=")[1] : null;
    const specifiedModel = modelArg ? modelArg.split("=")[1] : null;
    // Initialize AI Engine
    const engine = ai_1.AIEngine.getInstance();
    if (specifiedProvider) {
        engine.switchProvider(specifiedProvider);
    }
    console.log(`Active AI Provider: ${engine.getActiveProvider().toUpperCase()}`);
    try {
        // 1. Retrieve all tools
        const tools = await (0, index_schema_1.default)(index_schema_1.T.TOOLS).select("*");
        console.log(`Found ${tools.length} total tools in database.`);
        let processedCount = 0;
        let skippedCount = 0;
        for (const tool of tools) {
            if (limit !== null && processedCount >= limit) {
                console.log(`Reached requested limit of ${limit} tools. Stopping.`);
                break;
            }
            console.log(`\n──────────────────────────────────────────────────`);
            console.log(`🔍 [${processedCount + skippedCount + 1}/${tools.length}] Analyzing: "${tool.title}" (${tool.slug})`);
            // Check if page already exists and has meta_title (unless force is active)
            if (!force) {
                const existingPage = await (0, index_schema_1.default)(index_schema_1.T.TOOL_PAGES).where({ tool_slug: tool.slug }).first();
                if (existingPage && existingPage.meta_title && existingPage.long_content) {
                    console.log(`⚡ Page already optimized. Skipping. Use --force to overwrite.`);
                    skippedCount++;
                    continue;
                }
            }
            // Step 2: Real-time keyword research
            console.log("🛰️ Fetching autocomplete keywords from Google Suggest...");
            const keywords = await conductKeywordResearch(tool.title);
            console.log(`   Found ${keywords.length} relevant autocomplete phrases.`);
            // Step 3: AI Copywriting Generation
            console.log(`🧠 Querying ${engine.getActiveProvider().toUpperCase()} LLM for SEO copy...`);
            let generatedData;
            try {
                generatedData = await generateToolSeoWithRetry(tool, keywords, engine, 3, 65000, specifiedModel);
            }
            catch (err) {
                console.error(`❌ Skip tool due to generation failure:`, err);
                continue;
            }
            console.log(`✨ AI Generation Successful!`);
            console.log(`   Primary Focus Keyword: "${generatedData.primary_focus_keyword}"`);
            console.log(`   Meta Title: "${generatedData.meta_title}"`);
            console.log(`   Meta Description Length: ${generatedData.meta_description.length} chars`);
            console.log(`   HTML Content Length: ${generatedData.long_content.length} characters`);
            console.log(`   Features Count: ${(_a = generatedData.features) === null || _a === void 0 ? void 0 : _a.length}`);
            console.log(`   FAQs Count: ${(_b = generatedData.faqs) === null || _b === void 0 ? void 0 : _b.length}`);
            if (dryRun) {
                console.log("🧪 [DRY RUN ACTIVE] Logging generated payload:");
                console.log(JSON.stringify(generatedData, null, 2));
            }
            else {
                console.log(`💾 Persisting data to database via transaction...`);
                await index_schema_1.default.transaction(async (trx) => {
                    // A. Update tools table
                    await trx(index_schema_1.T.TOOLS)
                        .where({ id: tool.id })
                        .update({
                        short_description: generatedData.meta_description,
                        tags: generatedData.tags || tool.tags,
                        updated_at: index_schema_1.default.fn.now(),
                    });
                    // B. Upsert tool_pages table
                    const existingPage = await trx(index_schema_1.T.TOOL_PAGES).where({ tool_slug: tool.slug }).first();
                    const canonicalUrl = `https://fusiontools.in/tools/${tool.category_slug}/${tool.slug}`;
                    const pageData = {
                        tool_slug: tool.slug,
                        page_title: generatedData.page_title,
                        page_intro: generatedData.page_intro,
                        long_content: generatedData.long_content,
                        features: JSON.stringify(generatedData.features),
                        faqs: JSON.stringify(generatedData.faqs),
                        meta_title: generatedData.meta_title,
                        meta_description: generatedData.meta_description,
                        meta_keywords: (generatedData.tags || []).join(", "),
                        canonical_url: canonicalUrl,
                        status: "active",
                        noindex: false,
                        updated_at: index_schema_1.default.fn.now(),
                    };
                    if (existingPage) {
                        await trx(index_schema_1.T.TOOL_PAGES).where({ id: existingPage.id }).update(pageData);
                    }
                    else {
                        await trx(index_schema_1.T.TOOL_PAGES).insert(Object.assign(Object.assign({}, pageData), { created_at: index_schema_1.default.fn.now() }));
                    }
                });
                console.log(`✅ Saved successfully!`);
            }
            processedCount++;
            // Delay to respect rate limits
            if (processedCount < tools.length) {
                console.log("⏱️ Cooling down for 5 seconds...");
                await sleep(5000);
            }
        }
        console.log("\n=========================================");
        console.log("🏁 PIPELINE COMPLETED SUCCESSFULLY!");
        console.log(`📊 Total Tools Analyzed: ${tools.length}`);
        console.log(`📈 Optimized / Generated: ${processedCount}`);
        console.log(`⚡ Skipped (Already Optimized): ${skippedCount}`);
        console.log("=========================================");
    }
    catch (error) {
        console.error("🔴 Fatal Error running pipeline:", error);
    }
    finally {
        await index_schema_1.default.destroy();
    }
}
run().catch(console.error);
//# sourceMappingURL=optimize_tools_seo.js.map