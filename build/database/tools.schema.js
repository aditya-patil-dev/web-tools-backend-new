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
            console.log("Dropping Table:", "tools");
            await index_schema_1.default.schema.dropTableIfExists("tools");
        }
        const exists = await index_schema_1.default.schema.hasTable("tools");
        if (!exists) {
            await index_schema_1.default.schema.createTable("tools", (table) => {
                table.bigIncrements("id").primary();
                table.string("title", 150).notNullable();
                table.string("slug", 160).notNullable().unique();
                table.string("category_slug", 120).notNullable();
                table.string("tool_type", 120).notNullable();
                table.specificType("tags", "text[]").nullable();
                table.text("short_description").nullable();
                table.string("badge", 60).nullable();
                table.decimal("rating", 3, 2).defaultTo(0.0);
                table.integer("sort_order").defaultTo(0);
                table.boolean("is_featured").defaultTo(false);
                table.bigInteger("views").defaultTo(0);
                table.bigInteger("users_count").defaultTo(0);
                table.timestamp("last_used_at").nullable();
                table.enu("access_level", ["free", "pro", "premium"]).defaultTo("free");
                table.integer("daily_limit").nullable();
                table.integer("monthly_limit").nullable();
                table.string("tool_url", 255).notNullable();
                table.enu("status", ["active", "draft", "archived"]).defaultTo("draft");
                table.timestamp("created_at").defaultTo(index_schema_1.default.fn.now());
                table.timestamp("updated_at").defaultTo(index_schema_1.default.fn.now());
                table.index(["slug"]);
                table.index(["category_slug"]);
                table.index(["tool_type"]);
                table.index(["access_level"]);
                table.index(["status"]);
                table.index(["is_featured"]);
            });
            await index_schema_1.default.raw(`
                CREATE TRIGGER trg_tools_updated_at
                BEFORE UPDATE ON tools
                FOR EACH ROW
                EXECUTE PROCEDURE update_timestamp();
            `);
        }
    }
    catch (err) {
        console.error("tools.schema error", err);
    }
};
exports.seed = seed;
//# sourceMappingURL=tools.schema.js.map