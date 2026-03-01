/**
 * Entry point of the application
 * Responsible only for:
 * - loading environment variables
 * - validating environment
 * - bootstrapping the App
 */

import "dotenv/config";

import App from "./app";
import validateEnv from "./utils/validateEnv";

// Routes
import UsersRoute from "./routes/user.routes";
import UploadRoute from "./routes/upload.routes";
import ToolsRoute from "./routes/tools.routes";
import AdminToolsRoute from "./routes/admin-tools.routes";
import AdminToolPagesRoute from "./routes/admin-tool-pages.routes";
import SeoRoute from "./routes/seo.routes";
import SeoRobotsRoute from "./routes/seo-robots.routes";
import PageComponentsRoute from "./routes/page-components.routes";
import LegalPagesRoute from "./routes/legal-pages.routes";

/**
 * Validate environment variables before booting the app
 * Fail fast if something critical is missing
 */
validateEnv();

/**
 * Register application routes here
 * Keep this file clean – no business logic
 */
const routes = [
    new UsersRoute(),
    new UploadRoute(),
    new ToolsRoute(),
    new AdminToolsRoute(),
    new AdminToolPagesRoute(),
    new SeoRoute(),
    new SeoRobotsRoute(),
    new PageComponentsRoute(),
    new LegalPagesRoute(),
];

/**
 * Bootstrap application
 */
const app = new App(routes);

/**
 * Start server
 */
app.listen();

/**
 * Optional: export app for testing (supertest, integration tests)
 */
export default app;
