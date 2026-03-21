"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_schema_1 = __importStar(require("../database/index.schema"));
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_dto_1 = require("../dtos/user.dto");
class UsersService {
    async login(input) {
        const { email, password, client, ip } = input;
        // 1) find user
        const user = await (0, index_schema_1.default)(index_schema_1.T.USERS)
            .where({ email })
            .andWhere({ is_deleted: false })
            .first();
        if (!user)
            throw new HttpException_1.default(404, "Email not registered");
        // 2) check account status
        if (["banned", "locked", "inactive", "pending"].includes(user.account_status)) {
            const msg = user.account_status === "banned"
                ? "Your account has been banned."
                : user.account_status === "locked"
                    ? "Your account is locked. Please contact support."
                    : user.account_status === "pending"
                        ? "Your account is pending approval."
                        : "Your account is inactive.";
            throw new HttpException_1.default(403, msg);
        }
        // 3) enforce login type (admin panel vs customer)
        // If client is not provided, allow all roles to login.
        if (client === user_dto_1.LoginClient.ADMIN) {
            if (!["admin", "support"].includes(user.role)) {
                throw new HttpException_1.default(403, "Not allowed to login to admin panel");
            }
        }
        if (client === user_dto_1.LoginClient.CUSTOMER) {
            if (user.role !== "customer") {
                throw new HttpException_1.default(403, "Not allowed to login as customer");
            }
        }
        // 4) validate password
        if (!user.password_hash) {
            throw new HttpException_1.default(400, "This account does not have a password set.");
        }
        const ok = await bcrypt_1.default.compare(password, user.password_hash);
        if (!ok) {
            // increment failed attempts
            await (0, index_schema_1.default)(index_schema_1.T.USERS)
                .where({ id: user.id })
                .increment("failed_login_attempts", 1);
            throw new HttpException_1.default(401, "Incorrect password");
        }
        // 5) update last login, reset failed attempts
        await (0, index_schema_1.default)(index_schema_1.T.USERS)
            .where({ id: user.id })
            .update({
            last_login_at: index_schema_1.default.fn.now(),
            last_login_ip: ip || null,
            failed_login_attempts: 0,
        });
        // 6) resolve workspace (personal or first membership)
        const memberRow = await (0, index_schema_1.default)(index_schema_1.T.WORKSPACE_MEMBERS)
            .where({ user_id: user.id })
            .andWhere({ status: "active" })
            .orderBy("id", "asc")
            .first();
        if (!memberRow) {
            throw new HttpException_1.default(403, "No active workspace found for this user.");
        }
        const workspace = await (0, index_schema_1.default)(index_schema_1.T.WORKSPACES)
            .where({ id: memberRow.workspace_id })
            .andWhere({ status: "active" })
            .first();
        if (!workspace) {
            throw new HttpException_1.default(403, "Workspace is not active.");
        }
        // 7) create JWT (access token)
        const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "24h";
        const expiresInSeconds = 24 * 60 * 60;
        const token = jsonwebtoken_1.default.sign({
            sub: user.id,
            email: user.email,
            role: user.role,
            workspace_id: workspace.id,
            member_role: memberRow.member_role,
            client: client || "any",
        }, process.env.JWT_ACCESS_SECRET, { expiresIn });
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
exports.default = UsersService;
//# sourceMappingURL=user.services.js.map