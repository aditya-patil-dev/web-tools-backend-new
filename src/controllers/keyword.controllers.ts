import { Request, Response, NextFunction } from "express";
import KeywordService from "../services/keyword.services";
import HttpException from "../exceptions/HttpException";

class KeywordController {
  public KeywordService = new KeywordService();

  /**
   * POST /keyword/research
   */
  public doKeywordResearch = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const {
        query,
        language = "en",
        region = "us",
        depth = 1,
        include_questions = true,
        export_csv = false,
        filters = {},
      } = req.body;

      // ── Validations ──────────────────────────────────────────
      if (!query || typeof query !== "string" || !query.trim()) {
        throw new HttpException(400, "query is required");
      }

      if (![1, 2].includes(depth)) {
        throw new HttpException(400, "depth must be 1 or 2");
      }

      if (typeof language !== "string" || language.length > 10) {
        throw new HttpException(400, "Invalid language code");
      }

      if (typeof region !== "string" || region.length > 10) {
        throw new HttpException(400, "Invalid region code");
      }

      // ── Call Service ─────────────────────────────────────────
      const data = await this.KeywordService.doKeywordResearch({
        query: query.trim(),
        language,
        region,
        depth,
        include_questions,
        export_csv,
        filters,
      });

      res.status(200).json({
        success: true,
        message: "Keyword research completed successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default KeywordController;
