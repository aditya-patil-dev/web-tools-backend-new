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
exports.PageComponentQueryDto = exports.UpdatePageComponentDto = exports.CreatePageComponentDto = exports.ComponentStatus = exports.ComponentType = exports.PageKey = void 0;
const class_validator_1 = require("class-validator");
/* ============================================
   ENUMS
============================================ */
var PageKey;
(function (PageKey) {
    PageKey["HOME"] = "home";
    PageKey["ABOUT"] = "about";
    PageKey["PRICING"] = "pricing";
    PageKey["CONTACT"] = "contact";
})(PageKey || (exports.PageKey = PageKey = {}));
var ComponentType;
(function (ComponentType) {
    ComponentType["HERO"] = "hero";
    ComponentType["POPULAR_TOOLS"] = "popular-tools";
    ComponentType["WHY_CHOOSE_US"] = "why-choose-us";
    ComponentType["HOW_IT_WORKS"] = "how-it-works";
    ComponentType["FINAL_CTA"] = "final-cta";
    ComponentType["SEO_CONTENT"] = "seo-content";
    ComponentType["TESTIMONIALS"] = "testimonials";
    ComponentType["FAQ"] = "faq";
    ComponentType["PRICING_CARDS"] = "pricing-cards";
    ComponentType["FEATURES"] = "features";
    ComponentType["STATS"] = "stats";
})(ComponentType || (exports.ComponentType = ComponentType = {}));
var ComponentStatus;
(function (ComponentStatus) {
    ComponentStatus["ACTIVE"] = "active";
    ComponentStatus["DRAFT"] = "draft";
    ComponentStatus["ARCHIVED"] = "archived";
})(ComponentStatus || (exports.ComponentStatus = ComponentStatus = {}));
/* ============================================
   CREATE DTO
============================================ */
class CreatePageComponentDto {
}
exports.CreatePageComponentDto = CreatePageComponentDto;
__decorate([
    (0, class_validator_1.IsEnum)(PageKey),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePageComponentDto.prototype, "page_key", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ComponentType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePageComponentDto.prototype, "component_type", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreatePageComponentDto.prototype, "component_order", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreatePageComponentDto.prototype, "component_name", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], CreatePageComponentDto.prototype, "component_data", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePageComponentDto.prototype, "is_active", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ComponentStatus),
    __metadata("design:type", String)
], CreatePageComponentDto.prototype, "status", void 0);
/* ============================================
   UPDATE DTO
============================================ */
class UpdatePageComponentDto {
}
exports.UpdatePageComponentDto = UpdatePageComponentDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdatePageComponentDto.prototype, "component_order", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], UpdatePageComponentDto.prototype, "component_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdatePageComponentDto.prototype, "component_data", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePageComponentDto.prototype, "is_active", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ComponentStatus),
    __metadata("design:type", String)
], UpdatePageComponentDto.prototype, "status", void 0);
/* ============================================
   QUERY DTO (for filtering)
============================================ */
class PageComponentQueryDto {
}
exports.PageComponentQueryDto = PageComponentQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(PageKey),
    __metadata("design:type", String)
], PageComponentQueryDto.prototype, "page_key", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ComponentType),
    __metadata("design:type", String)
], PageComponentQueryDto.prototype, "component_type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ComponentStatus),
    __metadata("design:type", String)
], PageComponentQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PageComponentQueryDto.prototype, "is_active", void 0);
//# sourceMappingURL=page-components.dto.js.map