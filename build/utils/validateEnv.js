"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/utils/validateEnv.ts
const envalid_1 = require("envalid");
const validateEnv = () => {
    (0, envalid_1.cleanEnv)(process.env, {
        NODE_ENV: (0, envalid_1.str)({ default: "development" }),
        PORT: (0, envalid_1.port)({ default: 8000 }),
        JWT_ACCESS_SECRET: (0, envalid_1.str)({ default: "default-access-secret-change-in-prod" }),
        JWT_REFRESH_SECRET: (0, envalid_1.str)({ default: "default-refresh-secret-change-in-prod" }),
        // Keep these optional in env (you already have them, but defaults are safe)
        JWT_ACCESS_EXPIRES_IN: (0, envalid_1.str)({ default: "15m" }),
        JWT_REFRESH_EXPIRES_IN: (0, envalid_1.str)({ default: "30d" }),
    });
};
exports.default = validateEnv;
//# sourceMappingURL=validateEnv.js.map