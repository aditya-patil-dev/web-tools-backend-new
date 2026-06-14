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
exports.UpdateRobotsRuleDto = exports.CreateRobotsRuleDto = exports.RobotsEnvironment = exports.RobotsStatus = exports.RobotsRuleType = void 0;
const class_validator_1 = require("class-validator");
/* ============================================
   ENUMS
============================================ */
var RobotsRuleType;
(function (RobotsRuleType) {
    RobotsRuleType["ALLOW"] = "allow";
    RobotsRuleType["DISALLOW"] = "disallow";
})(RobotsRuleType || (exports.RobotsRuleType = RobotsRuleType = {}));
var RobotsStatus;
(function (RobotsStatus) {
    RobotsStatus["ACTIVE"] = "active";
    RobotsStatus["INACTIVE"] = "inactive";
})(RobotsStatus || (exports.RobotsStatus = RobotsStatus = {}));
var RobotsEnvironment;
(function (RobotsEnvironment) {
    RobotsEnvironment["PRODUCTION"] = "production";
    RobotsEnvironment["STAGING"] = "staging";
    RobotsEnvironment["DEVELOPMENT"] = "development";
})(RobotsEnvironment || (exports.RobotsEnvironment = RobotsEnvironment = {}));
/* ============================================
   CREATE DTO
============================================ */
class CreateRobotsRuleDto {
}
exports.CreateRobotsRuleDto = CreateRobotsRuleDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRobotsRuleDto.prototype, "user_agent", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(RobotsRuleType),
    __metadata("design:type", String)
], CreateRobotsRuleDto.prototype, "rule_type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRobotsRuleDto.prototype, "path", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateRobotsRuleDto.prototype, "crawl_delay", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(RobotsStatus),
    __metadata("design:type", String)
], CreateRobotsRuleDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(RobotsEnvironment),
    __metadata("design:type", String)
], CreateRobotsRuleDto.prototype, "environment", void 0);
/* ============================================
   UPDATE DTO
============================================ */
class UpdateRobotsRuleDto extends CreateRobotsRuleDto {
}
exports.UpdateRobotsRuleDto = UpdateRobotsRuleDto;
//# sourceMappingURL=seo-robots.dto.js.map