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
exports.CreateToolFeedbackDto = exports.RatingType = void 0;
const class_validator_1 = require("class-validator");
var RatingType;
(function (RatingType) {
    RatingType["LIKE"] = "like";
    RatingType["DISLIKE"] = "dislike";
})(RatingType || (exports.RatingType = RatingType = {}));
class CreateToolFeedbackDto {
}
exports.CreateToolFeedbackDto = CreateToolFeedbackDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateToolFeedbackDto.prototype, "tool_slug", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(RatingType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateToolFeedbackDto.prototype, "rating", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], CreateToolFeedbackDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateToolFeedbackDto.prototype, "session_id", void 0);
//# sourceMappingURL=tool-feedback.dto.js.map