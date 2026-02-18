import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UploadMetaDto {
    @IsOptional()
    @IsEnum(['public', 'private'] as const)
    visibility?: 'public' | 'private';

    @IsOptional()
    @IsString()
    folder?: string;
}
