import { Router } from "express";
import Route from "../interfaces/route.interface";
import AdminToolPagesController from "../controllers/admin-tool-pages.controllers";
// import authMiddleware from "../middlewares/auth.middleware";
// import roleMiddleware from "../middlewares/role.middleware";

class AdminToolPagesRoute implements Route {
  public path = "/admin/tool-pages";
  public router = Router();
  public controller = new AdminToolPagesController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    // ============================================
    // TOOL PAGES CRUD
    // ============================================

    // GET /admin/tool-pages - List all tool pages
    this.router.get(`/`, this.controller.getToolPages);

    // POST /admin/tool-pages - Create new tool page
    this.router.post(`/`, this.controller.createToolPage);

    // GET /admin/tool-pages/:slug - Get single tool page by slug
    this.router.get(`/:slug`, this.controller.getToolPageBySlug);

    // PUT /admin/tool-pages/:slug - Update tool page
    this.router.put(`/:slug`, this.controller.updateToolPage);

    // DELETE /admin/tool-pages/:slug - Delete tool page
    this.router.delete(`/:slug`, this.controller.deleteToolPage);
  }
}

export default AdminToolPagesRoute;