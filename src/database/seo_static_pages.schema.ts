import DB from "./index.schema";

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log("Dropping Table:", "seo_static_pages");
            await DB.schema.dropTableIfExists("seo_static_pages");
        }

        const exists = await DB.schema.hasTable("seo_static_pages");

        if (!exists) {
            await DB.schema.createTable("seo_static_pages", (table) => {
                table.bigIncrements("id").primary();

                /* =========================
                   Page Identification
                ========================== */

                table.string("page_key", 80).notNullable().unique();
                // Example:
                // home
                // about
                // pricing
                // contact

                /* =========================
                   SEO Core Fields
                ========================== */

                table.string("meta_title", 255).nullable();
                table.text("meta_description").nullable();
                table.specificType("meta_keywords", "text[]").nullable();

                table.string("canonical_url", 255).nullable();

                table.string("og_image", 255).nullable();

                /* =========================
                   Robots Control
                ========================== */

                table.boolean("noindex").defaultTo(false);
                table.boolean("nofollow").defaultTo(false);

                /* =========================
                   Sitemap Control
                ========================== */

                table.decimal("priority", 2, 1).defaultTo(0.8);
                table.enu("changefreq", [
                    "always",
                    "hourly",
                    "daily",
                    "weekly",
                    "monthly",
                    "yearly",
                    "never",
                ]).defaultTo("weekly");

                /* =========================
                   Status & Versioning
                ========================== */

                table.enu("status", ["active", "draft"]).defaultTo("active");

                table.integer("version").defaultTo(1);

                /* =========================
                   Analytics / Logs Fields
                ========================== */

                table.bigInteger("impressions").defaultTo(0);
                table.bigInteger("clicks").defaultTo(0);
                table.decimal("ctr", 5, 2).defaultTo(0.0);

                table.timestamp("last_indexed_at").nullable();
                table.timestamp("last_modified_by_admin_at").nullable();

                /* =========================
                   Audit Logs
                ========================== */

                table.bigInteger("created_by").nullable();
                table.bigInteger("updated_by").nullable();

                table.timestamp("created_at").defaultTo(DB.fn.now());
                table.timestamp("updated_at").defaultTo(DB.fn.now());

                /* =========================
                   Indexes
                ========================== */

                table.index(["page_key"]);
                table.index(["status"]);
                table.index(["noindex"]);
                table.index(["updated_at"]);
            });

            await DB.raw(`
                CREATE TRIGGER trg_seo_static_pages_updated_at
                BEFORE UPDATE ON seo_static_pages
                FOR EACH ROW
                EXECUTE PROCEDURE update_timestamp();
            `);
        }
    } catch (err) {
        console.error("seo_static_pages.schema error", err);
    }
};