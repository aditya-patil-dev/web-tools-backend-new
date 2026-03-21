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
            console.log("Dropping Table:", "tools_category_pages");
            await index_schema_1.default.schema.dropTableIfExists("tools_category_pages");
        }
        const exists = await index_schema_1.default.schema.hasTable("tools_category_pages");
        if (!exists) {
            await index_schema_1.default.schema.createTable("tools_category_pages", (table) => {
                table.bigIncrements("id").primary();
                table.string("category_slug", 160).notNullable().unique();
                table.string("page_title", 200).notNullable();
                table.text("page_description").nullable();
                table.text("page_intro").nullable();
                table.string("meta_title", 255).nullable();
                table.text("meta_description").nullable();
                table.text("meta_keywords").nullable();
                table.string("canonical_url", 255).nullable();
                table.boolean("noindex").defaultTo(false);
                table
                    .enu("status", ["draft", "published", "archived"])
                    .defaultTo("draft");
                table.timestamp("created_at").defaultTo(index_schema_1.default.fn.now());
                table.timestamp("updated_at").defaultTo(index_schema_1.default.fn.now());
                table.index(["status"]);
            });
            await index_schema_1.default.raw(`
                CREATE TRIGGER trg_tools_category_pages_updated_at
                BEFORE UPDATE ON tools_category_pages
                FOR EACH ROW
                EXECUTE PROCEDURE update_timestamp();
            `);
        }
    }
    catch (err) {
        console.error("tools_category_pages.schema error", err);
    }
};
exports.seed = seed;
//# sourceMappingURL=tools_category_pages.schema.js.map