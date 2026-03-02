import { Router } from "express";
import Route from "../interfaces/route.interface";
import ContactController from "../controllers/contact.controllers";

class ContactRoute implements Route {
    public path = "/contact";

    public router = Router();

    public ContactController = new ContactController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        /* PUBLIC */
        this.router.post(`/`, this.ContactController.submitContact);

        /* ADMIN */
        this.router.get(`/admin`, this.ContactController.getAllMessages);

        this.router.get(`/admin/:id`, this.ContactController.getMessageById);

        this.router.put(`/admin/:id/status`, this.ContactController.updateStatus);

        this.router.delete(`/admin/:id`, this.ContactController.deleteMessage);
    }
}

export default ContactRoute;
