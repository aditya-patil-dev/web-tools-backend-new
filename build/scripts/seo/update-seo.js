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
const index_schema_1 = __importStar(require("../../database/index.schema"));
const image_tools_data_1 = require("./data/image-tools.data");
const pdf_tools_data_1 = require("./data/pdf-tools.data");
const developer_tools_data_1 = require("./data/developer-tools.data");
const seo_tools_data_1 = require("./data/seo-tools.data");
const text_tools_data_1 = require("./data/text-tools.data");
/**
 * Normalizes JSON/Array fields for PostgreSQL Knex insert/update
 */
function preparePayload(item) {
    var _a, _b, _c, _d, _e, _f;
    return {
        page_title: item.page_title,
        page_intro: (_a = item.page_intro) !== null && _a !== void 0 ? _a : null,
        long_content: item.long_content ? item.long_content.trim() : null,
        features: item.features
            ? typeof item.features === "string"
                ? item.features
                : JSON.stringify(item.features)
            : null,
        faqs: item.faqs
            ? typeof item.faqs === "string"
                ? item.faqs
                : JSON.stringify(item.faqs)
            : null,
        meta_title: (_b = item.meta_title) !== null && _b !== void 0 ? _b : null,
        meta_description: (_c = item.meta_description) !== null && _c !== void 0 ? _c : null,
        meta_keywords: Array.isArray(item.meta_keywords)
            ? item.meta_keywords
            : typeof item.meta_keywords === "string"
                ? item.meta_keywords.split(",").map((s) => s.trim())
                : null,
        canonical_url: (_d = item.canonical_url) !== null && _d !== void 0 ? _d : null,
        noindex: (_e = item.noindex) !== null && _e !== void 0 ? _e : false,
        schema_markup: item.schema_markup
            ? typeof item.schema_markup === "string"
                ? item.schema_markup
                : JSON.stringify(item.schema_markup)
            : null,
        status: (_f = item.status) !== null && _f !== void 0 ? _f : "active",
        updated_at: index_schema_1.default.fn.now(),
    };
}
async function upsertSeoData(toolsData, categoryLabel) {
    console.log(`\n======================================================`);
    console.log(`🚀 Starting SEO Content Update for: ${categoryLabel}`);
    console.log(`======================================================\n`);
    let updatedCount = 0;
    let insertedCount = 0;
    for (const item of toolsData) {
        const slug = item.tool_slug;
        // Verify parent tool existence in `tools` table
        const toolRecord = await (0, index_schema_1.default)(index_schema_1.T.TOOLS).where("slug", slug).first();
        if (!toolRecord) {
            console.warn(`⚠️ Warning: Slug "${slug}" does not exist in the "tools" table. Proceeding anyway.`);
        }
        const payload = preparePayload(item);
        const existingPage = await (0, index_schema_1.default)(index_schema_1.T.TOOL_PAGES).where("tool_slug", slug).first();
        if (existingPage) {
            await (0, index_schema_1.default)(index_schema_1.T.TOOL_PAGES).where("tool_slug", slug).update(payload);
            console.log(`✅ [UPDATED]  ${slug} -> "${item.page_title.substring(0, 50)}..."`);
            updatedCount++;
        }
        else {
            await (0, index_schema_1.default)(index_schema_1.T.TOOL_PAGES).insert(Object.assign(Object.assign({ tool_slug: slug }, payload), { created_at: index_schema_1.default.fn.now() }));
            console.log(`✨ [INSERTED] ${slug} -> "${item.page_title.substring(0, 50)}..."`);
            insertedCount++;
        }
    }
    console.log(`\n------------------------------------------------------`);
    console.log(`🎉 Finished ${categoryLabel} SEO Update!`);
    console.log(`   Updated:  ${updatedCount}`);
    console.log(`   Inserted: ${insertedCount}`);
    console.log(`   Total:    ${toolsData.length}`);
    console.log(`------------------------------------------------------\n`);
}
async function run() {
    var _a;
    const targetCategory = (_a = process.argv[2]) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    try {
        if (!targetCategory || targetCategory === "image" || targetCategory === "all") {
            await upsertSeoData(image_tools_data_1.imageToolsSeoData, "Image Tools (13 tools)");
        }
        if (!targetCategory || targetCategory === "pdf" || targetCategory === "all") {
            await upsertSeoData(pdf_tools_data_1.pdfToolsSeoData, "PDF Tools (8 tools)");
        }
        if (!targetCategory || targetCategory === "dev" || targetCategory === "developer" || targetCategory === "developer-tools" || targetCategory === "all") {
            await upsertSeoData(developer_tools_data_1.developerToolsSeoData, "Developer Tools (6 tools)");
        }
        if (!targetCategory || targetCategory === "seo" || targetCategory === "seo-tools" || targetCategory === "all") {
            await upsertSeoData(seo_tools_data_1.seoToolsSeoData, "SEO & Webmaster Tools (6 tools)");
        }
        if (!targetCategory || targetCategory === "text" || targetCategory === "text-tools" || targetCategory === "all") {
            await upsertSeoData(text_tools_data_1.textToolsSeoData, "Text Tools (1 tool)");
        }
    }
    catch (error) {
        console.error("❌ Error running SEO update script:", error);
        process.exit(1);
    }
    finally {
        await index_schema_1.default.destroy();
        process.exit(0);
    }
}
run();
//# sourceMappingURL=update-seo.js.map