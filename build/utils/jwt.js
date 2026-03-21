"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d";
if (!JWT_ACCESS_SECRET)
    throw new Error("JWT_ACCESS_SECRET is missing in .env");
if (!JWT_REFRESH_SECRET)
    throw new Error("JWT_REFRESH_SECRET is missing in .env");
/**
 * Generate Access Token (short-lived)
 */
const generateAccessToken = (payload, expiresIn = JWT_ACCESS_EXPIRES_IN) => {
    const options = { expiresIn };
    return jsonwebtoken_1.default.sign(payload, JWT_ACCESS_SECRET, options);
};
exports.generateAccessToken = generateAccessToken;
/**
 * Generate Refresh Token (long-lived)
 */
const generateRefreshToken = (payload, expiresIn = JWT_REFRESH_EXPIRES_IN) => {
    const options = { expiresIn };
    return jsonwebtoken_1.default.sign(payload, JWT_REFRESH_SECRET, options);
};
exports.generateRefreshToken = generateRefreshToken;
/**
 * Verify Access Token
 */
const verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, JWT_ACCESS_SECRET);
};
exports.verifyAccessToken = verifyAccessToken;
/**
 * Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
};
exports.verifyRefreshToken = verifyRefreshToken;
//# sourceMappingURL=jwt.js.map