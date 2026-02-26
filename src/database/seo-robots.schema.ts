import DB from "./index.schema";

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log("Dropping Table:", "seo_robots_rules");
            await DB.schema.dropTableIfExists("seo_robots_rules");
        }

        const exists = await DB.schema.hasTable("seo_robots_rules");

        if (!exists) {
            await DB.schema.createTable("seo_robots_rules", (table) => {
                table.bigIncrements("id").primary();

                /* =====================================
                   USER AGENT
                ===================================== */

                table.string("user_agent", 120).notNullable().defaultTo("*");
                // Examples:
                // *
                // Googlebot
                // Bingbot

                /* =====================================
                   RULE TYPE
                ===================================== */

                table.enu("rule_type", ["allow", "disallow"]).notNullable();
                // allow
                // disallow

                /* =====================================
                   PATH
                ===================================== */

                table.string("path", 255).notNullable();
                // /admin
                // /api
                // /private

                /* =====================================
                   OPTIONAL CRAWL DELAY
                ===================================== */

                table.integer("crawl_delay").nullable();

                /* =====================================
                   STATUS CONTROL
                ===================================== */

                table.enu("status", ["active", "inactive"]).defaultTo("active");

                /* =====================================
                   ENVIRONMENT CONTROL (Optional but Powerful)
                ===================================== */

                table.enu("environment", [
                    "production",
                    "staging",
                    "development",
                ]).defaultTo("production");

                /* =====================================
                   ADMIN TRACKING
                ===================================== */

                table.bigInteger("created_by").nullable();
                table.bigInteger("updated_by").nullable();

                table.timestamp("created_at").defaultTo(DB.fn.now());
                table.timestamp("updated_at").defaultTo(DB.fn.now());

                /* =====================================
                   INDEXES
                ===================================== */

                table.index(["user_agent"]);
                table.index(["rule_type"]);
                table.index(["status"]);
                table.index(["environment"]);
            });

            await DB.raw(`
        CREATE TRIGGER trg_seo_robots_rules_updated_at
        BEFORE UPDATE ON seo_robots_rules
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
      `);
        }
    } catch (err) {
        console.error("seo_robots_rules.schema error", err);
    }
};