import DB from "../database/index.schema";
import {
  REGISTRY,
  ResourceConfig,
  ResourceName,
  FieldTransform,
} from "../config/import-export.registry";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type ImportMode = "append" | "update";

export interface ImportError {
  row: number;
  column?: string;
  value?: any;
  error: string;
}

export interface ImportResult {
  imported: number;
  updated: number;
  failed: number;
  errors: ImportError[];
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

class ImportExportService {
  // ══════════════════════════════════════════════════════════════════════════
  // EXPORT
  // ══════════════════════════════════════════════════════════════════════════

  public async exportResource(resource: ResourceName): Promise<any[]> {
    const config = REGISTRY[resource];

    return DB(config.table).select(config.columns).orderBy("id", "asc");
  }

  // ══════════════════════════════════════════════════════════════════════════
  // IMPORT
  // ══════════════════════════════════════════════════════════════════════════

  public async importResource(
    resource: ResourceName,
    rows: any[],
    mode: ImportMode,
  ): Promise<ImportResult> {
    const config = REGISTRY[resource];

    const result: ImportResult = {
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
        } else {
          await this.upsert(config, payload, rowNum, result);
        }
      } catch (err: any) {
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

  private async append(
    config: ResourceConfig,
    payload: Record<string, any>,
    rowNum: number,
    result: ImportResult,
  ): Promise<void> {
    // Block duplicate by uniqueKey if provided in the payload
    if (
      payload[config.uniqueKey] !== undefined &&
      payload[config.uniqueKey] !== null
    ) {
      const existing = await DB(config.table)
        .where({ [config.uniqueKey]: payload[config.uniqueKey] })
        .first();

      if (existing) {
        throw new Error(
          `Duplicate ${config.uniqueKey}: "${payload[config.uniqueKey]}"`,
        );
      }
    }

    // Strip id on append so DB auto-generates it
    const { id, ...insertPayload } = payload;

    await DB(config.table).insert({
      ...insertPayload,
      created_at: DB.fn.now(),
      updated_at: DB.fn.now(),
    });

    result.imported++;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PRIVATE — UPSERT (update mode)
  // ══════════════════════════════════════════════════════════════════════════

  private async upsert(
    config: ResourceConfig,
    payload: Record<string, any>,
    rowNum: number,
    result: ImportResult,
  ): Promise<void> {
    const keyValue = payload[config.uniqueKey];

    // If no unique key value supplied, treat as a fresh insert
    if (keyValue === undefined || keyValue === null || keyValue === "") {
      const { id, ...insertPayload } = payload;
      await DB(config.table).insert({
        ...insertPayload,
        created_at: DB.fn.now(),
        updated_at: DB.fn.now(),
      });
      result.imported++;
      return;
    }

    const existing = await DB(config.table)
      .where({ [config.uniqueKey]: keyValue })
      .first();

    if (existing) {
      // UPDATE — never overwrite created_at
      const { id, created_at, ...updatePayload } = payload;
      await DB(config.table)
        .where({ [config.uniqueKey]: keyValue })
        .update({
          ...updatePayload,
          updated_at: DB.fn.now(),
        });
      result.updated++;
    } else {
      // INSERT — record doesn't exist yet
      const { id, ...insertPayload } = payload;
      await DB(config.table).insert({
        ...insertPayload,
        created_at: DB.fn.now(),
        updated_at: DB.fn.now(),
      });
      result.imported++;
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PRIVATE — VALIDATE REQUIRED
  // ══════════════════════════════════════════════════════════════════════════

  private validate(
    row: any,
    config: ResourceConfig,
    rowNum: number,
  ): ImportError[] {
    const errors: ImportError[] = [];

    for (const field of config.required) {
      const value = row[field];
      if (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
      ) {
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

  private validateEnums(
    payload: Record<string, any>,
    config: ResourceConfig,
    rowNum: number,
  ): ImportError[] {
    const errors: ImportError[] = [];

    if (!config.enums) return errors;

    for (const [column, allowed] of Object.entries(config.enums)) {
      const value = payload[column];
      // Skip null/undefined — DB default will apply
      if (value === null || value === undefined) continue;

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

  private transform(row: any, config: ResourceConfig): Record<string, any> {
    const payload: Record<string, any> = {};

    for (const col of config.columns) {
      const raw = row[col];
      const transform = config.transforms?.[col];

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

  private coerce(value: any, transform: FieldTransform): any {
    const str = String(value).trim();

    switch (transform) {
      case "boolean":
        return str === "true" || str === "1" || str === "yes";

      case "number":
        const num = Number(str);
        return isNaN(num) ? null : num;

      case "array":
        // Parse to JS string[] first
        let arr: string[];
        try {
          const parsed = JSON.parse(str);
          arr = Array.isArray(parsed) ? parsed.map(String) : [str];
        } catch {
          arr = str
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
        // Wrap in DB.raw so Knex sends it as PostgreSQL text[]
        return DB.raw("?::text[]", [
          JSON.stringify(arr).replace(/^\[/, "{").replace(/\]$/, "}"),
        ]);

      case "json":
        try {
          return JSON.parse(str);
        } catch {
          return null;
        }

      default:
        return str;
    }
  }
}

export default ImportExportService;
