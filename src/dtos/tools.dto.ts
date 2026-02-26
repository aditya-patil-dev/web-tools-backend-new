import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsEnum,
  IsUrl,
  IsInt,
  Min,
  Max,
  MaxLength,
  MinLength,
  Matches,
  ValidateNested,
  ArrayMinSize,
} from "class-validator";
import { Type } from "class-transformer";

// ============================================
// ENUMS - MATCHING EXISTING DB SCHEMA
// ============================================

// tools table: status enum ["active", "draft", "archived"]
export enum ToolStatus {
  ACTIVE = "active",
  DRAFT = "draft",
  ARCHIVED = "archived",
}

// tool_pages & tools_category_pages: status enum ["draft", "published", "archived"]
export enum PageStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

// badge is a string in DB, not enum - but we validate against these values
export enum ToolBadge {
  NEW = "new",
  POPULAR = "popular",
  PRO = "pro",
}

// tools table: access_level enum ["free", "pro", "premium"]
export enum AccessLevel {
  FREE = "free",
  PREMIUM = "premium",
  PRO = "pro",
}

// ============================================
// NESTED DTOs
// ============================================

export class FeatureDto {
  @IsString()
  @MinLength(1, { message: "Feature title is required" })
  title: string;

  @IsString()
  @MinLength(1, { message: "Feature description is required" })
  description: string;
}

export class FaqDto {
  @IsString()
  @MinLength(1, { message: "FAQ question is required" })
  question: string;

  @IsString()
  @MinLength(1, { message: "FAQ answer is required" })
  answer: string;
}

// ============================================
// CATEGORY DTO
// ============================================

export class CategoryDto {
  @IsString()
  @MinLength(1, { message: "Category slug is required" })
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, {
    message:
      "Category slug must contain only lowercase letters, numbers, and hyphens",
  })
  category_slug: string;

  @IsString()
  @MinLength(1, { message: "Category page title is required" })
  @MaxLength(255)
  page_title: string;

  @IsString()
  @MinLength(1, { message: "Category page description is required" })
  @MaxLength(5000)
  page_description: string;

  @IsOptional()
  @IsString()
  page_intro?: string | null;

  @IsOptional()
  @IsString()
  meta_title?: string | null;

  @IsOptional()
  @IsString()
  meta_description?: string | null;

  @IsOptional()
  @IsString()
  meta_keywords?: string | null;

  @IsOptional()
  @IsUrl({}, { message: "Invalid canonical URL" })
  canonical_url?: string | null;

  @IsOptional()
  @IsBoolean()
  noindex?: boolean;

  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus;
}

// ============================================
// TOOL DTO
// ============================================

export class ToolDto {
  @IsString()
  @MinLength(1, { message: "Tool title is required" })
  @MaxLength(255)
  title: string;

  @IsString()
  @MinLength(1, { message: "Tool slug is required" })
  @MaxLength(255)
  @Matches(/^[a-z0-9-]+$/, {
    message: "Tool slug must contain only lowercase letters, numbers, and hyphens",
  })
  slug: string;

  @IsString()
  @MinLength(1, { message: "Category slug is required" })
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, {
    message:
      "Category slug must contain only lowercase letters, numbers, and hyphens",
  })
  category_slug: string;

  @IsString()
  @MinLength(1, { message: "Tool type is required" })
  @MaxLength(50)
  tool_type: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsString()
  @MinLength(1, { message: "Short description is required" })
  short_description: string;

  @IsOptional()
  @IsEnum(ToolBadge)
  badge?: ToolBadge | null;

  @IsOptional()
  @IsEnum(AccessLevel)
  access_level?: AccessLevel;

  @IsString()
  @MinLength(1, { message: "Tool URL is required" })
  @MaxLength(255)
  tool_url: string;

  @IsOptional()
  @IsEnum(ToolStatus)
  status?: ToolStatus;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;
}

// ============================================
// TOOL PAGE DTO
// ============================================

export class ToolPageDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Matches(/^[a-z0-9-]+$/, {
    message: "Tool slug must contain only lowercase letters, numbers, and hyphens",
  })
  tool_slug?: string;

  @IsString()
  @MinLength(1, { message: "Page title is required" })
  @MaxLength(255)
  page_title: string;

  @IsOptional()
  @IsString()
  page_intro?: string | null;

  @IsOptional()
  @IsString()
  long_content?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeatureDto)
  features?: FeatureDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqDto)
  faqs?: FaqDto[];

  @IsOptional()
  @IsString()
  meta_title?: string | null;

  @IsOptional()
  @IsString()
  meta_description?: string | null;

  @IsOptional()
  @IsString()
  meta_keywords?: string | null;

  @IsOptional()
  @IsUrl({}, { message: "Invalid canonical URL" })
  canonical_url?: string | null;

  @IsOptional()
  @IsBoolean()
  noindex?: boolean;

  @IsOptional()
  @IsString()
  schema_markup?: string | null;

  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus;
}

// ============================================
// MAIN CREATE/UPDATE DTOs
// ============================================

export class CreateToolDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CategoryDto)
  category?: CategoryDto;

  @ValidateNested()
  @Type(() => ToolDto)
  tool: ToolDto;

  @ValidateNested()
  @Type(() => ToolPageDto)
  page: ToolPageDto;
}

export class UpdateToolDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CategoryDto)
  category?: CategoryDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ToolDto)
  tool?: ToolDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ToolPageDto)
  page?: ToolPageDto;
}

// ============================================
// BULK OPERATIONS DTOs
// ============================================

export class BulkUpdateDto {
  @IsArray()
  @ArrayMinSize(1, { message: "At least one tool ID is required" })
  @IsInt({ each: true })
  ids: number[];

  @IsOptional()
  @IsEnum(ToolStatus)
  status?: ToolStatus;

  @IsOptional()
  @IsString()
  category_slug?: string;

  @IsOptional()
  @IsEnum(ToolBadge)
  badge?: ToolBadge;

  @IsOptional()
  @IsEnum(AccessLevel)
  access_level?: AccessLevel;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;
}

export class BulkDeleteDto {
  @IsArray()
  @ArrayMinSize(1, { message: "At least one tool ID is required" })
  @IsInt({ each: true })
  ids: number[];

  @IsOptional()
  @IsBoolean()
  permanent?: boolean;
}

// ============================================
// DUPLICATE TOOL DTO
// ============================================

export class DuplicateToolDto {
  @IsString()
  @MinLength(1, { message: "New slug is required" })
  @MaxLength(255)
  @Matches(/^[a-z0-9-]+$/, {
    message: "Slug must contain only lowercase letters, numbers, and hyphens",
  })
  new_slug: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  new_title?: string;
}

// ============================================
// QUERY FILTER DTOs
// ============================================

export class ToolFiltersDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(ToolStatus)
  status?: ToolStatus;

  @IsOptional()
  @IsEnum(ToolBadge)
  badge?: ToolBadge;

  @IsOptional()
  @IsEnum(AccessLevel)
  access_level?: AccessLevel;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  @IsOptional()
  @IsString()
  sort_by?: string;

  @IsOptional()
  @IsString()
  sort_order?: "asc" | "desc";
}

export class SpeedTestDto {

  @IsString()
  url: string;

}