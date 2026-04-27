"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_schema_1 = __importDefault(require("../database/index.schema"));
const import_export_registry_1 = require("../config/import-export.registry");
// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────
class ImportExportService {
    // ══════════════════════════════════════════════════════════════════════════
    // EXPORT
    // ══════════════════════════════════════════════════════════════════════════
    async exportResource(resource) {
        const config = import_export_registry_1.REGISTRY[resource];
        return (0, index_schema_1.default)(config.table).select(config.columns).orderBy("id", "asc");
    }
    // ══════════════════════════════════════════════════════════════════════════
    // IMPORT
    // ══════════════════════════════════════════════════════════════════════════
    async importResource(resource, rows, mode) {
        const config = import_export_registry_1.REGISTRY[resource];
        const result = {
            imported: 0,
            updated: 0,
            failed: 0,
            errors: [],
        };
        for (let i = 0; i < rows.length; i++) {
            const raw = rows[i];
            const rowNum = i + 2; // +2 because row 1 is the CSV header
            try {
                // ── 1. Validate required fields ───────────────────────────
                const validationErrors = this.validate(raw, config, rowNum);
                if (validationErrors.length) {
                    result.failed++;
                    result.errors.push(...validationErrors);
                    continue;
                }
                // ── 2. Coerce types ───────────────────────────────────────
                const payload = this.transform(raw, config);
                // ── 3. Validate enum values ───────────────────────────────
                const enumErrors = this.validateEnums(payload, config, rowNum);
                if (enumErrors.length) {
                    result.failed++;
                    result.errors.push(...enumErrors);
                    continue;
                }
                // ── 3. Persist ────────────────────────────────────────────
                if (mode === "append") {
                    await this.append(config, payload, rowNum, result);
                }
                else {
                    await this.upsert(config, payload, rowNum, result);
                }
            }
            catch (err) {
                result.failed++;
                result.errors.push({
                    row: rowNum,
                    error: err.message || "Unexpected error",
                });
            }
        }
        return result;
    }
    // ══════════════════════════════════════════════════════════════════════════
    // PRIVATE — APPEND
    // ══════════════════════════════════════════════════════════════════════════
    async append(config, payload, rowNum, result) {
        // Block duplicate by uniqueKey if provided in the payload
        if (payload[config.uniqueKey] !== undefined &&
            payload[config.uniqueKey] !== null) {
            const existing = await (0, index_schema_1.default)(config.table)
                .where({ [config.uniqueKey]: payload[config.uniqueKey] })
                .first();
            if (existing) {
                throw new Error(`Duplicate ${config.uniqueKey}: "${payload[config.uniqueKey]}"`);
            }
        }
        // Strip id on append so DB auto-generates it
        const { id } = payload, insertPayload = __rest(payload, ["id"]);
        await (0, index_schema_1.default)(config.table).insert(Object.assign(Object.assign({}, insertPayload), { created_at: index_schema_1.default.fn.now(), updated_at: index_schema_1.default.fn.now() }));
        result.imported++;
    }
    // ══════════════════════════════════════════════════════════════════════════
    // PRIVATE — UPSERT (update mode)
    // ══════════════════════════════════════════════════════════════════════════
    async upsert(config, payload, rowNum, result) {
        const keyValue = payload[config.uniqueKey];
        // If no unique key value supplied, treat as a fresh insert
        if (keyValue === undefined || keyValue === null || keyValue === "") {
            const { id } = payload, insertPayload = __rest(payload, ["id"]);
            await (0, index_schema_1.default)(config.table).insert(Object.assign(Object.assign({}, insertPayload), { created_at: index_schema_1.default.fn.now(), updated_at: index_schema_1.default.fn.now() }));
            result.imported++;
            return;
        }
        const existing = await (0, index_schema_1.default)(config.table)
            .where({ [config.uniqueKey]: keyValue })
            .first();
        if (existing) {
            // UPDATE — never overwrite created_at
            const { id, created_at } = payload, updatePayload = __rest(payload, ["id", "created_at"]);
            await (0, index_schema_1.default)(config.table)
                .where({ [config.uniqueKey]: keyValue })
                .update(Object.assign(Object.assign({}, updatePayload), { updated_at: index_schema_1.default.fn.now() }));
            result.updated++;
        }
        else {
            // INSERT — record doesn't exist yet
            const { id } = payload, insertPayload = __rest(payload, ["id"]);
            await (0, index_schema_1.default)(config.table).insert(Object.assign(Object.assign({}, insertPayload), { created_at: index_schema_1.default.fn.now(), updated_at: index_schema_1.default.fn.now() }));
            result.imported++;
        }
    }
    // ══════════════════════════════════════════════════════════════════════════
    // PRIVATE — VALIDATE REQUIRED
    // ══════════════════════════════════════════════════════════════════════════
    validate(row, config, rowNum) {
        const errors = [];
        for (const field of config.required) {
            const value = row[field];
            if (value === undefined ||
                value === null ||
                String(value).trim() === "") {
                errors.push({
                    row: rowNum,
                    column: field,
                    value,
                    error: `"${field}" is required`,
                });
            }
        }
        return errors;
    }
    // ══════════════════════════════════════════════════════════════════════════
    // PRIVATE — VALIDATE ENUMS
    // ══════════════════════════════════════════════════════════════════════════
    validateEnums(payload, config, rowNum) {
        const errors = [];
        if (!config.enums)
            return errors;
        for (const [column, allowed] of Object.entries(config.enums)) {
            const value = payload[column];
            // Skip null/undefined — DB default will apply
            if (value === null || value === undefined)
                continue;
            if (!allowed.includes(value)) {
                errors.push({
                    row: rowNum,
                    column,
                    value,
                    error: `Invalid value "${value}" for "${column}". Allowed: ${allowed.join(", ")}`,
                });
            }
        }
        return errors;
    }
    // ══════════════════════════════════════════════════════════════════════════
    // PRIVATE — TRANSFORM (type coercions)
    // ══════════════════════════════════════════════════════════════════════════
    transform(row, config) {
        var _a;
        const payload = {};
        for (const col of config.columns) {
            const raw = row[col];
            const transform = (_a = config.transforms) === null || _a === void 0 ? void 0 : _a[col];
            // Treat empty/null as null — but don't stringify objects to check
            const isEmpty = raw === undefined ||
                raw === null ||
                (typeof raw === "string" && raw.trim() === "");
            if (isEmpty) {
                payload[col] = null;
                continue;
            }
            payload[col] = transform
                ? this.coerce(raw, transform)
                : typeof raw === "string"
                    ? raw.trim()
                    : raw;
        }
        return payload;
    }
    // ─────────────────────────────────────────────────────────────────────────
    coerce(value, transform) {
        switch (transform) {
            case "boolean": {
                const str = String(value).trim().toLowerCase();
                return str === "true" || str === "1" || str === "yes";
            }
            case "number": {
                const num = Number(value);
                return isNaN(num) ? null : num;
            }
            case "array": {
                if (Array.isArray(value))
                    return value;
                const str = String(value).trim();
                try {
                    const parsed = JSON.parse(str);
                    if (Array.isArray(parsed))
                        return parsed.map(String).filter(Boolean);
                }
                catch (_a) { }
                return str
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
            }
            case "json": {
                // Already a parsed object/array — stringify it for Knex/pg jsonb columns
                if (typeof value === "object" && value !== null) {
                    return JSON.stringify(value);
                }
                const str = String(value).trim();
                if (!str || str === "null")
                    return null;
                // Validate it's actually parseable, then return as string for pg
                try {
                    JSON.parse(str); // validate only
                    return str; // return the original string — pg accepts JSON strings for jsonb
                }
                catch (_b) {
                    return null;
                }
            }
            default:
                return typeof value === "string" ? value.trim() : value;
        }
    }
}
exports.default = ImportExportService;
//# sourceMappingURL=import-export.service.js.map