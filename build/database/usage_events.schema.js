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
            console.log("Dropping Table:", "usage_events");
            await index_schema_1.default.schema.dropTableIfExists("usage_events");
        }
        const exists = await index_schema_1.default.schema.hasTable("usage_events");
        if (!exists) {
            await index_schema_1.default.schema.createTable("usage_events", (table) => {
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
                    .notNullable()
                    .references("id")
                    .inTable(index_schema_1.T.USERS)
                    .onDelete("CASCADE");
                table.string("tool_key", 80).notNullable();
                table.integer("units").defaultTo(1);
                table
                    .enu("charge_mode", ["credits", "subscription", "free", "admin"])
                    .notNullable();
                table.integer("charged_credits").defaultTo(0);
                table
                    .enu("status", ["success", "failed", "canceled"])
                    .defaultTo("success");
                table.string("idempotency_key", 80).nullable().unique();
                table.string("provider", 40).nullable();
                table.string("provider_request_id", 120).nullable();
                table.jsonb("metadata_json").nullable();
                table.timestamp("created_at").defaultTo(index_schema_1.default.fn.now());
                table.index(["workspace_id"]);
                table.index(["user_id"]);
                table.index(["tool_key"]);
                table.index(["created_at"]);
            });
        }
    }
    catch (err) {
        console.error("usage_events.schema error", err);
    }
};
exports.seed = seed;
//# sourceMappingURL=usage_events.schema.js.map