import { NextFunction, Request, Response } from "express";
import UsersService from "../services/user.services";
import HttpException from "../exceptions/HttpException";
import { LoginDto } from "../dtos/user.dto";

class UsersController {
    public UsersService = new UsersService();

    public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { email, password, client } = req.body as LoginDto;

            if (!email || !password) {
                throw new HttpException(400, "Email and password are required");
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
        } catch (error) {
            next(error);
        }
    };
}

export default UsersController;
