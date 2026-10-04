import DB from "./index.schema";

export const seed = async (dropFirst = false) => {
  try {
    if (dropFirst) {
      console.log("Dropping Table:", "tool_feedback");
      await DB.schema.dropTableIfExists("tool_feedback");
    }

    const exists = await DB.schema.hasTable("tool_feedback");

    if (!exists) {
      await DB.schema.createTable("tool_feedback", (table) => {
        table.bigIncrements("id").primary();
        table.string("tool_slug", 150).notNullable();
        table.bigInteger("tool_id").nullable().references("id").inTable("tools").onDelete("SET NULL");
        table.string("rating", 20).notNullable(); // 'like' | 'dislike'
        table.text("reason").nullable(); // user explanation / why they disliked or feedback message
        table.string("session_id", 120).nullable();
        table.bigInteger("user_id").nullable();
        table.string("user_agent", 255).nullable();
        table.string("ip_address", 60).nullable();
        table.timestamp("created_at").defaultTo(DB.fn.now());

        // Indexes for fast querying & analytics
        table.index(["tool_slug"]);
        table.index(["rating"]);
        table.index(["created_at"]);
      });
      console.log("Created Table: tool_feedback");
    }
  } catch (err) {
    console.error("tool_feedback.schema error", err);
  }
};
