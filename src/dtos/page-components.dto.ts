import {
    IsString,
    IsOptional,
    IsBoolean,
    IsEnum,
    IsInt,
    Min,
    IsObject,
    MaxLength,
    IsNotEmpty,
} from "class-validator";

/* ============================================
   ENUMS
============================================ */

export enum PageKey {
    HOME = "home",
    ABOUT = "about",
    PRICING = "pricing",
    CONTACT = "contact",
}

export enum ComponentType {
    HERO = "hero",
    POPULAR_TOOLS = "popular-tools",
    WHY_CHOOSE_US = "why-choose-us",
    HOW_IT_WORKS = "how-it-works",
    FINAL_CTA = "final-cta",
    SEO_CONTENT = "seo-content",
    TESTIMONIALS = "testimonials",
    FAQ = "faq",
    PRICING_CARDS = "pricing-cards",
    FEATURES = "features",
    STATS = "stats",
}

export enum ComponentStatus {
    ACTIVE = "active",
    DRAFT = "draft",
    ARCHIVED = "archived",
}

/* ============================================
   CREATE DTO
============================================ */

export class CreatePageComponentDto {
    @IsEnum(PageKey)
    @IsNotEmpty()
    page_key: PageKey;

    @IsEnum(ComponentType)
    @IsNotEmpty()
    component_type: ComponentType;

    @IsInt()
    @Min(1)
    component_order: number;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    component_name?: string;

    @IsObject()
    @IsNotEmpty()
    component_data: Record<string, any>;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsEnum(ComponentStatus)
    status?: ComponentStatus;
}

/* ============================================
   UPDATE DTO
============================================ */

export class UpdatePageComponentDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    component_order?: number;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    component_name?: string;

    @IsOptional()
    @IsObject()
    component_data?: Record<string, any>;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsEnum(ComponentStatus)
    status?: ComponentStatus;
}

/* ============================================
   QUERY DTO (for filtering)
============================================ */

export class PageComponentQueryDto {
    @IsOptional()
    @IsEnum(PageKey)
    page_key?: PageKey;

    @IsOptional()
    @IsEnum(ComponentType)
    component_type?: ComponentType;

    @IsOptional()
    @IsEnum(ComponentStatus)
    status?: ComponentStatus;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}