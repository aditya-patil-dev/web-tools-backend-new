import DB from "./index.schema";

export const seed = async (dropFirst = false) => {
  try {
    if (dropFirst) {
      console.log("Dropping Table:", "tool_pages");
      await DB.schema.dropTableIfExists("tool_pages");
    }

    const exists = await DB.schema.hasTable("tool_pages");

    if (!exists) {
      await DB.schema.createTable("tool_pages", (table) => {
        table.bigIncrements("id").primary();

        table.string("tool_slug", 160).notNullable();

        table.string("page_title", 200).notNullable();
        table.text("page_intro").nullable();

        table.text("long_content").nullable();

        table.jsonb("features").nullable(); // [{title, description}]
        table.jsonb("faqs").nullable(); // [{question, answer}]

        table.string("meta_title", 255).nullable();
        table.text("meta_description").nullable();
        table.text("meta_keywords").nullable();

        table.string("canonical_url", 255).nullable();
        table.boolean("noindex").defaultTo(false);

        table.jsonb("schema_markup").nullable();

        table
          .enu("status", ["draft", "active", "archived"])
          .defaultTo("draft");

        table.timestamp("created_at").defaultTo(DB.fn.now());
        table.timestamp("updated_at").defaultTo(DB.fn.now());

        table.index(["tool_slug"]);
        table.index(["status"]);
      });

      await DB.raw(`
                CREATE TRIGGER trg_tool_pages_updated_at
                BEFORE UPDATE ON tool_pages
                FOR EACH ROW
                EXECUTE PROCEDURE update_timestamp();
            `);
    }
  } catch (err) {
    console.error("tool_pages.schema error", err);
  }
};
