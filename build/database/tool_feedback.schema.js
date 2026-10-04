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
            console.log("Dropping Table:", "tool_feedback");
            await index_schema_1.default.schema.dropTableIfExists("tool_feedback");
        }
        const exists = await index_schema_1.default.schema.hasTable("tool_feedback");
        if (!exists) {
            await index_schema_1.default.schema.createTable("tool_feedback", (table) => {
                table.bigIncrements("id").primary();
                table.string("tool_slug", 150).notNullable();
                table.bigInteger("tool_id").nullable().references("id").inTable("tools").onDelete("SET NULL");
                table.string("rating", 20).notNullable(); // 'like' | 'dislike'
                table.text("reason").nullable(); // user explanation / why they disliked or feedback message
                table.string("session_id", 120).nullable();
                table.bigInteger("user_id").nullable();
                table.string("user_agent", 255).nullable();
                table.string("ip_address", 60).nullable();
                table.timestamp("created_at").defaultTo(index_schema_1.default.fn.now());
                // Indexes for fast querying & analytics
                table.index(["tool_slug"]);
                table.index(["rating"]);
                table.index(["created_at"]);
            });
            console.log("Created Table: tool_feedback");
        }
    }
    catch (err) {
        console.error("tool_feedback.schema error", err);
    }
};
exports.seed = seed;
//# sourceMappingURL=tool_feedback.schema.js.map