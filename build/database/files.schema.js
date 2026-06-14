"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = void 0;
const index_schema_1 = __importStar(require("./index.schema"));
const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log("Dropping Table:", "files");
            await index_schema_1.default.schema.dropTableIfExists("files");
        }
        const exists = await index_schema_1.default.schema.hasTable("files");
        if (!exists) {
            await index_schema_1.default.schema.createTable("files", (table) => {
                table.bigIncrements("id").primary();
                // Storage backend
                table.enu("provider", ["local", "s3", "gcs", "imagekit"]).notNullable().defaultTo("local");
                table.string("bucket", 120).nullable();
                table.text("key").notNullable();
                table.text("url").notNullable();
                // File metadata
                table.string("original_name", 255).notNullable();
                table.string("mime_type", 120).notNullable();
                table.bigInteger("size_bytes").notNullable();
                table.string("ext", 20).nullable();
                // Access control (future-proof)
                table.enu("visibility", ["public", "private"]).notNullable().defaultTo("public");
                // Who uploaded (optional FK)
                table
                    .bigInteger("uploaded_by")
                    .unsigned()
                    .nullable()
                    .references("id")
                    .inTable(index_schema_1.T.USERS)
                    .onDelete("SET NULL");
                // Optional grouping (helps when you add modules later)
                table.string("folder", 80).nullable();
                table.jsonb("meta_json").nullable();
                table.timestamp("created_at").defaultTo(index_schema_1.default.fn.now());
                table.timestamp("updated_at").defaultTo(index_schema_1.default.fn.now());
                // Indexes
                table.index(["provider"]);
                table.index(["visibility"]);
                table.index(["uploaded_by"]);
                table.index(["folder"]);
            });
            await index_schema_1.default.raw(`
        CREATE TRIGGER trg_files_updated_at
        BEFORE UPDATE ON files
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
      `);
        }
    }
    catch (err) {
        console.error("files.schema error", err);
    }
};
exports.seed = seed;
//# sourceMappingURL=files.schema.js.map