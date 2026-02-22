import { Router } from 'express';
import multer from 'multer';
import Route from '../interfaces/route.interface';
import UploadController from '../controllers/upload.controllers';
import validationMiddleware from '../middlewares/validation.middleware';
import { UploadMetaDto } from '../dtos/upload.dto';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024,
    },
});

 class UploadRoute implements Route {
    public path = '/uploads';
    public router = Router();
    private uploadController = new UploadController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            '/',
            upload.single('file'),
            validationMiddleware(UploadMetaDto, 'body', true, []),
            this.uploadController.upload
        );
    }
}

export default UploadRoute;
