import DB from "./index.schema";

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log("Dropping Table:", "plans");
            await DB.schema.dropTableIfExists("plans");
        }

        const exists = await DB.schema.hasTable("plans");
        if (!exists) {
            await DB.schema.createTable("plans", (table) => {
                table.bigIncrements("id").primary();

                table.string("code", 60).notNullable().unique();
                table
                    .enu("plan_type", ["subscription", "credit_pack", "addon"])
                    .notNullable();

                table.string("name", 120).notNullable();
                table.text("description").nullable();

                table.decimal("price_amount", 12, 2).notNullable();
                table.string("price_currency", 3).defaultTo("USD");

                table
                    .enu("billing_interval", ["monthly", "yearly"])
                    .nullable();

                table.integer("included_credits").nullable();
                table.jsonb("limits_json").nullable();

                table.string("provider_price_id", 120).nullable();

                table.boolean("is_active").defaultTo(true);

                table.timestamp("created_at").defaultTo(DB.fn.now());
                table.timestamp("updated_at").defaultTo(DB.fn.now());

                table.index(["plan_type"]);
                table.index(["is_active"]);
            });

            await DB.raw(`
        CREATE TRIGGER trg_plans_updated_at
        BEFORE UPDATE ON plans
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
      `);
        }
    } catch (err) {
        console.error("plans.schema error", err);
    }
};
