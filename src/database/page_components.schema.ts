import DB from "./index.schema";

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log("Dropping Table:", "page_components");
            await DB.schema.dropTableIfExists("page_components");
        }

        const exists = await DB.schema.hasTable("page_components");

        if (!exists) {
            await DB.schema.createTable("page_components", (table) => {
                table.bigIncrements("id").primary();

                /* =========================
                   Page & Component Info
                ========================== */

                table.string("page_key", 80).notNullable();
                // Examples: 'home', 'about', 'pricing', 'contact'

                table.string("component_type", 100).notNullable();
                // Examples: 'hero', 'popular-tools', 'why-choose-us', 
                // 'how-it-works', 'final-cta', 'seo-content'

                table.integer("component_order").notNullable().defaultTo(1);
                // Display order on the page

                table.string("component_name", 255).nullable();
                // Human-readable name for admin panel

                /* =========================
                   Component Content (JSON)
                ========================== */

                table.jsonb("component_data").notNullable();
                // All component content stored as JSON

                /* =========================
                   Settings
                ========================== */

                table.boolean("is_active").defaultTo(true);
                table.enu("status", ["active", "draft", "archived"]).defaultTo("active");

                /* =========================
                   Version Control
                ========================== */

                table.integer("version").defaultTo(1);
                table.jsonb("version_history").nullable();
                // Store previous versions for rollback

                /* =========================
                   Audit
                ========================== */

                table.bigInteger("created_by").nullable();
                table.bigInteger("updated_by").nullable();

                table.timestamp("created_at").defaultTo(DB.fn.now());
                table.timestamp("updated_at").defaultTo(DB.fn.now());

                /* =========================
                   Indexes
                ========================== */

                table.index(["page_key"]);
                table.index(["component_type"]);
                table.index(["is_active"]);
                table.index(["status"]);
                table.unique(["page_key", "component_type"]);
            });

            await DB.raw(`
                CREATE TRIGGER trg_page_components_updated_at
                BEFORE UPDATE ON page_components
                FOR EACH ROW
                EXECUTE PROCEDURE update_timestamp();
            `);

            console.log("✅ Table created: page_components");
        }
    } catch (err) {
        console.error("page_components.schema error", err);
    }
};