"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const index_schema_1 = __importStar(require("./index.schema"));
const checkDB = async () => {
    try {
        const toolsCount = await (0, index_schema_1.default)(index_schema_1.T.TOOLS).count("id as count").first();
        const toolPagesCount = await (0, index_schema_1.default)(index_schema_1.T.TOOL_PAGES).count("id as count").first();
        const categoriesCount = await (0, index_schema_1.default)("tools_category_pages").count("id as count").first();
        console.log("=== DB Count Info ===");
        console.log("Tools count:", toolsCount === null || toolsCount === void 0 ? void 0 : toolsCount.count);
        console.log("Tool Pages count:", toolPagesCount === null || toolPagesCount === void 0 ? void 0 : toolPagesCount.count);
        console.log("Categories count:", categoriesCount === null || categoriesCount === void 0 ? void 0 : categoriesCount.count);
        if (Number(toolsCount === null || toolsCount === void 0 ? void 0 : toolsCount.count) > 0) {
            console.log("\n=== Existing Tools ===");
            const tools = await (0, index_schema_1.default)(index_schema_1.T.TOOLS).select("id", "title", "slug", "category_slug", "tool_type", "status");
            console.log(JSON.stringify(tools, null, 2));
        }
    }
    catch (error) {
        console.error("Error querying DB:", error);
    }
    finally {
        await index_schema_1.default.destroy();
    }
};
checkDB();
//# sourceMappingURL=scratch_check_db.js.map