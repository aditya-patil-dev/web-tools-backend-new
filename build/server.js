"use strict";
/**
 * Entry point of the application
 * Responsible only for:
 * - loading environment variables
 * - validating environment
 * - bootstrapping the App
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const validateEnv_1 = __importDefault(require("./utils/validateEnv"));
// Routes
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const tools_routes_1 = __importDefault(require("./routes/tools.routes"));
const admin_tools_routes_1 = __importDefault(require("./routes/admin-tools.routes"));
const admin_tool_pages_routes_1 = __importDefault(require("./routes/admin-tool-pages.routes"));
const seo_routes_1 = __importDefault(require("./routes/seo.routes"));
const seo_robots_routes_1 = __importDefault(require("./routes/seo-robots.routes"));
const page_components_routes_1 = __importDefault(require("./routes/page-components.routes"));
const legal_pages_routes_1 = __importDefault(require("./routes/legal-pages.routes"));
const contact_routes_1 = __importDefault(require("./routes/contact.routes"));
const settings_routes_1 = __importDefault(require("./routes/settings.routes"));
const import_export_routes_1 = __importDefault(require("./routes/import-export.routes"));
const keyword_routes_1 = __importDefault(require("./routes/keyword.routes"));
/**
 * Validate environment variables before booting the app
 * Fail fast if something critical is missing
 */
(0, validateEnv_1.default)();
/**
 * Register application routes here
 * Keep this file clean – no business logic
 */
const routes = [
    new user_routes_1.default(),
    new upload_routes_1.default(),
    new tools_routes_1.default(),
    new admin_tools_routes_1.default(),
    new admin_tool_pages_routes_1.default(),
    new seo_routes_1.default(),
    new seo_robots_routes_1.default(),
    new page_components_routes_1.default(),
    new legal_pages_routes_1.default(),
    new contact_routes_1.default(),
    new settings_routes_1.default(),
    new import_export_routes_1.default(),
    new keyword_routes_1.default(),
];
/**
 * Bootstrap application
 */
const app = new app_1.default(routes);
/**
 * Start server
 */
app.listen();
/**
 * Optional: export app for testing (supertest, integration tests)
 */
exports.default = app;
//# sourceMappingURL=server.js.map