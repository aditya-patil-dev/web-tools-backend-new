"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = void 0;
const index_schema_1 = __importDefault(require("./index.schema"));
const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log("Dropping Table:", "seo_robots_rules");
            await index_schema_1.default.schema.dropTableIfExists("seo_robots_rules");
        }
        const exists = await index_schema_1.default.schema.hasTable("seo_robots_rules");
        if (!exists) {
            await index_schema_1.default.schema.createTable("seo_robots_rules", (table) => {
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
                table.timestamp("created_at").defaultTo(index_schema_1.default.fn.now());
                table.timestamp("updated_at").defaultTo(index_schema_1.default.fn.now());
                /* =====================================
                   INDEXES
                ===================================== */
                table.index(["user_agent"]);
                table.index(["rule_type"]);
                table.index(["status"]);
                table.index(["environment"]);
            });
            await index_schema_1.default.raw(`
        CREATE TRIGGER trg_seo_robots_rules_updated_at
        BEFORE UPDATE ON seo_robots_rules
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
      `);
        }
    }
    catch (err) {
        console.error("seo_robots_rules.schema error", err);
    }
};
exports.seed = seed;
//# sourceMappingURL=seo-robots.schema.js.map