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
            console.log("Dropping Table:", "subscriptions");
            await index_schema_1.default.schema.dropTableIfExists("subscriptions");
        }
        const exists = await index_schema_1.default.schema.hasTable("subscriptions");
        if (!exists) {
            await index_schema_1.default.schema.createTable("subscriptions", (table) => {
                table.bigIncrements("id").primary();
                table
                    .bigInteger("workspace_id")
                    .unsigned()
                    .notNullable()
                    .references("id")
                    .inTable(index_schema_1.T.WORKSPACES)
                    .onDelete("CASCADE");
                table.string("plan_code", 60).notNullable();
                table.string("provider", 40).nullable();
                table.string("provider_subscription_id", 120).nullable();
                table
                    .enu("status", [
                    "trialing",
                    "active",
                    "past_due",
                    "canceled",
                    "paused",
                    "expired",
                ])
                    .defaultTo("trialing");
                table.dateTime("current_period_start").nullable();
                table.dateTime("current_period_end").nullable();
                table.boolean("cancel_at_period_end").defaultTo(false);
                table.dateTime("canceled_at").nullable();
                table.dateTime("trial_ends_at").nullable();
                table.timestamp("created_at").defaultTo(index_schema_1.default.fn.now());
                table.timestamp("updated_at").defaultTo(index_schema_1.default.fn.now());
                table.index(["workspace_id"]);
                table.index(["status"]);
            });
            await index_schema_1.default.raw(`
        CREATE TRIGGER trg_subscriptions_updated_at
        BEFORE UPDATE ON subscriptions
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
      `);
        }
    }
    catch (err) {
        console.error("subscriptions.schema error", err);
    }
};
exports.seed = seed;
//# sourceMappingURL=subscriptions.schema.js.map