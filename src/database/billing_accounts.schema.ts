import DB, { T } from "./index.schema";

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log("Dropping Table:", "billing_accounts");
            await DB.schema.dropTableIfExists("billing_accounts");
        }

        const exists = await DB.schema.hasTable("billing_accounts");
        if (!exists) {
            await DB.schema.createTable("billing_accounts", (table) => {
                table.bigIncrements("id").primary();

                table
                    .bigInteger("workspace_id")
                    .unsigned()
                    .notNullable()
                    .references("id")
                    .inTable(T.WORKSPACES)
                    .onDelete("CASCADE")
                    .unique();

                table
                    .enu("billing_mode", ["credits", "subscription"])
                    .defaultTo("credits");

                table
                    .enu("status", ["active", "suspended"])
                    .defaultTo("active");

                table.string("provider", 40).nullable();
                table.string("provider_customer_id", 120).nullable();

                table.string("currency", 3).defaultTo("USD");

                // Cached value for fast reads (ledger is the truth)
                table.integer("credit_balance_cached").defaultTo(0);

                table.jsonb("settings_json").nullable();

                table.timestamp("created_at").defaultTo(DB.fn.now());
                table.timestamp("updated_at").defaultTo(DB.fn.now());

                table.index(["workspace_id"]);
                table.index(["billing_mode"]);
            });

            await DB.raw(`
            CREATE TRIGGER trg_billing_accounts_updated_at
            BEFORE UPDATE ON billing_accounts
            FOR EACH ROW
            EXECUTE PROCEDURE update_timestamp();
      `);
        }
    } catch (err) {
        console.error("billing_accounts.schema error", err);
    }
};
