import DB, { T } from "../database/index.schema";
import HttpException from "../exceptions/HttpException";

interface ComponentFilters {
    page?: number;
    limit?: number;
    search?: string;
    page_key?: string;
    component_type?: string;
    status?: string;
    is_active?: boolean;
    sort_by?: string;
    sort_order?: string;
}

class PageComponentsService {
    /* =====================================================
       PUBLIC METHODS (Frontend Use)
    ===================================================== */

    /**
     * Get all components for a specific page (Frontend)
     */
    public async getPageComponents(page_key: string) {
        const components = await DB(T.PAGE_COMPONENTS)
            .select(
                "id",
                "page_key",
                "component_type",
                "component_order",
                "component_name",
                "component_data",
                "is_active",
                "status",
                "version",
                "updated_at"
            )
            .where("page_key", page_key)
            .where("is_active", true)
            .where("status", "active")
            .orderBy("component_order", "asc");

        return components;
    }

    /**
     * Get single component by page_key and component_type (Frontend)
     */
    public async getComponentByType(page_key: string, component_type: string) {
        const component = await DB(T.PAGE_COMPONENTS)
            .select(
                "id",
                "page_key",
                "component_type",
                "component_order",
                "component_name",
                "component_data",
                "is_active",
                "status",
                "version",
                "updated_at"
            )
            .where("page_key", page_key)
            .where("component_type", component_type)
            .where("is_active", true)
            .where("status", "active")
            .first();

        return component || null;
    }

    /* =====================================================
       ADMIN METHODS
    ===================================================== */

    /**
     * Get all components with pagination and filters (Admin)
     */
    public async getAllComponents(filters?: ComponentFilters) {
        if (!filters) {
            return DB(T.PAGE_COMPONENTS).orderBy("page_key", "asc").orderBy("component_order", "asc");
        }

        const {
            page = 1,
            limit = 20,
            search,
            page_key,
            component_type,
            status,
            is_active,
            sort_by = "component_order",
            sort_order = "asc",
        } = filters;

        const offset = (page - 1) * limit;

        const allowedSortColumns = [
            "created_at",
            "updated_at",
            "page_key",
            "component_type",
            "component_order",
        ];

        const safeSortBy = allowedSortColumns.includes(sort_by)
            ? sort_by
            : "component_order";

        const safeSortOrder = sort_order === "asc" ? "asc" : "desc";

        // Count query
        let countQuery = DB(T.PAGE_COMPONENTS);

        if (search) {
            countQuery = countQuery.where((builder) => {
                builder
                    .where("page_key", "ilike", `%${search}%`)
                    .orWhere("component_type", "ilike", `%${search}%`)
                    .orWhere("component_name", "ilike", `%${search}%`);
            });
        }

        if (page_key) {
            countQuery = countQuery.where("page_key", page_key);
        }

        if (component_type) {
            countQuery = countQuery.where("component_type", component_type);
        }

        if (status) {
            countQuery = countQuery.where("status", status);
        }

        if (is_active !== undefined) {
            countQuery = countQuery.where("is_active", is_active);
        }

        const [{ count }] = await countQuery.count("* as count");
        const total = parseInt(count as string);

        // Data query
        let baseQuery = DB(T.PAGE_COMPONENTS).select("*");

        if (search) {
            baseQuery = baseQuery.where((builder) => {
                builder
                    .where("page_key", "ilike", `%${search}%`)
                    .orWhere("component_type", "ilike", `%${search}%`)
                    .orWhere("component_name", "ilike", `%${search}%`);
            });
        }

        if (page_key) {
            baseQuery = baseQuery.where("page_key", page_key);
        }

        if (component_type) {
            baseQuery = baseQuery.where("component_type", component_type);
        }

        if (status) {
            baseQuery = baseQuery.where("status", status);
        }

        if (is_active !== undefined) {
            baseQuery = baseQuery.where("is_active", is_active);
        }

        const components = await baseQuery
            .clone()
            .orderBy(safeSortBy, safeSortOrder)
            .limit(limit)
            .offset(offset);

        return { components, total, page, limit };
    }

    /**
     * Get single component by ID (Admin)
     */
    public async getComponentById(id: number) {
        const component = await DB(T.PAGE_COMPONENTS)
            .where("id", id)
            .first();

        return component || null;
    }

    /**
     * Create new component (Admin)
     */
    public async createComponent(data: any, created_by?: number) {
        // Check if component already exists
        const exists = await DB(T.PAGE_COMPONENTS)
            .where("page_key", data.page_key)
            .where("component_type", data.component_type)
            .first();

        if (exists) {
            throw new HttpException(
                400,
                `Component '${data.component_type}' already exists for page '${data.page_key}'`
            );
        }

        const [created] = await DB(T.PAGE_COMPONENTS)
            .insert({
                page_key: data.page_key,
                component_type: data.component_type,
                component_order: data.component_order,
                component_name: data.component_name || null,
                component_data: JSON.stringify(data.component_data),
                is_active: data.is_active ?? true,
                status: data.status ?? "active",
                version: 1,
                created_by: created_by || null,
                updated_by: created_by || null,
            })
            .returning("*");

        return created;
    }

    /**
     * Update component (Admin)
     */
    public async updateComponent(id: number, data: any, updated_by?: number) {
        const existing = await DB(T.PAGE_COMPONENTS)
            .where("id", id)
            .first();

        if (!existing) {
            throw new HttpException(404, "Component not found");
        }

        const updateData: any = {};

        if (data.component_order !== undefined)
            updateData.component_order = data.component_order;

        if (data.component_name !== undefined)
            updateData.component_name = data.component_name;

        if (data.component_data !== undefined)
            updateData.component_data = JSON.stringify(data.component_data);

        if (data.is_active !== undefined)
            updateData.is_active = data.is_active;

        if (data.status !== undefined)
            updateData.status = data.status;

        // Increment version
        updateData.version = existing.version + 1;

        // Save version history (optional)
        const versionHistory = existing.version_history || [];
        versionHistory.push({
            version: existing.version,
            component_data: existing.component_data,
            updated_at: existing.updated_at,
            updated_by: existing.updated_by,
        });
        updateData.version_history = JSON.stringify(versionHistory);

        updateData.updated_by = updated_by || null;
        updateData.updated_at = DB.fn.now();

        await DB(T.PAGE_COMPONENTS).where("id", id).update(updateData);

        return this.getComponentById(id);
    }

    /**
     * Delete component (Admin)
     */
    public async deleteComponent(id: number) {
        const deleted = await DB(T.PAGE_COMPONENTS)
            .where("id", id)
            .delete();

        if (deleted === 0) {
            throw new HttpException(404, "Component not found");
        }

        return true;
    }

    /**
     * Reorder components (Admin)
     */
    public async reorderComponents(
        page_key: string,
        orders: { id: number; component_order: number }[]
    ) {
        const trx = await DB.transaction();

        try {
            for (const item of orders) {
                await trx(T.PAGE_COMPONENTS)
                    .where("id", item.id)
                    .where("page_key", page_key)
                    .update({
                        component_order: item.component_order,
                        updated_at: DB.fn.now(),
                    });
            }

            await trx.commit();
            return true;
        } catch (error) {
            await trx.rollback();
            throw new HttpException(500, "Failed to reorder components");
        }
    }

    /**
     * Duplicate component (Admin)
     */
    public async duplicateComponent(id: number, created_by?: number) {
        const existing = await this.getComponentById(id);

        if (!existing) {
            throw new HttpException(404, "Component not found");
        }

        // Get max order for the page
        const maxOrder = await DB(T.PAGE_COMPONENTS)
            .where("page_key", existing.page_key)
            .max("component_order as max")
            .first();

        const newOrder = (maxOrder?.max || 0) + 1;

        const [duplicated] = await DB(T.PAGE_COMPONENTS)
            .insert({
                page_key: existing.page_key,
                component_type: `${existing.component_type}-copy`,
                component_order: newOrder,
                component_name: `${existing.component_name} (Copy)`,
                component_data: existing.component_data,
                is_active: false, // Duplicate as inactive
                status: "draft",
                version: 1,
                created_by: created_by || null,
                updated_by: created_by || null,
            })
            .returning("*");

        return duplicated;
    }
}

export default PageComponentsService;