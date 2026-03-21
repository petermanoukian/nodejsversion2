import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { CatService } from '@services/actions/Common/CatService';
import { ImageUploadService } from '@services/actions/Common/ImageUploadService';
import { FileUploadService } from '@services/actions/Common/FileUploadService';

import validateCat from '@request/superadmin/cat/validateCat';
import validateCatUpdate from '@request/superadmin/cat/validateCatUpdate';
import { randomSixDigits } from '@utils/random';
import asyncHandler from 'express-async-handler';
import { Op } from 'sequelize';

export class CatController {
    private catService: CatService;
    private imageService: ImageUploadService;
    private fileService: FileUploadService;

    constructor() {
        this.catService = new CatService();
        this.imageService = new ImageUploadService();
        this.fileService = new FileUploadService();
    }

    // GET Many / Search / Paginated


    // Part A: render the view
    public view = async (req: Request, res: Response): Promise<void> => {
        try {
            res.render('superadmin/cats/index'); // just render the template
        } catch (error: any) {
            res.status(500).send(error.message);
        }
    };

    // Part B: return JSON data for queries
    public list = async (req: Request, res: Response): Promise<void> => {
    try {
        const options = {
        page: req.body.page ? Number(req.body.page) : 1,
        limit: req.body.limit ? Number(req.body.limit) : 5,
        filters: req.body.filters || {},
        orderBy: req.body.orderBy || 'id',
        orderDir: req.body.orderDir || 'DESC',
        search: req.body.search,
        searchFields: req.body.searchFields || ['name', 'filer'],
        useAnd: req.body.useAnd === true,
        related: req.body.related,
        fields: req.body.fields
        };

        const result = await this.catService.fetchPaginatedCats(options);

        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
    };


    // GET Single by ID
    public show = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: "Invalid ID parameter" });
                return;
            }

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



    public checkName = async (req: Request, res: Response): Promise<void> => {
        try {
            // Accept from POST body (preferred) or query string (fallback)
            const namex = (req.body.name || req.query.name || '').trim();

            // Rule: must be at least 2 characters
            if (!namex || namex.length < 2) {
                res.json({ exists: false });
                return;
            }

            // Call service to check if cat exists
            const cat = await this.catService.findCatByFilter({
                    filters: { name: namex }
                });

            console.log('CheckName result:', cat);
            // Respond with existence flag
            res.json({ exists: !!cat });
        } catch (error: any) {
            res.status(500).json({ error: 'Error checking cat name.' });
        }
    };


    public checkNameForUpdateOLD = async (req: Request, res: Response): Promise<void> => 
    {
        try {
            const id = Number(req.params.id || req.query.id || req.body.id);
            const namex = (req.body.name || req.query.name || '').trim();

            if (!namex || namex.length < 2) {
                res.json({ exists: false });
                return;
            }

            const cat = await this.catService.findCatByFilter({
                filters: { name: namex }
            });

            // If another cat exists with this name and it's not the current one
            if (cat && (!id || cat.id !== id)) {
                res.json({ exists: true });
            } else {
                res.json({ exists: false });
            }
        } catch (error: any) {
            res.status(500).json({ error: 'Error checking cat name for update.' });
        }
    };


    public checkNameForUpdate = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id || req.query.id || req.body.id);
        const namex = (req.body.name || req.query.name || '').trim();

        if (!namex || namex.length < 2) {
            res.json({ exists: false });
            return;
        }

        const cat = await this.catService.findCatByFilter({
            filters: { 
                name: namex,
                ...(id && !isNaN(id) ? { id: { [Op.ne]: id } } : {})
            }
        });

        res.json({ exists: !!cat });
    } catch (error: any) {
        res.status(500).json({ error: 'Error checking cat name for update.' });
    }
};


    // FORM: Create (Show the form to register a new cat)
    public create = async (req: Request, res: Response): Promise<void> => {
        try {
            // You can pass any defaults or related data needed for the form
            res.render('superadmin/cats/create', {
                title: 'Create New Cat',
                defaults: {}
            });
        } catch (error: any) {
            res.status(500).send('Error loading create form');
        }
    };

    // FORM: Edit (Show the form to edit an existing cat)
    public edit = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) {
                res.status(400).send('Invalid ID parameter');
                return;
            }

            const cat = await this.catService.findCatById(id);
            if (!cat) {
                res.status(404).send('Cat not found');
                return;
            }

            res.render('superadmin/cats/edit', {
                title: 'Edit Cat',
                cat
            });
        } catch (error: any) {
            res.status(500).send('Error loading edit form');
        }
    };



    public store = [
    ...validateCat,
    asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const allErrors: { field: string; msg: string }[] = (req as any)._validationErrors || [];
        if (allErrors.length > 0) {
            req.flash('error', allErrors.map(e => e.msg).join('\n'));
            req.flash('fieldErrors', JSON.stringify(allErrors));
            res.redirect('/superadmin/cats/create'); // or redirectUrl
            return;
        }

        try {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const catData = { ...req.body };

            if (catData.name) {
                catData.name = catData.name.trim().replace(/\s+/g, ' ');
            }

            if (files?.img?.[0]) {
                const uploadResult = await this.imageService.upload(
                    files.img[0],
                    'uploads/cats/large',
                    'uploads/cats/small',
                    { baseFileName: `${catData.name}-${randomSixDigits()}` }
                );
                catData.img = uploadResult.large;
                catData.img2 = uploadResult.small;
            }

            if (files?.document?.[0]) {
                const fileResult = await this.fileService.upload(
                    files.document[0],
                    'uploads/cats/docs',
                    { baseFileName: `${catData.name}-${randomSixDigits()}` }
                );
                catData.filer = fileResult.path;
            }

            await this.catService.registerCat(catData);
            req.flash('success', 'Category created successfully!');
            res.redirect('/superadmin/cats/view');
        } catch (error: any) {
            let msg = 'Failed to create category. Please try again.';
            if (error.name === 'SequelizeUniqueConstraintError') {
                msg = `"${error.errors[0].value}" already exists. Please use a different name.`;
            } else if (error.message) {
                msg = error.message;
            }
            req.flash('error', msg);
            res.redirect('/superadmin/cats/create');
        }
    })
    ];

    public update = [
        ...validateCatUpdate,
        async (req: Request, res: Response): Promise<void> => {
            const id = Number(req.params?.id || req.body?.id);
            const redirectUrl = `/superadmin/cats/edit/${id}`;

            try {
                if (!id || isNaN(id)) {
                    req.flash('error', 'Invalid ID parameter');
                    res.redirect('/superadmin/cats/view');
                    return;
                }

                const allErrors: { field: string; msg: string }[] = (req as any)._validationErrors || [];
                if (allErrors.length > 0) {
                    req.flash('error', allErrors.map(e => e.msg).join('\n'));
                    req.flash('fieldErrors', JSON.stringify(allErrors));
                    res.redirect(redirectUrl); // or redirectUrl
                    return;
                }

                const files = req.files as { [fieldname: string]: Express.Multer.File[] };
                const updateData = { ...req.body };

                if (updateData.name) {
                    updateData.name = updateData.name.trim().replace(/\s+/g, ' ');
                }

                if (files?.img?.[0]) {
                    const uploadResult = await this.imageService.upload(
                        files.img[0],
                        'uploads/cats/large',
                        'uploads/cats/small',
                        { baseFileName: `${updateData.name}-${randomSixDigits()}` }
                    );
                    updateData.img = uploadResult.large;
                    updateData.img2 = uploadResult.small;
                }

                if (files?.document?.[0]) {
                    const fileResult = await this.fileService.upload(
                        files.document[0],
                        'uploads/cats/docs',
                        { baseFileName: `${updateData.name}-${randomSixDigits()}` }
                    );
                    updateData.filer = fileResult.path;
                }

                await this.catService.modifyCat(id, updateData);
                req.flash('success', 'Category updated successfully!');
                res.redirect('/superadmin/cats/view');
            } catch (error: any) {
                let msg = 'Failed to update category. Please try again.';
                if (error.name === 'SequelizeUniqueConstraintError') {
                    msg = `"${error.errors[0].value}" already exists. Please use a different name.`;
                } else if (error.message) {
                    msg = error.message;
                }
                req.flash('error', msg);
                res.redirect(redirectUrl);
            }
        }
    ];


    // Delete Single
    public destroy = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
        res.status(400).json({ success: false, message: "Invalid ID parameter" });
        return;
        }

        const cat = await this.catService.findCatById(id);
        if (cat) {
        if (cat.img) await this.fileService.remove(cat.img);
        if (cat.img2) await this.fileService.remove(cat.img2);
        if (cat.filer) await this.fileService.remove(cat.filer);
        }

        const success = await this.catService.removeCat(id);
        res.status(200).json({
        success,
        message: success ? "Cat deleted successfully" : "Delete failed"
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
    };


    // Delete Many
    public bulkDestroy = async (req: Request, res: Response): Promise<void> => {
    try {
        const ids: number[] = req.body.ids || [];
        if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ success: false, message: "No IDs provided" });
        return;
        }

        const count = await this.catService.bulkRemoveCats(ids);
        res.status(200).json({ success: true, message: `${count} cats removed` });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
    };

}
