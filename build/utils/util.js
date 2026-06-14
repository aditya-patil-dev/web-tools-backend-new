"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToAws = exports.s3 = exports.cleanObj = exports.isEmpty = void 0;
// import { AWS_BUCKET_NAME, AWS_ID, AWS_SECRET } from '../database/index.schema';
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// console.log("✅ AWS_ACCESS_KEY:", process.env.AWS_ACCESS_KEY);
// console.log("✅ AWS_SECRET_KEY:", process.env.AWS_SECRET_KEY);
// console.log("✅ AWS_REGION:", process.env.AWS_REGION);
// console.log("✅ AWS_BUCKET_NAME:", process.env.AWS_BUCKET_NAME);
const isEmpty = (value) => {
    if (value === null) {
        return true;
    }
    else if (typeof value !== 'number' && value === '') {
        return true;
    }
    else if (value === 'undefined' || value === undefined) {
        return true;
    }
    else if (value !== null && typeof value === 'object' && !Object.keys(value).length) {
        return true;
    }
    else {
        return false;
    }
};
exports.isEmpty = isEmpty;
const cleanObj = (input, allowedKeys = []) => {
    return Object.keys(input)
        .filter(key => allowedKeys.includes(key))
        .reduce((obj, key) => {
        obj[key] = input[key];
        return obj;
    }, {});
};
exports.cleanObj = cleanObj;
exports.s3 = new aws_sdk_1.default.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
});
const uploadToAws = async (name, base64String) => {
    const s3 = new aws_sdk_1.default.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
    });
    const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
    const extension = base64String.split(';')[0].split('/')[1];
    console.timeLog(extension);
    const buffer = Buffer.from(base64String.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const params1 = {
        Bucket: AWS_BUCKET_NAME,
        Key: name + '.' + extension,
        Body: buffer,
        ContentEncoding: 'base64',
        ContentType: 'image/png',
        ACL: 'public-read',
    };
    const response = await new Promise((resolve, reject) => {
        s3.upload(params1, (err, data) => (err == null ? resolve(data) : reject(err)));
    });
    return response;
};
exports.uploadToAws = uploadToAws;
//# sourceMappingURL=util.js.map