"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contact_controllers_1 = __importDefault(require("../controllers/contact.controllers"));
class ContactRoute {
    constructor() {
        this.path = "/contact";
        this.router = (0, express_1.Router)();
        this.ContactController = new contact_controllers_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        /* PUBLIC */
        this.router.post(`/`, this.ContactController.submitContact);
        /* ADMIN */
        this.router.get(`/admin`, this.ContactController.getAllMessages);
        this.router.get(`/admin/:id`, this.ContactController.getMessageById);
        this.router.put(`/admin/:id/status`, this.ContactController.updateStatus);
        this.router.delete(`/admin/:id`, this.ContactController.deleteMessage);
    }
}
exports.default = ContactRoute;
//# sourceMappingURL=contact.routes.js.map