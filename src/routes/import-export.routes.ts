import { Router } from "express";
import Route from "../interfaces/route.interface";
import ImportExportController from "../controllers/import-export.controller";

class ImportExportRoute implements Route {
  public path = "/admin/import-export";
  public router = Router();
  public controller = new ImportExportController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`/export`, this.controller.export);
    this.router.post(`/import`, this.controller.import);
  }
}

export default ImportExportRoute;
