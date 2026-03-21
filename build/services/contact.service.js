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
class ContactService {
    /* ===============================
       PUBLIC
    =============================== */
    async createMessage(data, meta) {
        const [created] = await (0, index_schema_1.default)(index_schema_1.T.CONTACT_MESSAGES)
            .insert({
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            topic: data.topic,
            subject: data.subject || null,
            message: data.message,
            ip_address: meta.ip,
            user_agent: meta.user_agent
        })
            .returning("*");
        return created;
    }
    /* ===============================
       ADMIN
    =============================== */
    async getAllMessages(filters) {
        if (!filters) {
            return (0, index_schema_1.default)(index_schema_1.T.CONTACT_MESSAGES)
                .orderBy("created_at", "desc");
        }
        const { page, limit, search, status, sort_by, sort_order } = filters;
        const offset = (page - 1) * limit;
        const allowedSort = ["created_at", "email", "status"];
        const safeSortBy = allowedSort.includes(sort_by)
            ? sort_by
            : "created_at";
        const safeSortOrder = sort_order === "asc" ? "asc" : "desc";
        let countQuery = (0, index_schema_1.default)(index_schema_1.T.CONTACT_MESSAGES);
        if (search) {
            countQuery = countQuery.where(builder => {
                builder
                    .where("email", "ilike", `%${search}%`)
                    .orWhere("first_name", "ilike", `%${search}%`)
                    .orWhere("last_name", "ilike", `%${search}%`);
            });
        }
        if (status) {
            countQuery = countQuery.where("status", status);
        }
        const [{ count }] = await countQuery.count("* as count");
        const total = Number(count);
        let query = (0, index_schema_1.default)(index_schema_1.T.CONTACT_MESSAGES).select("*");
        if (search) {
            query = query.where(builder => {
                builder
                    .where("email", "ilike", `%${search}%`)
                    .orWhere("first_name", "ilike", `%${search}%`)
                    .orWhere("last_name", "ilike", `%${search}%`);
            });
        }
        if (status) {
            query = query.where("status", status);
        }
        const messages = await query
            .orderBy(safeSortBy, safeSortOrder)
            .limit(limit)
            .offset(offset);
        return { messages, total };
    }
    async getMessageById(id) {
        const msg = await (0, index_schema_1.default)(index_schema_1.T.CONTACT_MESSAGES)
            .where("id", id)
            .first();
        return msg || null;
    }
    async updateStatus(id, status) {
        const exists = await this.getMessageById(id);
        if (!exists)
            throw new HttpException_1.default(404, "Message not found");
        await (0, index_schema_1.default)(index_schema_1.T.CONTACT_MESSAGES)
            .where("id", id)
            .update({
            status,
            updated_at: index_schema_1.default.fn.now()
        });
        return this.getMessageById(id);
    }
    async deleteMessage(id) {
        const deleted = await (0, index_schema_1.default)(index_schema_1.T.CONTACT_MESSAGES)
            .where("id", id)
            .delete();
        if (!deleted)
            throw new HttpException_1.default(404, "Message not found");
        return true;
    }
}
exports.default = ContactService;
//# sourceMappingURL=contact.service.js.map