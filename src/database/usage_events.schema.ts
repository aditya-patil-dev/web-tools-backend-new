import DB, { T } from "./index.schema";

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log("Dropping Table:", "usage_events");
            await DB.schema.dropTableIfExists("usage_events");
        }

        const exists = await DB.schema.hasTable("usage_events");
        if (!exists) {
            await DB.schema.createTable("usage_events", (table) => {
                table.bigIncrements("id").primary();

                table
                    .bigInteger("workspace_id")
                    .unsigned()
                    .notNullable()
                    .references("id")
                    .inTable(T.WORKSPACES)
                    .onDelete("CASCADE");

                table
                    .bigInteger("user_id")
                    .unsigned()
                    .notNullable()
                    .references("id")
                    .inTable(T.USERS)
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

                table.timestamp("created_at").defaultTo(DB.fn.now());

                table.index(["workspace_id"]);
                table.index(["user_id"]);
                table.index(["tool_key"]);
                table.index(["created_at"]);
            });
        }
    } catch (err) {
        console.error("usage_events.schema error", err);
    }
};
