import DB, { T } from "./index.schema";

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log("Dropping Table:", T.WORKSPACES);
            await DB.schema.dropTableIfExists(T.WORKSPACES);
            console.log("Dropped Table:", T.WORKSPACES);
        }

        console.log("Creating Table:", T.WORKSPACES);

        const exists = await DB.schema.hasTable(T.WORKSPACES);
        if (!exists) {
            await DB.schema.createTable(T.WORKSPACES, (table) => {
                table.bigIncrements("id").primary();

                table
                    .bigInteger("owner_user_id")
                    .unsigned()
                    .notNullable()
                    .references("id")
                    .inTable(T.USERS)
                    .onDelete("RESTRICT")
                    .comment("FK → users.id (workspace owner)");

                table.string("name", 120).notNullable();
                table.enu("type", ["personal", "team", "agency"]).defaultTo("personal");

                table.enu("status", ["active", "suspended"]).defaultTo("active");

                table.jsonb("settings_json").nullable().comment("Workspace settings");

                table.timestamp("created_at").defaultTo(DB.fn.now());
                table.timestamp("updated_at").defaultTo(DB.fn.now());

                // Indexes
                table.index(["owner_user_id"]);
                table.index(["status"]);
            });

            console.log("Created Table:", T.WORKSPACES);

            console.log("Creating Trigger:", T.WORKSPACES);
            await DB.raw(`
        CREATE TRIGGER trg_${T.WORKSPACES}_updated_at
        BEFORE UPDATE ON ${T.WORKSPACES}
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
      `);
            console.log("Created Trigger:", T.WORKSPACES);
        } else {
            console.log("Table already exists:", T.WORKSPACES);
        }
    } catch (error) {
        console.log("workspaces.schema seed error:", error);
    }
};
