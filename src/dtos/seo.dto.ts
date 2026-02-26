import {
    IsString,
    IsOptional,
    IsBoolean,
    IsArray,
    IsEnum,
    IsDecimal,
    IsInt,
    Min,
    Max,
    MaxLength,
    MinLength,
    IsNumber,
} from "class-validator";

/* ============================================
   ENUMS
============================================ */

export enum SeoPageKey {
    HOME = "home",
    ABOUT = "about",
    PRICING = "pricing",
    CONTACT = "contact",
}

export enum SeoStatus {
    ACTIVE = "active",
    DRAFT = "draft",
}

export enum ChangeFrequency {
    ALWAYS = "always",
    HOURLY = "hourly",
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    YEARLY = "yearly",
    NEVER = "never",
}

/* ============================================
   CREATE DTO
============================================ */

export class CreateStaticSeoDto {
    @IsEnum(SeoPageKey)
    page_key: SeoPageKey;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    meta_title?: string;

    @IsOptional()
    @IsString()
    meta_description?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    meta_keywords?: string[];

    @IsOptional()
    @IsString()
    @MaxLength(255)
    canonical_url?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    og_image?: string;

    @IsOptional()
    @IsBoolean()
    noindex?: boolean;

    @IsOptional()
    @IsBoolean()
    nofollow?: boolean;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    priority?: number;

    @IsOptional()
    @IsEnum(ChangeFrequency)
    changefreq?: ChangeFrequency;

    @IsOptional()
    @IsEnum(SeoStatus)
    status?: SeoStatus;
}

/* ============================================
   UPDATE DTO
============================================ */

export class UpdateStaticSeoDto extends CreateStaticSeoDto { }