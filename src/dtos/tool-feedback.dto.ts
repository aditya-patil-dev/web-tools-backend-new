import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export enum RatingType {
  LIKE = "like",
  DISLIKE = "dislike",
}

export class CreateToolFeedbackDto {
  @IsString()
  @IsNotEmpty()
  public tool_slug!: string;

  @IsEnum(RatingType)
  @IsNotEmpty()
  public rating!: RatingType;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  public reason?: string;

  @IsString()
  @IsOptional()
  public session_id?: string;
}
