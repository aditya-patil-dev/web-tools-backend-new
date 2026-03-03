import DB from "./index.schema";

export const seed = async (dropFirst = false) => {
  try {
    if (dropFirst) {
      console.log("Dropping Table:", "site_settings");
      await DB.schema.dropTableIfExists("site_settings");
    }

    const exists = await DB.schema.hasTable("site_settings");

    if (!exists) {
      await DB.schema.createTable("site_settings", (table) => {
        table.bigIncrements("id").primary();

        /*
                ============================
                SITE IDENTITY
                ============================
                */

        table.string("site_name", 255).notNullable();

        table.string("site_tagline", 255).nullable();

        table.string("site_url", 500).notNullable();

        table.text("site_description").nullable();

        table.string("logo_url", 500).nullable();

        table.string("favicon_url", 500).nullable();

        /*
                ============================
                ANALYTICS & TRACKING
                ============================
                */

        table.string("google_analytics_id", 120).nullable();

        table.string("google_tag_manager_id", 120).nullable();

        table.string("google_search_console", 255).nullable();

        table.string("bing_webmaster", 255).nullable();

        table.string("facebook_pixel_id", 120).nullable();

        table.string("hotjar_site_id", 120).nullable();

        /*
                ============================
                SYSTEM FLAGS
                ============================
                */

        table.boolean("maintenance_mode").defaultTo(false);

        table.boolean("is_active").defaultTo(true);

        /*
                ============================
                META
                ============================
                */

        table.string("created_by", 120).nullable();
        table.string("updated_by", 120).nullable();

        table.timestamp("created_at").defaultTo(DB.fn.now());
        table.timestamp("updated_at").defaultTo(DB.fn.now());

        /*
                ============================
                INDEXES
                ============================
                */

        table.index(["is_active"]);
        table.index(["created_at"]);
      });

      /*
            Insert Default Empty Row
            (Important for single settings pattern)
            */

      await DB("site_settings").insert({
        site_name: "Your Website",
        site_url: "https://example.com",
      });
    }
  } catch (err) {
    console.error("site_settings.schema error", err);
  }
};
