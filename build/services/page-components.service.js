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
class PageComponentsService {
    /* =====================================================
       PUBLIC METHODS (Frontend Use)
    ===================================================== */
    /**
     * Get all components for a specific page (Frontend)
     */
    async getPageComponents(page_key) {
        const components = await (0, index_schema_1.default)(index_schema_1.T.PAGE_COMPONENTS)
            .select("id", "page_key", "component_type", "component_order", "component_name", "component_data", "is_active", "status", "version", "updated_at")
            .where("page_key", page_key)
            .where("is_active", true)
            .where("status", "active")
            .orderBy("component_order", "asc");
        return components;
    }
    /**
     * Get single component by page_key and component_type (Frontend)
     */
    async getComponentByType(page_key, component_type) {
        const component = await (0, index_schema_1.default)(index_schema_1.T.PAGE_COMPONENTS)
            .select("id", "page_key", "component_type", "component_order", "component_name", "component_data", "is_active", "status", "version", "updated_at")
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
    async getAllComponents(filters) {
        if (!filters) {
            return (0, index_schema_1.default)(index_schema_1.T.PAGE_COMPONENTS).orderBy("page_key", "asc").orderBy("component_order", "asc");
        }
        const { page = 1, limit = 20, search, page_key, component_type, status, is_active, sort_by = "component_order", sort_order = "asc", } = filters;
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
        let countQuery = (0, index_schema_1.default)(index_schema_1.T.PAGE_COMPONENTS);
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
        const total = parseInt(count);
        // Data query
        let baseQuery = (0, index_schema_1.default)(index_schema_1.T.PAGE_COMPONENTS).select("*");
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
    async getComponentById(id) {
        const component = await (0, index_schema_1.default)(index_schema_1.T.PAGE_COMPONENTS)
            .where("id", id)
            .first();
        return component || null;
    }
    /**
     * Create new component (Admin)
     */
    async createComponent(data, created_by) {
        var _a, _b;
        // Check if component already exists
        const exists = await (0, index_schema_1.default)(index_schema_1.T.PAGE_COMPONENTS)
            .where("page_key", data.page_key)
            .where("component_type", data.component_type)
            .first();
        if (exists) {
            throw new HttpException_1.default(400, `Component '${data.component_type}' already exists for page '${data.page_key}'`);
        }
        const [created] = await (0, index_schema_1.default)(index_schema_1.T.PAGE_COMPONENTS)
            .insert({
            page_key: data.page_key,
            component_type: data.component_type,
            component_order: data.component_order,
            component_name: data.component_name || null,
            component_data: JSON.stringify(data.component_data),
            is_active: (_a = data.is_active) !== null && _a !== void 0 ? _a : true,
            status: (_b = data.status) !== null && _b !== void 0 ? _b : "active",
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
    async updateComponent(id, data, updated_by) {
        const existing = await (0, index_schema_1.default)(index_schema_1.T.PAGE_COMPONENTS)
            .where("id", id)
            .first();
        if (!existing) {
            throw new HttpException_1.default(404, "Component not found");
        }
        const updateData = {};
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
        updateData.updated_at = index_schema_1.default.fn.now();
        await (0, index_schema_1.default)(index_schema_1.T.PAGE_COMPONENTS).where("id", id).update(updateData);
        return this.getComponentById(id);
    }
    /**
     * Delete component (Admin)
     */
    async deleteComponent(id) {
        const deleted = await (0, index_schema_1.default)(index_schema_1.T.PAGE_COMPONENTS)
            .where("id", id)
            .delete();
        if (deleted === 0) {
            throw new HttpException_1.default(404, "Component not found");
        }
        return true;
    }
    /**
     * Reorder components (Admin)
     */
    async reorderComponents(page_key, orders) {
        const trx = await index_schema_1.default.transaction();
        try {
            for (const item of orders) {
                await trx(index_schema_1.T.PAGE_COMPONENTS)
                    .where("id", item.id)
                    .where("page_key", page_key)
                    .update({
                    component_order: item.component_order,
                    updated_at: index_schema_1.default.fn.now(),
                });
            }
            await trx.commit();
            return true;
        }
        catch (error) {
            await trx.rollback();
            throw new HttpException_1.default(500, "Failed to reorder components");
        }
    }
    /**
     * Duplicate component (Admin)
     */
    async duplicateComponent(id, created_by) {
        const existing = await this.getComponentById(id);
        if (!existing) {
            throw new HttpException_1.default(404, "Component not found");
        }
        // Get max order for the page
        const maxOrder = await (0, index_schema_1.default)(index_schema_1.T.PAGE_COMPONENTS)
            .where("page_key", existing.page_key)
            .max("component_order as max")
            .first();
        const newOrder = ((maxOrder === null || maxOrder === void 0 ? void 0 : maxOrder.max) || 0) + 1;
        const [duplicated] = await (0, index_schema_1.default)(index_schema_1.T.PAGE_COMPONENTS)
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
exports.default = PageComponentsService;
//# sourceMappingURL=page-components.service.js.map