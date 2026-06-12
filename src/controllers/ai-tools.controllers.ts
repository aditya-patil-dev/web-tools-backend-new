import { Request, Response, NextFunction } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { AiMetaDescriptionService } from "../services/ai-meta-description.service";
import { GenerateMetaDescriptionDto } from "../dtos/ai-tools.dto";
import HttpException from "../exceptions/HttpException";

class AiToolsController {
    private metaDescriptionService = new AiMetaDescriptionService();

    /**
     * POST /ai-tools/meta-description
     * Body: GenerateMetaDescriptionDto
     */
    public generateMetaDescription = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const dto = plainToInstance(GenerateMetaDescriptionDto, req.body);
            const errors = await validate(dto);

            if (errors.length > 0) {
                const messages = errors
                    .map((e) => Object.values(e.constraints ?? {}).join(", "))
                    .join("; ");
                throw new HttpException(400, messages);
            }

            const result = await this.metaDescriptionService.generate({
                content: dto.content,
                focusKeyword: dto.focusKeyword,
                tone: dto.tone,
                maxLength: dto.maxLength,
            });

            res.status(200).json({
                success: true,
                message: "Meta description generated successfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };
}

export default AiToolsController;