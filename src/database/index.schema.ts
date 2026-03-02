import knex from "knex";
import dotenv from "dotenv";

dotenv.config();

/**
 * NOTE:
 * - Keeping your style (single DB instance + schema files with seed()).
 * - Ensure your .env contains: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME (or DB_DATABASE)
 */

const awsConf = {
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || process.env.DB_DATABASE,
    port: Number(process.env.DB_PORT || 5432),
  },
  searchPath: ["public"],
};

const DB = knex(awsConf);
export default DB;

/**
 * Table Names (single source of truth)
 */
export const T = {
  USERS: "users",
  USER_TOKENS: "user_tokens",
  WORKSPACES: "workspaces",
  WORKSPACE_MEMBERS: "workspace_members",
  BILLING_ACCOUNTS: "billing_accounts",
  PLANS: "plans",
  SUBSCRIPTIONS: "subscriptions",
  CREDIT_LEDGER: "credit_ledger",
  USAGE_EVENTS: "usage_events",
  FILES: "files",
  TOOLS: "tools",
  TOOL_PAGES: "tool_pages",
  TOOLs_CATEGORY_PAGES: "tools_category_pages",
  SEO_STATIC_PAGES: "seo_static_pages",
  SEO_ROBOTS_RULES: "seo_robots_rules",
  PAGE_COMPONENTS: "page_components",
  TOOL_EVENTS: "tool_events",
  LEGAL_PAGES: "legal_pages",
  CONTACT_MESSAGES: "contact_messages",
} as const;

/**
 * Creates the procedure that is then added as a trigger to every table.
 * Only needs to be run once on each postgres schema.
 */
export const createProcedure = async () => {
  await DB.raw(`
    CREATE OR REPLACE FUNCTION update_timestamp() RETURNS TRIGGER
    LANGUAGE plpgsql
    AS
    $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$;
  `);
};
