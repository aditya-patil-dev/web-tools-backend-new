"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stream = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const { combine, timestamp, printf } = winston_1.default.format;
const logFormat = printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`);
const transports = [
    new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.splat(), winston_1.default.format.colorize(), winston_1.default.format.simple()),
    }),
];
// Add file transports only in local non-production environment
if (process.env.NODE_ENV !== 'production') {
    try {
        const fs = require('fs');
        const winstonDaily = require('winston-daily-rotate-file');
        const logDir = __dirname + '/../logs';
        if (!fs.existsSync(logDir + '/info')) {
            fs.mkdirSync(logDir + '/info', { recursive: true });
        }
        if (!fs.existsSync(logDir + '/error')) {
            fs.mkdirSync(logDir + '/error', { recursive: true });
        }
        transports.push(new winstonDaily({
            level: 'info',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir + '/info',
            filename: `%DATE%.log`,
            maxFiles: 30,
            json: false,
            zippedArchive: true,
        }), new winstonDaily({
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir + '/error',
            filename: `%DATE%.error.log`,
            maxFiles: 30,
            json: false,
            zippedArchive: true,
        }));
    }
    catch (e) {
        // Ignore file transport initialization errors
    }
}
const logger = winston_1.default.createLogger({
    format: combine(timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
    }), logFormat),
    transports,
});
exports.logger = logger;
const stream = {
    write: (message) => {
        logger.info(message.substring(0, message.lastIndexOf('\n')));
    },
};
exports.stream = stream;
//# sourceMappingURL=logger.js.map