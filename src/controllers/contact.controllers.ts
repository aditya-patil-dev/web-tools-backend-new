import { Request, Response, NextFunction } from "express";
import ContactService from "../services/contact.service";
import HttpException from "../exceptions/HttpException";

class ContactController {
  public ContactService = new ContactService();

  /* ===============================
       PUBLIC
    =============================== */

  public submitContact = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { first_name, last_name, email, topic, message } = req.body;

      if (!first_name || !last_name || !email || !topic || !message) {
        throw new HttpException(400, "Required fields missing");
      }

      const created = await this.ContactService.createMessage(req.body, {
        ip: req.ip,
        user_agent: req.headers["user-agent"],
      });

      res.status(201).json({
        success: true,
        message: "Message submitted successfully",
        data: created,
      });
    } catch (error) {
      next(error);
    }
  };

  /* ===============================
       ADMIN
    =============================== */

  public getAllMessages = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const filters = req.query as any;

      const data = await this.ContactService.getAllMessages(filters);

      res.json({
        success: true,
        message: "Messages fetched successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  public getMessageById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const msg = await this.ContactService.getMessageById(
        Number(req.params.id),
      );

      if (!msg) throw new HttpException(404, "Message not found");

      res.json({
        success: true,
        data: msg,
      });
    } catch (error) {
      next(error);
    }
  };

  public updateStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const updated = await this.ContactService.updateStatus(
        Number(req.params.id),
        req.body.status,
      );

      res.json({
        success: true,
        message: "Status updated",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteMessage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await this.ContactService.deleteMessage(Number(req.params.id));

      res.json({
        success: true,
        message: "Message deleted",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ContactController;
