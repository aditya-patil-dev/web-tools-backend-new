"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const contact_service_1 = __importDefault(require("../services/contact.service"));
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
class ContactController {
    constructor() {
        this.ContactService = new contact_service_1.default();
        /* ===============================
             PUBLIC
          =============================== */
        this.submitContact = async (req, res, next) => {
            try {
                const { first_name, last_name, email, topic, message } = req.body;
                if (!first_name || !last_name || !email || !topic || !message) {
                    throw new HttpException_1.default(400, "Required fields missing");
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
            }
            catch (error) {
                next(error);
            }
        };
        /* ===============================
             ADMIN
          =============================== */
        this.getAllMessages = async (req, res, next) => {
            try {
                const filters = req.query;
                const data = await this.ContactService.getAllMessages(filters);
                res.json({
                    success: true,
                    message: "Messages fetched successfully",
                    data,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getMessageById = async (req, res, next) => {
            try {
                const msg = await this.ContactService.getMessageById(Number(req.params.id));
                if (!msg)
                    throw new HttpException_1.default(404, "Message not found");
                res.json({
                    success: true,
                    data: msg,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateStatus = async (req, res, next) => {
            try {
                const updated = await this.ContactService.updateStatus(Number(req.params.id), req.body.status);
                res.json({
                    success: true,
                    message: "Status updated",
                    data: updated,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteMessage = async (req, res, next) => {
            try {
                await this.ContactService.deleteMessage(Number(req.params.id));
                res.json({
                    success: true,
                    message: "Message deleted",
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = ContactController;
//# sourceMappingURL=contact.controllers.js.map