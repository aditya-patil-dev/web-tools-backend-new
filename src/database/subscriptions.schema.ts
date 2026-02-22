import DB, { T } from "./index.schema";

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log("Dropping Table:", "subscriptions");
            await DB.schema.dropTableIfExists("subscriptions");
        }

        const exists = await DB.schema.hasTable("subscriptions");
        if (!exists) {
            await DB.schema.createTable("subscriptions", (table) => {
                table.bigIncrements("id").primary();

                table
                    .bigInteger("workspace_id")
                    .unsigned()
                    .notNullable()
                    .references("id")
                    .inTable(T.WORKSPACES)
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

                table.timestamp("created_at").defaultTo(DB.fn.now());
                table.timestamp("updated_at").defaultTo(DB.fn.now());

                table.index(["workspace_id"]);
                table.index(["status"]);
            });

            await DB.raw(`
        CREATE TRIGGER trg_subscriptions_updated_at
        BEFORE UPDATE ON subscriptions
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
      `);
        }
    } catch (err) {
        console.error("subscriptions.schema error", err);
    }
};
