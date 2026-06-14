"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpeedTestDto = exports.ToolFiltersDto = exports.DuplicateToolDto = exports.BulkDeleteDto = exports.BulkUpdateDto = exports.UpdateToolDto = exports.CreateToolDto = exports.ToolPageDto = exports.ToolDto = exports.CategoryDto = exports.FaqDto = exports.FeatureDto = exports.AccessLevel = exports.ToolBadge = exports.PageStatus = exports.ToolStatus = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
// ============================================
// ENUMS - MATCHING EXISTING DB SCHEMA
// ============================================
// tools table: status enum ["active", "draft", "archived"]
var ToolStatus;
(function (ToolStatus) {
    ToolStatus["ACTIVE"] = "active";
    ToolStatus["DRAFT"] = "draft";
    ToolStatus["ARCHIVED"] = "archived";
})(ToolStatus || (exports.ToolStatus = ToolStatus = {}));
// tool_pages & tools_category_pages: status enum ["draft", "published", "archived"]
var PageStatus;
(function (PageStatus) {
    PageStatus["DRAFT"] = "draft";
    PageStatus["PUBLISHED"] = "published";
    PageStatus["ARCHIVED"] = "archived";
})(PageStatus || (exports.PageStatus = PageStatus = {}));
// badge is a string in DB, not enum - but we validate against these values
var ToolBadge;
(function (ToolBadge) {
    ToolBadge["NEW"] = "new";
    ToolBadge["POPULAR"] = "popular";
    ToolBadge["PRO"] = "pro";
})(ToolBadge || (exports.ToolBadge = ToolBadge = {}));
// tools table: access_level enum ["free", "pro", "premium"]
var AccessLevel;
(function (AccessLevel) {
    AccessLevel["FREE"] = "free";
    AccessLevel["PREMIUM"] = "premium";
    AccessLevel["PRO"] = "pro";
})(AccessLevel || (exports.AccessLevel = AccessLevel = {}));
// ============================================
// NESTED DTOs
// ============================================
class FeatureDto {
}
exports.FeatureDto = FeatureDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: "Feature title is required" }),
    __metadata("design:type", String)
], FeatureDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: "Feature description is required" }),
    __metadata("design:type", String)
], FeatureDto.prototype, "description", void 0);
class FaqDto {
}
exports.FaqDto = FaqDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: "FAQ question is required" }),
    __metadata("design:type", String)
], FaqDto.prototype, "question", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: "FAQ answer is required" }),
    __metadata("design:type", String)
], FaqDto.prototype, "answer", void 0);
// ============================================
// CATEGORY DTO
// ============================================
class CategoryDto {
}
exports.CategoryDto = CategoryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: "Category slug is required" }),
    (0, class_validator_1.MaxLength)(100),
    (0, class_validator_1.Matches)(/^[a-z0-9-]+$/, {
        message: "Category slug must contain only lowercase letters, numbers, and hyphens",
    }),
    __metadata("design:type", String)
], CategoryDto.prototype, "category_slug", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: "Category page title is required" }),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CategoryDto.prototype, "page_title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: "Category page description is required" }),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], CategoryDto.prototype, "page_description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CategoryDto.prototype, "page_intro", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CategoryDto.prototype, "meta_title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CategoryDto.prototype, "meta_description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CategoryDto.prototype, "meta_keywords", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: "Invalid canonical URL" }),
    __metadata("design:type", String)
], CategoryDto.prototype, "canonical_url", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CategoryDto.prototype, "noindex", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(PageStatus),
    __metadata("design:type", String)
], CategoryDto.prototype, "status", void 0);
// ============================================
// TOOL DTO
// ============================================
class ToolDto {
}
exports.ToolDto = ToolDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: "Tool title is required" }),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], ToolDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: "Tool slug is required" }),
    (0, class_validator_1.MaxLength)(255),
    (0, class_validator_1.Matches)(/^[a-z0-9-]+$/, {
        message: "Tool slug must contain only lowercase letters, numbers, and hyphens",
    }),
    __metadata("design:type", String)
], ToolDto.prototype, "slug", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: "Category slug is required" }),
    (0, class_validator_1.MaxLength)(100),
    (0, class_validator_1.Matches)(/^[a-z0-9-]+$/, {
        message: "Category slug must contain only lowercase letters, numbers, and hyphens",
    }),
    __metadata("design:type", String)
], ToolDto.prototype, "category_slug", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: "Tool type is required" }),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], ToolDto.prototype, "tool_type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ToolDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: "Short description is required" }),
    __metadata("design:type", String)
], ToolDto.prototype, "short_description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ToolBadge),
    __metadata("design:type", String)
], ToolDto.prototype, "badge", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(AccessLevel),
    __metadata("design:type", String)
], ToolDto.prototype, "access_level", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: "Tool URL is required" }),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], ToolDto.prototype, "tool_url", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ToolStatus),
    __metadata("design:type", String)
], ToolDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ToolDto.prototype, "is_featured", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ToolDto.prototype, "sort_order", void 0);
// ============================================
// TOOL PAGE DTO
// ============================================
class ToolPageDto {
}
exports.ToolPageDto = ToolPageDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    (0, class_validator_1.Matches)(/^[a-z0-9-]+$/, {
        message: "Tool slug must contain only lowercase letters, numbers, and hyphens",
    }),
    __metadata("design:type", String)
], ToolPageDto.prototype, "tool_slug", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: "Page title is required" }),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], ToolPageDto.prototype, "page_title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ToolPageDto.prototype, "page_intro", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ToolPageDto.prototype, "long_content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => FeatureDto),
    __metadata("design:type", Array)
], ToolPageDto.prototype, "features", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => FaqDto),
    __metadata("design:type", Array)
], ToolPageDto.prototype, "faqs", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ToolPageDto.prototype, "meta_title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ToolPageDto.prototype, "meta_description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ToolPageDto.prototype, "meta_keywords", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: "Invalid canonical URL" }),
    __metadata("design:type", String)
], ToolPageDto.prototype, "canonical_url", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ToolPageDto.prototype, "noindex", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ToolPageDto.prototype, "schema_markup", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(PageStatus),
    __metadata("design:type", String)
], ToolPageDto.prototype, "status", void 0);
// ============================================
// MAIN CREATE/UPDATE DTOs
// ============================================
class CreateToolDto {
}
exports.CreateToolDto = CreateToolDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CategoryDto),
    __metadata("design:type", CategoryDto)
], CreateToolDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ToolDto),
    __metadata("design:type", ToolDto)
], CreateToolDto.prototype, "tool", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ToolPageDto),
    __metadata("design:type", ToolPageDto)
], CreateToolDto.prototype, "page", void 0);
class UpdateToolDto {
}
exports.UpdateToolDto = UpdateToolDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CategoryDto),
    __metadata("design:type", CategoryDto)
], UpdateToolDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ToolDto),
    __metadata("design:type", ToolDto)
], UpdateToolDto.prototype, "tool", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ToolPageDto),
    __metadata("design:type", ToolPageDto)
], UpdateToolDto.prototype, "page", void 0);
// ============================================
// BULK OPERATIONS DTOs
// ============================================
class BulkUpdateDto {
}
exports.BulkUpdateDto = BulkUpdateDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1, { message: "At least one tool ID is required" }),
    (0, class_validator_1.IsInt)({ each: true }),
    __metadata("design:type", Array)
], BulkUpdateDto.prototype, "ids", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ToolStatus),
    __metadata("design:type", String)
], BulkUpdateDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkUpdateDto.prototype, "category_slug", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ToolBadge),
    __metadata("design:type", String)
], BulkUpdateDto.prototype, "badge", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(AccessLevel),
    __metadata("design:type", String)
], BulkUpdateDto.prototype, "access_level", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], BulkUpdateDto.prototype, "is_featured", void 0);
class BulkDeleteDto {
}
exports.BulkDeleteDto = BulkDeleteDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1, { message: "At least one tool ID is required" }),
    (0, class_validator_1.IsInt)({ each: true }),
    __metadata("design:type", Array)
], BulkDeleteDto.prototype, "ids", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], BulkDeleteDto.prototype, "permanent", void 0);
// ============================================
// DUPLICATE TOOL DTO
// ============================================
class DuplicateToolDto {
}
exports.DuplicateToolDto = DuplicateToolDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: "New slug is required" }),
    (0, class_validator_1.MaxLength)(255),
    (0, class_validator_1.Matches)(/^[a-z0-9-]+$/, {
        message: "Slug must contain only lowercase letters, numbers, and hyphens",
    }),
    __metadata("design:type", String)
], DuplicateToolDto.prototype, "new_slug", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], DuplicateToolDto.prototype, "new_title", void 0);
// ============================================
// QUERY FILTER DTOs
// ============================================
class ToolFiltersDto {
}
exports.ToolFiltersDto = ToolFiltersDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ToolFiltersDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], ToolFiltersDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ToolFiltersDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ToolFiltersDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ToolStatus),
    __metadata("design:type", String)
], ToolFiltersDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ToolBadge),
    __metadata("design:type", String)
], ToolFiltersDto.prototype, "badge", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(AccessLevel),
    __metadata("design:type", String)
], ToolFiltersDto.prototype, "access_level", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ToolFiltersDto.prototype, "is_featured", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ToolFiltersDto.prototype, "sort_by", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ToolFiltersDto.prototype, "sort_order", void 0);
class SpeedTestDto {
}
exports.SpeedTestDto = SpeedTestDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SpeedTestDto.prototype, "url", void 0);
//# sourceMappingURL=tools.dto.js.map