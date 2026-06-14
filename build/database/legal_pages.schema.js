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
            console.log("Dropping Table:", "legal_pages");
            await index_schema_1.default.schema.dropTableIfExists("legal_pages");
        }
        const exists = await index_schema_1.default.schema.hasTable("legal_pages");
        if (!exists) {
            await index_schema_1.default.schema.createTable("legal_pages", (table) => {
                table.bigIncrements("id").primary();
                /*
                IDENTIFICATION
                */
                table
                    .string("page_key", 120)
                    .notNullable()
                    .unique();
                // privacy-policy, terms-and-conditions
                table
                    .string("slug", 160)
                    .notNullable()
                    .unique();
                table
                    .string("title", 255)
                    .notNullable();
                /*
                CONTENT
                */
                table
                    .text("content")
                    .notNullable();
                // HTML content
                table
                    .jsonb("content_json")
                    .defaultTo(index_schema_1.default.raw(`'{}'::jsonb`));
                // optional EditorJS / block content
                /*
                SEO
                */
                table.string("meta_title", 255);
                table.text("meta_description");
                table.string("canonical_url", 500);
                table
                    .boolean("noindex")
                    .defaultTo(false);
                /*
                STATUS
                */
                table
                    .enu("status", ["draft", "published"])
                    .defaultTo("draft");
                /*
                VERSION CONTROL
                */
                table
                    .integer("version")
                    .defaultTo(1);
                table.text("version_notes");
                table
                    .jsonb("change_log")
                    .defaultTo(index_schema_1.default.raw(`'[]'::jsonb`));
                /*
                AUDIT
                */
                table.string("created_by", 120);
                table.string("updated_by", 120);
                table.timestamp("created_at").defaultTo(index_schema_1.default.fn.now());
                table.timestamp("updated_at").defaultTo(index_schema_1.default.fn.now());
                /*
                INDEXES (IMPORTANT)
                */
                table.index(["slug"]);
                table.index(["page_key"]);
                table.index(["status"]);
                table.index(["created_at"]);
            });
        }
    }
    catch (err) {
        console.error("legal_pages.schema error", err);
    }
};
exports.seed = seed;
//# sourceMappingURL=legal_pages.schema.js.map