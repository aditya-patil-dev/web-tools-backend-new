import DB, { T } from "../database/index.schema";
import HttpException from "../exceptions/HttpException";

interface ContactFilters {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    sort_by: string;
    sort_order: string;
}

class ContactService {

    /* ===============================
       PUBLIC
    =============================== */

    public async createMessage(data: any, meta: any) {

        const [created] = await DB(T.CONTACT_MESSAGES)
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

    public async getAllMessages(filters?: ContactFilters) {

        if (!filters) {
            return DB(T.CONTACT_MESSAGES)
                .orderBy("created_at", "desc");
        }

        const { page, limit, search, status, sort_by, sort_order } = filters;

        const offset = (page - 1) * limit;

        const allowedSort = ["created_at", "email", "status"];

        const safeSortBy = allowedSort.includes(sort_by)
            ? sort_by
            : "created_at";

        const safeSortOrder =
            sort_order === "asc" ? "asc" : "desc";


        let countQuery = DB(T.CONTACT_MESSAGES);

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

        const [{ count }] =
            await countQuery.count("* as count");

        const total = Number(count);


        let query = DB(T.CONTACT_MESSAGES).select("*");

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


    public async getMessageById(id: number) {

        const msg = await DB(T.CONTACT_MESSAGES)
            .where("id", id)
            .first();

        return msg || null;
    }


    public async updateStatus(id: number, status: string) {

        const exists = await this.getMessageById(id);

        if (!exists)
            throw new HttpException(404, "Message not found");

        await DB(T.CONTACT_MESSAGES)
            .where("id", id)
            .update({
                status,
                updated_at: DB.fn.now()
            });

        return this.getMessageById(id);
    }


    public async deleteMessage(id: number) {

        const deleted =
            await DB(T.CONTACT_MESSAGES)
                .where("id", id)
                .delete();

        if (!deleted)
            throw new HttpException(404, "Message not found");

        return true;
    }

}

export default ContactService;