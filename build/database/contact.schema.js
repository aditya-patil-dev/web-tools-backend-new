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
            console.log("Dropping Table:", "contact_messages");
            await index_schema_1.default.schema.dropTableIfExists("contact_messages");
        }
        const exists = await index_schema_1.default.schema.hasTable("contact_messages");
        if (!exists) {
            await index_schema_1.default.schema.createTable("contact_messages", (table) => {
                table.bigIncrements("id").primary();
                table.string("first_name", 120).notNullable();
                table.string("last_name", 120).notNullable();
                table.string("email", 255).notNullable();
                table.string("topic", 150).notNullable();
                table.string("subject", 255).nullable();
                table.text("message").notNullable();
                table
                    .enu("status", ["new", "read", "replied", "closed"])
                    .defaultTo("new");
                table.string("ip_address", 50);
                table.text("user_agent");
                table.timestamp("created_at").defaultTo(index_schema_1.default.fn.now());
                table.timestamp("updated_at").defaultTo(index_schema_1.default.fn.now());
                table.index(["email"]);
                table.index(["status"]);
                table.index(["created_at"]);
            });
        }
    }
    catch (err) {
        console.error("contact_messages.schema error", err);
    }
};
exports.seed = seed;
//# sourceMappingURL=contact.schema.js.map