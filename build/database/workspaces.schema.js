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
            console.log("Dropping Table:", index_schema_1.T.WORKSPACES);
            await index_schema_1.default.schema.dropTableIfExists(index_schema_1.T.WORKSPACES);
            console.log("Dropped Table:", index_schema_1.T.WORKSPACES);
        }
        console.log("Creating Table:", index_schema_1.T.WORKSPACES);
        const exists = await index_schema_1.default.schema.hasTable(index_schema_1.T.WORKSPACES);
        if (!exists) {
            await index_schema_1.default.schema.createTable(index_schema_1.T.WORKSPACES, (table) => {
                table.bigIncrements("id").primary();
                table
                    .bigInteger("owner_user_id")
                    .unsigned()
                    .notNullable()
                    .references("id")
                    .inTable(index_schema_1.T.USERS)
                    .onDelete("RESTRICT")
                    .comment("FK → users.id (workspace owner)");
                table.string("name", 120).notNullable();
                table.enu("type", ["personal", "team", "agency"]).defaultTo("personal");
                table.enu("status", ["active", "suspended"]).defaultTo("active");
                table.jsonb("settings_json").nullable().comment("Workspace settings");
                table.timestamp("created_at").defaultTo(index_schema_1.default.fn.now());
                table.timestamp("updated_at").defaultTo(index_schema_1.default.fn.now());
                // Indexes
                table.index(["owner_user_id"]);
                table.index(["status"]);
            });
            console.log("Created Table:", index_schema_1.T.WORKSPACES);
            console.log("Creating Trigger:", index_schema_1.T.WORKSPACES);
            await index_schema_1.default.raw(`
        CREATE TRIGGER trg_${index_schema_1.T.WORKSPACES}_updated_at
        BEFORE UPDATE ON ${index_schema_1.T.WORKSPACES}
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
      `);
            console.log("Created Trigger:", index_schema_1.T.WORKSPACES);
        }
        else {
            console.log("Table already exists:", index_schema_1.T.WORKSPACES);
        }
    }
    catch (error) {
        console.log("workspaces.schema seed error:", error);
    }
};
exports.seed = seed;
//# sourceMappingURL=workspaces.schema.js.map