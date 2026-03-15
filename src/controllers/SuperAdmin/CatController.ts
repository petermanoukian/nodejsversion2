import { Request, Response } from 'express';
import { CatService } from '../../services/actions/Common/CatService';
import { ImageUploadService } from '../../services/actions/Common/ImageUploadService';
import { FileUploadService } from '../../services/actions/Common/FileUploadService';

export class CatController {
    private catService: CatService;
    private imageService: ImageUploadService;
    private fileService: FileUploadService;

    constructor() {
        this.catService = new CatService();
        this.imageService = new ImageUploadService();
        this.fileService = new FileUploadService();
    }

    // 7-Rule: GET Many / Search / Paginated
    public list = async (req: Request, res: Response): Promise<void> => {
        try {
            const options = {
                page: req.query.page ? parseInt(req.query.page as string) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
                filters: req.body.filters || {},
                orderBy: req.query.orderBy as string,
                orderDir: req.query.orderDir as 'ASC' | 'DESC',
                search: req.query.search as string,
                searchFields: req.body.searchFields || ['name', 'filer'],
                useAnd: req.body.useAnd === true,
                related: req.body.related,
                fields: req.body.fields
            };

            const result = options.page 
                ? await this.catService.fetchPaginatedCats(options)
                : { rows: await this.catService.fetchAllCats(options), count: 0 };

            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    // 2-Rule: GET Single by ID
    public show = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            const options = {
                related: req.body.related,
                fields: req.body.fields
            };
            const cat = await this.catService.findCatById(id, options);
            if (!cat) {
                res.status(404).json({ success: false, message: "Cat not found" });
                return;
            }
            res.status(200).json({ success: true, data: cat });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    // ACTION: Store (Register)
    public store = async (req: Request, res: Response): Promise<void> => {
        try {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const catData = { ...req.body };

            // Handle Image Upload (using ImageUploadService for resizing)
            if (files?.img?.[0]) {
                const uploadResult = await this.imageService.upload(
                    files.img[0],
                    'uploads/cats/large',
                    'uploads/cats/small',
                    { baseFileName: catData.name }
                );
                catData.img = uploadResult.large;
                catData.img2 = uploadResult.small; // Thumb
            }

            // Handle General File Upload (if any specific doc is needed)
            if (files?.document?.[0]) {
                const fileResult = await this.fileService.upload(
                    files.document[0],
                    'uploads/cats/docs'
                );
                catData.file_path = fileResult.path;
            }

            const newCat = await this.catService.registerCat(catData);
            res.status(201).json({ success: true, data: newCat });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    // ACTION: Update
    public update = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const updateData = { ...req.body };

            if (files?.img?.[0]) {
                const uploadResult = await this.imageService.upload(
                    files.img[0],
                    'uploads/cats/large',
                    'uploads/cats/small'
                );
                updateData.img = uploadResult.large;
                updateData.img2 = uploadResult.small;
            }

            const updatedCat = await this.catService.modifyCat(id, updateData);
            res.status(200).json({ success: true, data: updatedCat });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    // ACTION: Delete Single
    public destroy = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            
            // Logic: You might want to retrieve the cat first to delete physical files
            const cat = await this.catService.findCatById(id);
            if (cat) {
                if (cat.img) await this.fileService.remove(cat.img);
                if (cat.img2) await this.fileService.remove(cat.img2);
            }

            const success = await this.catService.removeCat(id);
            res.status(200).json({ success, message: success ? "Cat deleted" : "Delete failed" });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    // ACTION: Delete Many
    public bulkDestroy = async (req: Request, res: Response): Promise<void> => {
        try {
            const count = await this.catService.bulkRemoveCats(req.body.filters);
            res.status(200).json({ success: true, message: `${count} cats removed` });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
}