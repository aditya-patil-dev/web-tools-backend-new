import DB, { T } from "./index.schema";

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log("Dropping Table:", T.USER_TOKENS);
            await DB.schema.dropTableIfExists(T.USER_TOKENS);
            console.log("Dropped Table:", T.USER_TOKENS);
        }

        console.log("Creating Table:", T.USER_TOKENS);

        const exists = await DB.schema.hasTable(T.USER_TOKENS);
        if (!exists) {
            await DB.schema.createTable(T.USER_TOKENS, (table) => {
                table.bigIncrements("id").primary();

                table
                    .bigInteger("user_id")
                    .unsigned()
                    .notNullable()
                    .references("id")
                    .inTable(T.USERS)
                    .onDelete("CASCADE")
                    .comment("FK → users.id");

                table
                    .enu("token_type", ["otp", "password_reset", "refresh", "api_key"])
                    .notNullable();

                table.string("token_hash", 255).notNullable().comment("Store hash only, never raw token");
                table.jsonb("metadata_json").nullable().comment("Device/channel/etc");
                table.dateTime("expires_at").notNullable();
                table.dateTime("used_at").nullable();
                table.dateTime("revoked_at").nullable();

                table.timestamp("created_at").defaultTo(DB.fn.now());

                // Indexes
                table.index(["user_id"]);
                table.index(["token_type"]);
                table.index(["expires_at"]);
                table.unique(["token_type", "token_hash"]);
            });

            console.log("Created Table:", T.USER_TOKENS);
        } else {
            console.log("Table already exists:", T.USER_TOKENS);
        }
    } catch (error) {
        console.log("user_tokens.schema seed error:", error);
    }
};
