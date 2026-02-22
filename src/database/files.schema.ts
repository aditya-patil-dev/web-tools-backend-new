import DB, { T } from "./index.schema";

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log("Dropping Table:", "files");
            await DB.schema.dropTableIfExists("files");
        }

        const exists = await DB.schema.hasTable("files");
        if (!exists) {
            await DB.schema.createTable("files", (table) => {
                table.bigIncrements("id").primary();

                // Storage backend
                table.enu("provider", ["local", "s3", "gcs"]).notNullable().defaultTo("local");
                table.string("bucket", 120).nullable();
                table.text("key").notNullable();
                table.text("url").notNullable();

                // File metadata
                table.string("original_name", 255).notNullable();
                table.string("mime_type", 120).notNullable();
                table.bigInteger("size_bytes").notNullable();
                table.string("ext", 20).nullable();

                // Access control (future-proof)
                table.enu("visibility", ["public", "private"]).notNullable().defaultTo("public");

                // Who uploaded (optional FK)
                table
                    .bigInteger("uploaded_by")
                    .unsigned()
                    .nullable()
                    .references("id")
                    .inTable(T.USERS)
                    .onDelete("SET NULL");

                // Optional grouping (helps when you add modules later)
                table.string("folder", 80).nullable();
                table.jsonb("meta_json").nullable();

                table.timestamp("created_at").defaultTo(DB.fn.now());
                table.timestamp("updated_at").defaultTo(DB.fn.now());

                // Indexes
                table.index(["provider"]);
                table.index(["visibility"]);
                table.index(["uploaded_by"]);
                table.index(["folder"]);
            });

            await DB.raw(`
        CREATE TRIGGER trg_files_updated_at
        BEFORE UPDATE ON files
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
      `);
        }
    } catch (err) {
        console.error("files.schema error", err);
    }
};
