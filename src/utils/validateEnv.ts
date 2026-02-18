// src/utils/validateEnv.ts
import { cleanEnv, port, str } from "envalid";

const validateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str({ default: "development" }),
    PORT: port({ default: 8000 }),

    JWT_ACCESS_SECRET: str(),
    JWT_REFRESH_SECRET: str(),

    // Keep these optional in env (you already have them, but defaults are safe)
    JWT_ACCESS_EXPIRES_IN: str({ default: "15m" }),
    JWT_REFRESH_EXPIRES_IN: str({ default: "30d" }),
  });
};

export default validateEnv;
