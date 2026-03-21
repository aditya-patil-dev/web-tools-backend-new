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
exports.UpdateStaticSeoDto = exports.CreateStaticSeoDto = exports.ChangeFrequency = exports.SeoStatus = exports.SeoPageKey = void 0;
const class_validator_1 = require("class-validator");
/* ============================================
   ENUMS
============================================ */
var SeoPageKey;
(function (SeoPageKey) {
    SeoPageKey["HOME"] = "home";
    SeoPageKey["ABOUT"] = "about";
    SeoPageKey["PRICING"] = "pricing";
    SeoPageKey["CONTACT"] = "contact";
})(SeoPageKey || (exports.SeoPageKey = SeoPageKey = {}));
var SeoStatus;
(function (SeoStatus) {
    SeoStatus["ACTIVE"] = "active";
    SeoStatus["DRAFT"] = "draft";
})(SeoStatus || (exports.SeoStatus = SeoStatus = {}));
var ChangeFrequency;
(function (ChangeFrequency) {
    ChangeFrequency["ALWAYS"] = "always";
    ChangeFrequency["HOURLY"] = "hourly";
    ChangeFrequency["DAILY"] = "daily";
    ChangeFrequency["WEEKLY"] = "weekly";
    ChangeFrequency["MONTHLY"] = "monthly";
    ChangeFrequency["YEARLY"] = "yearly";
    ChangeFrequency["NEVER"] = "never";
})(ChangeFrequency || (exports.ChangeFrequency = ChangeFrequency = {}));
/* ============================================
   CREATE DTO
============================================ */
class CreateStaticSeoDto {
}
exports.CreateStaticSeoDto = CreateStaticSeoDto;
__decorate([
    (0, class_validator_1.IsEnum)(SeoPageKey),
    __metadata("design:type", String)
], CreateStaticSeoDto.prototype, "page_key", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateStaticSeoDto.prototype, "meta_title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStaticSeoDto.prototype, "meta_description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateStaticSeoDto.prototype, "meta_keywords", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateStaticSeoDto.prototype, "canonical_url", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateStaticSeoDto.prototype, "og_image", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateStaticSeoDto.prototype, "noindex", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateStaticSeoDto.prototype, "nofollow", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], CreateStaticSeoDto.prototype, "priority", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ChangeFrequency),
    __metadata("design:type", String)
], CreateStaticSeoDto.prototype, "changefreq", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(SeoStatus),
    __metadata("design:type", String)
], CreateStaticSeoDto.prototype, "status", void 0);
/* ============================================
   UPDATE DTO
============================================ */
class UpdateStaticSeoDto extends CreateStaticSeoDto {
}
exports.UpdateStaticSeoDto = UpdateStaticSeoDto;
//# sourceMappingURL=seo.dto.js.map