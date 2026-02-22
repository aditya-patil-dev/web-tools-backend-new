import DB, { T } from "./index.schema";

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log("Dropping Table:", T.USERS);
            await DB.schema.dropTableIfExists(T.USERS);
            console.log("Dropped Table:", T.USERS);
        }

        console.log("Creating Table:", T.USERS);

        const exists = await DB.schema.hasTable(T.USERS);
        if (!exists) {
            await DB.schema.createTable(T.USERS, (table) => {
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
                table.timestamp("created_at").defaultTo(DB.fn.now());
                table.timestamp("updated_at").defaultTo(DB.fn.now());
                table.boolean("is_deleted").defaultTo(false);
                table.timestamp("deleted_at").nullable();
                table.bigInteger("deleted_by").unsigned().nullable();

                // Helpful indexes
                table.index(["role"]);
                table.index(["account_status"]);
                table.index(["created_at"]);
            });

            console.log("Created Table:", T.USERS);

            console.log("Creating Trigger:", T.USERS);
            await DB.raw(`
        CREATE TRIGGER trg_${T.USERS}_updated_at
        BEFORE UPDATE ON ${T.USERS}
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
      `);
            console.log("Created Trigger:", T.USERS);
        } else {
            console.log("Table already exists:", T.USERS);
        }
    } catch (error) {
        console.log("users.schema seed error:", error);
    }
};
