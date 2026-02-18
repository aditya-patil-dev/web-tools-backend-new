import DB, { T } from "../database/index.schema";
import HttpException from "../exceptions/HttpException";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { LoginClient } from "../dtos/user.dto";

type LoginInput = {
    email: string;
    password: string;
    client?: LoginClient;
    ip?: string | null;
    userAgent?: string | null;
};

class UsersService {
    public async login(input: LoginInput): Promise<{
        user: any;
        workspace: any;
        token: string;
        expiresInSeconds: number;
    }> {
        const { email, password, client, ip } = input;

        // 1) find user
        const user = await DB(T.USERS)
            .where({ email })
            .andWhere({ is_deleted: false })
            .first();

        if (!user) throw new HttpException(404, "Email not registered");

        // 2) check account status
        if (["banned", "locked", "inactive", "pending"].includes(user.account_status)) {
            const msg =
                user.account_status === "banned"
                    ? "Your account has been banned."
                    : user.account_status === "locked"
                        ? "Your account is locked. Please contact support."
                        : user.account_status === "pending"
                            ? "Your account is pending approval."
                            : "Your account is inactive.";
            throw new HttpException(403, msg);
        }

        // 3) enforce login type (admin panel vs customer)
        // If client is not provided, allow all roles to login.
        if (client === LoginClient.ADMIN) {
            if (!["admin", "support"].includes(user.role)) {
                throw new HttpException(403, "Not allowed to login to admin panel");
            }
        }
        if (client === LoginClient.CUSTOMER) {
            if (user.role !== "customer") {
                throw new HttpException(403, "Not allowed to login as customer");
            }
        }

        // 4) validate password
        if (!user.password_hash) {
            throw new HttpException(400, "This account does not have a password set.");
        }

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) {
            // increment failed attempts
            await DB(T.USERS)
                .where({ id: user.id })
                .increment("failed_login_attempts", 1);

            throw new HttpException(401, "Incorrect password");
        }

        // 5) update last login, reset failed attempts
        await DB(T.USERS)
            .where({ id: user.id })
            .update({
                last_login_at: DB.fn.now(),
                last_login_ip: ip || null,
                failed_login_attempts: 0,
            });

        // 6) resolve workspace (personal or first membership)
        const memberRow = await DB(T.WORKSPACE_MEMBERS)
            .where({ user_id: user.id })
            .andWhere({ status: "active" })
            .orderBy("id", "asc")
            .first();

        if (!memberRow) {
            throw new HttpException(403, "No active workspace found for this user.");
        }

        const workspace = await DB(T.WORKSPACES)
            .where({ id: memberRow.workspace_id })
            .andWhere({ status: "active" })
            .first();

        if (!workspace) {
            throw new HttpException(403, "Workspace is not active.");
        }

        // 7) create JWT (access token)
        const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "24h";
        const expiresInSeconds = 24 * 60 * 60;

        const token = jwt.sign(
            {
                sub: user.id,
                email: user.email,
                role: user.role,
                workspace_id: workspace.id,
                member_role: memberRow.member_role,
                client: client || "any",
            },
            process.env.JWT_ACCESS_SECRET as string,
            { expiresIn }
        );

        // 8) return safe user object
        const safeUser = {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            phone_number: user.phone_number,
            role: user.role,
            account_status: user.account_status,
            last_login_at: user.last_login_at,
        };

        const safeWorkspace = {
            id: workspace.id,
            name: workspace.name,
            type: workspace.type,
            status: workspace.status,
            member_role: memberRow.member_role,
        };

        return {
            user: safeUser,
            workspace: safeWorkspace,
            token,
            expiresInSeconds,
        };
    }
}

export default UsersService;
