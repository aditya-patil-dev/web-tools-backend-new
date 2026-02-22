import DB, { T } from "./index.schema";

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log("Dropping Table:", "credit_ledger");
            await DB.schema.dropTableIfExists("credit_ledger");
        }

        const exists = await DB.schema.hasTable("credit_ledger");
        if (!exists) {
            await DB.schema.createTable("credit_ledger", (table) => {
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
                    .nullable()
                    .references("id")
                    .inTable(T.USERS)
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

                table.timestamp("created_at").defaultTo(DB.fn.now());

                table.index(["workspace_id"]);
                table.index(["entry_type"]);
                table.index(["created_at"]);
            });
        }
    } catch (err) {
        console.error("credit_ledger.schema error", err);
    }
};
