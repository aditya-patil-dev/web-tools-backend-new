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
            // Treat empty strings as null
            if (raw === undefined || raw === null || String(raw).trim() === "") {
                payload[col] = null;
                continue;
            }
            payload[col] = transform
                ? this.coerce(raw, transform)
                : String(raw).trim();
        }
        return payload;
    }
    // ─────────────────────────────────────────────────────────────────────────
    coerce(value, transform) {
        const str = String(value).trim();
        switch (transform) {
            case "boolean":
                return str === "true" || str === "1" || str === "yes";
            case "number":
                const num = Number(str);
                return isNaN(num) ? null : num;
            case "array":
                // Parse to JS string[] first
                let arr;
                try {
                    const parsed = JSON.parse(str);
                    arr = Array.isArray(parsed) ? parsed.map(String) : [str];
                }
                catch (_a) {
                    arr = str
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                }
                // Wrap in DB.raw so Knex sends it as PostgreSQL text[]
                return index_schema_1.default.raw("?::text[]", [
                    JSON.stringify(arr).replace(/^\[/, "{").replace(/\]$/, "}"),
                ]);
            case "json":
                try {
                    return JSON.parse(str);
                }
                catch (_b) {
                    return null;
                }
            default:
                return str;
        }
    }
}
exports.default = ImportExportService;
//# sourceMappingURL=import-export.service.js.map