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
            console.log("Dropping Table:", index_schema_1.T.USER_TOKENS);
            await index_schema_1.default.schema.dropTableIfExists(index_schema_1.T.USER_TOKENS);
            console.log("Dropped Table:", index_schema_1.T.USER_TOKENS);
        }
        console.log("Creating Table:", index_schema_1.T.USER_TOKENS);
        const exists = await index_schema_1.default.schema.hasTable(index_schema_1.T.USER_TOKENS);
        if (!exists) {
            await index_schema_1.default.schema.createTable(index_schema_1.T.USER_TOKENS, (table) => {
                table.bigIncrements("id").primary();
                table
                    .bigInteger("user_id")
                    .unsigned()
                    .notNullable()
                    .references("id")
                    .inTable(index_schema_1.T.USERS)
                    .onDelete("CASCADE")
                    .comment("FK → users.id");
                table
                    .enu("token_type", ["otp", "password_reset", "refresh", "api_key"])
                    .notNullable();
                table.string("token_hash", 255).notNullable().comment("Store hash only, never raw token");
                table.jsonb("metadata_json").nullable().comment("Device/channel/etc");
                table.dateTime("expires_at").notNullable();
                table.dateTime("used_at").nullable();
                table.dateTime("revoked_at").nullable();
                table.timestamp("created_at").defaultTo(index_schema_1.default.fn.now());
                // Indexes
                table.index(["user_id"]);
                table.index(["token_type"]);
                table.index(["expires_at"]);
                table.unique(["token_type", "token_hash"]);
            });
            console.log("Created Table:", index_schema_1.T.USER_TOKENS);
        }
        else {
            console.log("Table already exists:", index_schema_1.T.USER_TOKENS);
        }
    }
    catch (error) {
        console.log("user_tokens.schema seed error:", error);
    }
};
exports.seed = seed;
//# sourceMappingURL=user_tokens.schema.js.map