import {
    IsString,
    IsOptional,
    IsEnum,
    IsInt,
    Min,
    Max,
} from "class-validator";

/* ============================================
   ENUMS
============================================ */

export enum RobotsRuleType {
    ALLOW = "allow",
    DISALLOW = "disallow",
}

export enum RobotsStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
}

export enum RobotsEnvironment {
    PRODUCTION = "production",
    STAGING = "staging",
    DEVELOPMENT = "development",
}

/* ============================================
   CREATE DTO
============================================ */

export class CreateRobotsRuleDto {
    @IsString()
    user_agent: string;

    @IsEnum(RobotsRuleType)
    rule_type: RobotsRuleType;

    @IsString()
    path: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(100)
    crawl_delay?: number;

    @IsOptional()
    @IsEnum(RobotsStatus)
    status?: RobotsStatus;

    @IsOptional()
    @IsEnum(RobotsEnvironment)
    environment?: RobotsEnvironment;
}

/* ============================================
   UPDATE DTO
============================================ */

export class UpdateRobotsRuleDto extends CreateRobotsRuleDto { }