import DB, { T } from "./index.schema";

const checkDB = async () => {
  try {
    const toolsCount = await DB(T.TOOLS).count("id as count").first();
    const toolPagesCount = await DB(T.TOOL_PAGES).count("id as count").first();
    const categoriesCount = await DB("tools_category_pages").count("id as count").first();

    console.log("=== DB Count Info ===");
    console.log("Tools count:", toolsCount?.count);
    console.log("Tool Pages count:", toolPagesCount?.count);
    console.log("Categories count:", categoriesCount?.count);

    if (Number(toolsCount?.count) > 0) {
      console.log("\n=== Existing Tools ===");
      const tools = await DB(T.TOOLS).select("id", "title", "slug", "category_slug", "tool_type", "status");
      console.log(JSON.stringify(tools, null, 2));
    }
  } catch (error) {
    console.error("Error querying DB:", error);
  } finally {
    await DB.destroy();
  }
};

checkDB();
