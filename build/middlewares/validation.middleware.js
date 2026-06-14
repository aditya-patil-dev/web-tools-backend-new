"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
const validationMiddleware = (type, value = "body", skipMissingProperties = false, groups = []) => {
    return (req, res, next) => {
        (0, class_validator_1.validate)((0, class_transformer_1.plainToInstance)(type, req[value]), { skipMissingProperties, groups })
            .then((errors) => {
            if (errors.length > 0) {
                const message = errors
                    .map((error) => error.constraints ? Object.values(error.constraints).join(", ") : "")
                    .filter((msg) => msg.length > 0)
                    .join(", ");
                next(new HttpException_1.default(400, message));
            }
            else {
                next();
            }
        })
            .catch(next);
    };
};
exports.default = validationMiddleware;
//# sourceMappingURL=validation.middleware.js.map