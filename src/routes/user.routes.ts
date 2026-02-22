import { Router } from "express";
import Route from "../interfaces/route.interface";
import validationMiddleware from "../middlewares/validation.middleware";
import UsersController from "../controllers/user.controllers";
import { LoginDto } from "../dtos/user.dto";

class UsersRoute implements Route {
    public path = "/users";
    public router = Router();
    public UsersController = new UsersController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            `/login`,
            validationMiddleware(LoginDto, "body"),
            this.UsersController.login
        );

    }
}

export default UsersRoute;