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
            console.log("Dropping Table:", "credit_ledger");
            await index_schema_1.default.schema.dropTableIfExists("credit_ledger");
        }
        const exists = await index_schema_1.default.schema.hasTable("credit_ledger");
        if (!exists) {
            await index_schema_1.default.schema.createTable("credit_ledger", (table) => {
                table.bigIncrements("id").primary();
                table
                    .bigInteger("workspace_id")
                    .unsigned()
                    .notNullable()
                    .references("id")
                    .inTable(index_schema_1.T.WORKSPACES)
                    .onDelete("CASCADE");
                table
                    .bigInteger("user_id")
                    .unsigned()
                    .nullable()
                    .references("id")
                    .inTable(index_schema_1.T.USERS)
                    .onDelete("SET NULL");
                table
                    .enu("entry_type", [
                    "grant",
                    "purchase",
                    "usage",
                    "refund",
                    "adjustment",
                    "expire",
                ])
                    .notNullable();
                table.integer("amount").notNullable();
                table.string("reference_type", 40).nullable();
                table.string("reference_id", 120).nullable();
                table.string("description", 255).nullable();
                table.jsonb("metadata_json").nullable();
                table.timestamp("created_at").defaultTo(index_schema_1.default.fn.now());
                table.index(["workspace_id"]);
                table.index(["entry_type"]);
                table.index(["created_at"]);
            });
        }
    }
    catch (err) {
        console.error("credit_ledger.schema error", err);
    }
};
exports.seed = seed;
//# sourceMappingURL=credit_ledger.schema.js.map