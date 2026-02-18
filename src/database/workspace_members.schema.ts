import DB, { T } from "./index.schema";

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log("Dropping Table:", T.WORKSPACE_MEMBERS);
            await DB.schema.dropTableIfExists(T.WORKSPACE_MEMBERS);
            console.log("Dropped Table:", T.WORKSPACE_MEMBERS);
        }

        console.log("Creating Table:", T.WORKSPACE_MEMBERS);

        const exists = await DB.schema.hasTable(T.WORKSPACE_MEMBERS);
        if (!exists) {
            await DB.schema.createTable(T.WORKSPACE_MEMBERS, (table) => {
                table.bigIncrements("id").primary();

                table
                    .bigInteger("workspace_id")
                    .unsigned()
                    .notNullable()
                    .references("id")
                    .inTable(T.WORKSPACES)
                    .onDelete("CASCADE")
                    .comment("FK → workspaces.id");

                table
                    .bigInteger("user_id")
                    .unsigned()
                    .notNullable()
                    .references("id")
                    .inTable(T.USERS)
                    .onDelete("CASCADE")
                    .comment("FK → users.id");

                table
                    .enu("member_role", ["owner", "admin", "member", "viewer"])
                    .defaultTo("member");

                table
                    .enu("status", ["invited", "active", "removed"])
                    .defaultTo("active");

                table
                    .bigInteger("invited_by")
                    .unsigned()
                    .nullable()
                    .references("id")
                    .inTable(T.USERS)
                    .onDelete("SET NULL");

                table.dateTime("invited_at").nullable();
                table.dateTime("joined_at").nullable();

                table.timestamp("created_at").defaultTo(DB.fn.now());
                table.timestamp("updated_at").defaultTo(DB.fn.now());

                // Constraints/indexes
                table.unique(["workspace_id", "user_id"]);
                table.index(["workspace_id"]);
                table.index(["user_id"]);
                table.index(["status"]);
            });

            console.log("Created Table:", T.WORKSPACE_MEMBERS);

            console.log("Creating Trigger:", T.WORKSPACE_MEMBERS);
            await DB.raw(`
        CREATE TRIGGER trg_${T.WORKSPACE_MEMBERS}_updated_at
        BEFORE UPDATE ON ${T.WORKSPACE_MEMBERS}
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
      `);
            console.log("Created Trigger:", T.WORKSPACE_MEMBERS);
        } else {
            console.log("Table already exists:", T.WORKSPACE_MEMBERS);
        }
    } catch (error) {
        console.log("workspace_members.schema seed error:", error);
    }
};
