import { Router } from "express";
import Route from "../interfaces/route.interface";
import KeywordController from "../controllers/keyword.controllers";

class KeywordRoute implements Route {
  public path = "/keyword";
  public router = Router();
  public KeywordController = new KeywordController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // POST /keyword/research
    this.router.post("/research", this.KeywordController.doKeywordResearch);
  }
}

export default KeywordRoute;
