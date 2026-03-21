"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_services_1 = __importDefault(require("../services/user.services"));
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
class UsersController {
    constructor() {
        this.UsersService = new user_services_1.default();
        this.login = async (req, res, next) => {
            try {
                const { email, password, client } = req.body;
                if (!email || !password) {
                    throw new HttpException_1.default(400, "Email and password are required");
                }
                const result = await this.UsersService.login({
                    email,
                    password,
                    client,
                    ip: req.ip,
                    userAgent: req.headers["user-agent"] || null,
                });
                res.status(200).json({
                    success: true,
                    message: "Login successful",
                    data: {
                        user: result.user,
                        workspace: result.workspace,
                    },
                    token: result.token,
                    expires_in: result.expiresInSeconds,
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = UsersController;
//# sourceMappingURL=user.controllers.js.map