"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validation_middleware_1 = __importDefault(require("../middlewares/validation.middleware"));
const user_controllers_1 = __importDefault(require("../controllers/user.controllers"));
const user_dto_1 = require("../dtos/user.dto");
class UsersRoute {
    constructor() {
        this.path = "/users";
        this.router = (0, express_1.Router)();
        this.UsersController = new user_controllers_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post(`/login`, (0, validation_middleware_1.default)(user_dto_1.LoginDto, "body"), this.UsersController.login);
    }
}
exports.default = UsersRoute;
//# sourceMappingURL=user.routes.js.map