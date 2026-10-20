import DB, { T } from "../../database/index.schema";
import { imageToolsSeoData } from "./data/image-tools.data";
import { pdfToolsSeoData } from "./data/pdf-tools.data";
import { developerToolsSeoData } from "./data/developer-tools.data";
import { seoToolsSeoData } from "./data/seo-tools.data";
import { textToolsSeoData } from "./data/text-tools.data";
import { ToolPageFormData } from "./data/types";

/**
 * Normalizes JSON/Array fields for PostgreSQL Knex insert/update
 */
function preparePayload(item: ToolPageFormData) {
  return {
    page_title: item.page_title,
    page_intro: item.page_intro ?? null,
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
    meta_title: item.meta_title ?? null,
    meta_description: item.meta_description ?? null,
    meta_keywords: Array.isArray(item.meta_keywords)
      ? item.meta_keywords
      : typeof item.meta_keywords === "string"
        ? item.meta_keywords.split(",").map((s) => s.trim())
        : null,
    canonical_url: item.canonical_url ?? null,
    noindex: item.noindex ?? false,
    schema_markup: item.schema_markup
      ? typeof item.schema_markup === "string"
        ? item.schema_markup
        : JSON.stringify(item.schema_markup)
      : null,
    status: item.status ?? "active",
    updated_at: DB.fn.now(),
  };
}

async function upsertSeoData(toolsData: ToolPageFormData[], categoryLabel: string) {
  console.log(`\n======================================================`);
  console.log(`🚀 Starting SEO Content Update for: ${categoryLabel}`);
  console.log(`======================================================\n`);

  let updatedCount = 0;
  let insertedCount = 0;

  for (const item of toolsData) {
    const slug = item.tool_slug;

    // Verify parent tool existence in `tools` table
    const toolRecord = await DB(T.TOOLS).where("slug", slug).first();
    if (!toolRecord) {
      console.warn(`⚠️ Warning: Slug "${slug}" does not exist in the "tools" table. Proceeding anyway.`);
    }

    const payload = preparePayload(item);

    const existingPage = await DB(T.TOOL_PAGES).where("tool_slug", slug).first();

    if (existingPage) {
      await DB(T.TOOL_PAGES).where("tool_slug", slug).update(payload);
      console.log(`✅ [UPDATED]  ${slug} -> "${item.page_title.substring(0, 50)}..."`);
      updatedCount++;
    } else {
      await DB(T.TOOL_PAGES).insert({
        tool_slug: slug,
        ...payload,
        created_at: DB.fn.now(),
      });
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
  const targetCategory = process.argv[2]?.toLowerCase();

  try {
    if (!targetCategory || targetCategory === "image" || targetCategory === "all") {
      await upsertSeoData(imageToolsSeoData, "Image Tools (13 tools)");
    }
    if (!targetCategory || targetCategory === "pdf" || targetCategory === "all") {
      await upsertSeoData(pdfToolsSeoData, "PDF Tools (8 tools)");
    }
    if (!targetCategory || targetCategory === "dev" || targetCategory === "developer" || targetCategory === "developer-tools" || targetCategory === "all") {
      await upsertSeoData(developerToolsSeoData, "Developer Tools (6 tools)");
    }
    if (!targetCategory || targetCategory === "seo" || targetCategory === "seo-tools" || targetCategory === "all") {
      await upsertSeoData(seoToolsSeoData, "SEO & Webmaster Tools (6 tools)");
    }
    if (!targetCategory || targetCategory === "text" || targetCategory === "text-tools" || targetCategory === "all") {
      await upsertSeoData(textToolsSeoData, "Text Tools (1 tool)");
    }
  } catch (error) {
    console.error("❌ Error running SEO update script:", error);
    process.exit(1);
  } finally {
    await DB.destroy();
    process.exit(0);
  }
}

run();
