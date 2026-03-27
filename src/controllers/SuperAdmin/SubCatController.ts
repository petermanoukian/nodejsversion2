import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { CatService } from '@services/actions/Common/CatService';
import { SubCatService } from '@services/actions/Common/SubCatService';
import { ImageUploadService } from '@services/actions/Common/ImageUploadService';
import { FileUploadService } from '@services/actions/Common/FileUploadService';

import validateSubCat from '@request/superadmin/subcat/validateSubCat';
import validateSubCatUpdate from '@request/superadmin/subcat/validateSubCatUpdate';
import { randomSixDigits } from '@utils/random';
import asyncHandler from 'express-async-handler';
import { Op } from 'sequelize';
import Cat from '@models/Common/Cat.model';




export class SubCatController {
    private subCatService: SubCatService;
    private catService: CatService;
    private imageService: ImageUploadService;
    private fileService: FileUploadService;

    constructor() {
        this.subCatService = new SubCatService();
        this.catService = new CatService();
        this.imageService = new ImageUploadService();
        this.fileService = new FileUploadService();
    }

    // --- Render view ---


    public view = async (req: Request, res: Response): Promise<void> => {
        try {
            const rawCatid = req.params.catid || req.query.catid || req.body?.catid;
            const catid = rawCatid ? Number(rawCatid) : '';

            // super light: only IDs
            const options = {
            filters: catid ? { catid } : {},
            fields: ['id'],   // <-- only fetch IDs
            };

            const subcats = await this.subCatService.fetchAllSubCats(options);

            const catOptions = {
            orderBy: 'name',
            orderDir: 'ASC',
            fields: ['id', 'name'], // keep it light, just id + name
            };
            const categories = await this.catService.fetchAllCats(catOptions);

            res.render('superadmin/subcats/index', {
            catid,
            rowCount: subcats.length,
            categories,
            });
        } catch (error: any) {
            res.status(500).send(error.message);
        }
    };


    // --- List (AJAX) ---
    public list = async (req: Request, res: Response): Promise<void> => {
        try {
            const rawCatid = req.params.catid || req.query.catid || req.body?.catid;
            const catid = rawCatid ? Number(rawCatid) : '';

            const options = {
            page: req.body.page ? Number(req.body.page) : 1,
            limit: req.body.limit ? Number(req.body.limit) : 5,
            filters: catid ? { ...(req.body.filters || {}), catid } : req.body.filters || {},
            orderBy: req.body.orderBy || 'id',
            orderDir: req.body.orderDir || 'DESC',
            search: req.body.search,
            searchFields: req.body.searchFields || ['name', '$Cat.name$'],
            useAnd: req.body.useAnd === true,
            related: [{ model: Cat, attributes: ['id', 'name'] }],
            fields: req.body.fields
            };

            const result = await this.subCatService.fetchPaginatedSubCats(options);

            res.status(200).json({
            success: true,
            data: result,
            catid,
            
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };


    // --- Create form ---

    public create = async (req: Request, res: Response): Promise<void> => {
    try {
        const rawCatid = req.params.catid || req.query.catid || req.body?.catid;

        const catid = rawCatid ? Number(rawCatid) : '';

        res.render('superadmin/subcats/create', {  
        catid,
        success: [],       // ✅ defined
        error: [],         // ✅ defined
        fieldErrors: []    // ✅ defined
        });
    } catch (error: any) {
            console.error('Create form error:', error);  // 👈 add this
            res.status(500).send(`Error: ${error.message}`);  // 👈 show in browser too
        }
    };




    // --- Dropdown JSON ---
    public dropdownJson = async (req: Request, res: Response): Promise<void> => {
        try {
            const catid = req.body.catid
                ? Number(req.body.catid)
                : req.query.catid
                ? Number(req.query.catid)
                : null;

            if (!catid || isNaN(catid)) {
                res.json({ subcats: [], preselectId: null, catid: null });
                return;
            }

            const preselectId = req.params.id
                ? Number(req.params.id)
                : req.body.id
                ? Number(req.body.id)
                : req.query.id
                ? Number(req.query.id)
                : null;

            const subcats = await this.subCatService.fetchSubCatsByCatId(catid, {
                orderBy: 'name',
                orderDir: 'ASC',
                fields: ['id', 'name', 'catid']
            });

            res.json({ subcats, preselectId, catid });
        } catch (error: any) {
            res.status(500).send('Error loading subcats dropdown JSON');
        }
    };

    // --- Dropdown View ---
    public dropdownView = async (req: Request, res: Response): Promise<void> => {
        try {
            const catid = req.body.catid
                ? Number(req.body.catid)
                : req.query.catid
                ? Number(req.query.catid)
                : null;

            if (!catid || isNaN(catid)) {
                res.render('partials/subcats/dropdown', {
                    title: 'Select SubCat',
                    subcats: [],
                    preselectId: null,
                    catid: null
                });
                return;
            }

            const preselectId = req.params.id
                ? Number(req.params.id)
                : req.body.id
                ? Number(req.body.id)
                : req.query.id
                ? Number(req.query.id)
                : null;

            const subcats = await this.subCatService.fetchSubCatsByCatId(catid, {
                orderBy: 'name',
                orderDir: 'ASC',
                fields: ['id', 'name', 'catid']
            });

            res.render('partials/subcats/dropdown', {
                title: 'Select SubCat',
                subcats,
                preselectId,
                catid
            });
        } catch (error: any) {
            res.status(500).send('Error loading subcats dropdown view');
        }
    };




    // --- Store ---
    public store = [
        ...validateSubCat,
        asyncHandler(async (req: Request, res: Response): Promise<void> => {
            const allErrors: { field: string; msg: string }[] = (req as any)._validationErrors || [];
            if (allErrors.length > 0) {
                req.flash('error', allErrors.map(e => e.msg).join('\n'));
                req.flash('fieldErrors', JSON.stringify(allErrors));
                res.redirect('/superadmin/subcats/create');
                return;
            }

            try {
                const files = req.files as { [fieldname: string]: Express.Multer.File[] };
                const subcatData = { ...req.body };

                if (subcatData.name) {
                    subcatData.name = subcatData.name.trim().replace(/\s+/g, ' ');
                }

                if (files?.img?.[0]) {
                    const uploadResult = await this.imageService.upload(
                        files.img[0],
                        'uploads/subcats/large',
                        'uploads/subcats/small',
                        { baseFileName: `${subcatData.name}-${randomSixDigits()}` }
                    );
                    subcatData.img = uploadResult.large;
                    subcatData.img2 = uploadResult.small;
                }

                if (files?.document?.[0]) {
                    const fileResult = await this.fileService.upload(
                        files.document[0],
                        'uploads/subcats/docs',
                        { baseFileName: `${subcatData.name}-${randomSixDigits()}` }
                    );
                    subcatData.filer = fileResult.path;
                }

                await this.subCatService.registerSubCat(subcatData);
                req.flash('success', 'SubCategory created successfully!');
                res.redirect('/superadmin/subcats/view');
            } catch (error: any) {
                req.flash('error', error.message || 'Failed to create subcategory.');
                res.redirect('/superadmin/subcats/create');
            }
        })
    ];


    // --- Update ---
    public update = [
    ...validateSubCatUpdate,
    async (req: Request, res: Response): Promise<void> => {
        const id = Number(req.params.id);
        const redirectUrl = `/superadmin/subcats/edit/${id}`;

        try {
        if (!id || isNaN(id)) {
            req.flash('error', 'Invalid ID parameter');
            res.redirect('/superadmin/subcats/view');
            return;
        }

        const allErrors: { field: string; msg: string }[] = (req as any)._validationErrors || [];
        if (allErrors.length > 0) {
            req.flash('error', allErrors.map(e => e.msg).join('\n'));
            req.flash('fieldErrors', JSON.stringify(allErrors));
            res.redirect(redirectUrl);
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
            'uploads/subcats/large',
            'uploads/subcats/small',
            { baseFileName: `${updateData.name}-${randomSixDigits()}` }
            );
            updateData.img = uploadResult.large;
            updateData.img2 = uploadResult.small;
        }

        if (files?.document?.[0]) {
            const fileResult = await this.fileService.upload(
            files.document[0],
            'uploads/subcats/docs',
            { baseFileName: `${updateData.name}-${randomSixDigits()}` }
            );
            updateData.filer = fileResult.path;
        }

        await this.subCatService.modifySubCat(id, updateData);
        req.flash('success', 'SubCategory updated successfully!');
        res.redirect('/superadmin/subcats/view');
        } catch (error: any) {
        req.flash('error', error.message || 'Failed to update subcategory.');
        res.redirect(redirectUrl);
        }
    }
    ];



    // --- Show ---
    public show = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = Number(req.params.id || req.query.id || req.body.id);
            const catid = Number(req.params.catid || req.query.catid || req.body.catid);

            if (!id || isNaN(id) || !catid || isNaN(catid)) {
                res.status(400).json({ success: false, message: "Invalid ID or CatID parameter" });
                return;
            }

            const subcat = await this.subCatService.findSubCatById(id);
            if (!subcat || subcat.catid !== catid) {
                res.status(404).json({ success: false, message: "SubCat not found" });
                return;
            }

            res.status(200).json({ success: true, data: subcat });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    // --- Edit form ---
    public edit = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);

        if (!id || isNaN(id)) {
        res.status(400).send('Invalid SubCat ID parameter');
        return;
        }

        const subcat = await this.subCatService.findSubCatById(id);
        if (!subcat) {
        res.status(404).send('SubCat not found');
        return;
        }

        res.render('superadmin/subcats/edit', {
        title: 'Edit SubCat',
        subcat,
        success: '',
        error: '',
        fieldErrors: []
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).send('Error loading edit form');
    }
    };


    // --- Check name (create) ---
    public checkName = async (req: Request, res: Response): Promise<void> => {
        try {
            const namex = (req.body.name || req.query.name || '').trim();
            const catid = Number(req.params.catid || req.query.catid || req.body.catid);

            if (!namex || namex.length < 2 || !catid || isNaN(catid)) {
                res.json({ exists: false });
                return;
            }

            const subcat = await this.subCatService.findSubCatByFilter({
                filters: { name: namex, catid }
            });

            res.json({ exists: !!subcat });
        } catch (error: any) {
            res.status(500).json({ error: 'Error checking subcat name.' });
        }
    };

    // --- Check name for update ---
    public checkNameForUpdate = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = Number(req.params.id || req.query.id || req.body.id);
            const catid = Number(req.params.catid || req.query.catid || req.body.catid);
            const namex = (req.body.name || req.query.name || '').trim();

            if (!namex || namex.length < 2 || !catid || isNaN(catid)) {
                res.json({ exists: false });
                return;
            }

            const subcat = await this.subCatService.findSubCatByFilter({
                filters: {
                    name: namex,
                    catid,
                    ...(id && !isNaN(id) ? { id: { [Op.ne]: id } } : {})
                }
            });

            res.json({ exists: !!subcat });
        } catch (error: any) {
            res.status(500).json({ error: 'Error checking subcat name for update.' });
        }
    };




    public destroy = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        if (!id || isNaN(id)) {
        res.status(400).json({ success: false, message: "Invalid ID parameter" });
        return;
        }

        const success = await this.subCatService.removeSubCat(id);
        res.status(200).json({
        success,
        message: success ? "SubCat deleted successfully" : "Delete failed"
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
    };

    public bulkDestroy = async (req: Request, res: Response): Promise<void> => {
    try {
        const ids: number[] = req.body.ids || [];
        if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ success: false, message: "No IDs provided" });
        return;
        }

        const count = await this.subCatService.bulkRemoveSubCats(ids);
        res.status(200).json({ success: true, message: `${count} subcats removed` });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
    };




}
