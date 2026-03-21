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
            console.log("Dropping Table:", index_schema_1.T.USERS);
            await index_schema_1.default.schema.dropTableIfExists(index_schema_1.T.USERS);
            console.log("Dropped Table:", index_schema_1.T.USERS);
        }
        console.log("Creating Table:", index_schema_1.T.USERS);
        const exists = await index_schema_1.default.schema.hasTable(index_schema_1.T.USERS);
        if (!exists) {
            await index_schema_1.default.schema.createTable(index_schema_1.T.USERS, (table) => {
                table.bigIncrements("id").primary().comment("Primary key, auto-increment");
                // Identity
                table.string("full_name", 150).notNullable().comment("User full name");
                table.string("email", 190).nullable().unique().comment("Email (unique, nullable)");
                table.string("phone_number", 30).nullable().unique().comment("Phone (unique, nullable)");
                table.string("profile_img", 500).nullable().comment("Profile image URL");
                table.enu("gender", ["male", "female", "other", "prefer_not_to_say"]).nullable();
                table.date("dob").nullable();
                // Auth (minimal)
                table.string("password_hash", 255).nullable().comment("Password hash (nullable for OAuth)");
                table.string("auth_provider", 40).defaultTo("local").comment("local/google/apple/github");
                // Verification
                table.boolean("email_verified").defaultTo(false);
                table.dateTime("email_verified_at").nullable();
                table.boolean("phone_verified").defaultTo(false);
                table.dateTime("phone_verified_at").nullable();
                // Role & Status
                table.enu("role", ["customer", "admin", "support"]).defaultTo("customer");
                table
                    .enu("account_status", ["pending", "active", "inactive", "banned", "locked"])
                    .defaultTo("active");
                // Security state
                table.integer("failed_login_attempts").defaultTo(0);
                table.dateTime("locked_until").nullable();
                table.dateTime("last_login_at").nullable();
                table.string("last_login_ip", 45).nullable();
                // Preferences (jsonb to keep table count low)
                table.jsonb("preferences_json").nullable().comment("User preferences JSON");
                // Audit + Soft delete
                table.bigInteger("created_by").unsigned().nullable();
                table.bigInteger("updated_by").unsigned().nullable();
                table.timestamp("created_at").defaultTo(index_schema_1.default.fn.now());
                table.timestamp("updated_at").defaultTo(index_schema_1.default.fn.now());
                table.boolean("is_deleted").defaultTo(false);
                table.timestamp("deleted_at").nullable();
                table.bigInteger("deleted_by").unsigned().nullable();
                // Helpful indexes
                table.index(["role"]);
                table.index(["account_status"]);
                table.index(["created_at"]);
            });
            console.log("Created Table:", index_schema_1.T.USERS);
            console.log("Creating Trigger:", index_schema_1.T.USERS);
            await index_schema_1.default.raw(`
        CREATE TRIGGER trg_${index_schema_1.T.USERS}_updated_at
        BEFORE UPDATE ON ${index_schema_1.T.USERS}
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
      `);
            console.log("Created Trigger:", index_schema_1.T.USERS);
        }
        else {
            console.log("Table already exists:", index_schema_1.T.USERS);
        }
    }
    catch (error) {
        console.log("users.schema seed error:", error);
    }
};
exports.seed = seed;
//# sourceMappingURL=users.schema.js.map