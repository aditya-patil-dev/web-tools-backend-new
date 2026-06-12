import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsIn,
    MinLength,
    MaxLength,
    IsNumber,
    Min,
    Max,
} from "class-validator";

export class GenerateMetaDescriptionDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(10, { message: "Content must be at least 10 characters" })
    @MaxLength(5000, { message: "Content must not exceed 5000 characters" })
    content: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    focusKeyword?: string;

    @IsOptional()
    @IsString()
    @IsIn(["formal", "casual", "professional", "persuasive"])
    tone?: "formal" | "casual" | "professional" | "persuasive";

    @IsOptional()
    @IsNumber()
    @Min(50)
    @Max(160)
    maxLength?: number;
}