import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { CatService } from '@services/actions/Common/CatService';
import { SubCatService } from '@services/actions/Common/SubCatService';
import { ProdService } from '@services/actions/Common/ProdService';
import { ImageUploadService } from '@services/actions/Common/ImageUploadService';
import { FileUploadService } from '@services/actions/Common/FileUploadService';

import validateProd from '@request/superadmin/prod/validateProd';
import validateProdUpdate from '@request/superadmin/prod/validateProdUpdate'; 

import { randomSixDigits } from '@utils/random';
import asyncHandler from 'express-async-handler';
import { Op } from 'sequelize';
import Cat from '@models/Common/Cat.model';
import SubCat from '@models/Common/SubCat.model';

export class ProdController {
  private prodService: ProdService;
  private catService: CatService;
  private subCatService: SubCatService;
  private imageService: ImageUploadService;
  private fileService: FileUploadService;

  constructor() {
    this.prodService = new ProdService();
    this.catService = new CatService();
    this.subCatService = new SubCatService();
    this.imageService = new ImageUploadService();
    this.fileService = new FileUploadService();
  }



    // --- Render view ---
    public view = async (req: Request, res: Response): Promise<void> => {
        try {
            const rawCatid = req.params.catid || req.query.catid || req.body?.catid;
            const rawSubcatid = req.params.subcatid || req.query.subcatid || req.body?.subcatid;

            const catid = rawCatid ? Number(rawCatid) : '';
            const subcatid = rawSubcatid ? Number(rawSubcatid) : '';

            // super light: only IDs
            const options = {
            filters: {
                ...(catid ? { catid } : {}),
                ...(subcatid ? { subcatid } : {})
            },
            fields: ['id']   // <-- only fetch IDs
            };

            const prods = await this.prodService.fetchAllProds(options);

            // fetch categories (id + name)
            const catOptions = {
            orderBy: 'name',
            orderDir: 'ASC',
            fields: ['id', 'name']
            };
            const categories = await this.catService.fetchAllCats(catOptions);

            /*
            // fetch subcategories (id + name)
            const subcatOptions = {
            orderBy: 'name',
            orderDir: 'ASC',
            fields: ['id', 'name']
            };
            const subcategories = await this.subCatService.fetchAllSubCats(subcatOptions);
            */
            res.render('superadmin/prods/index', {
            catid,
            subcatid,
            rowCount: prods.length,
            categories
            });
        } catch (error: any) {
            res.status(500).send(error.message);
        }
    };



  // --- List (AJAX) ---
    public list = async (req: Request, res: Response): Promise<void> => {
        try {
        const catid = Number(req.body.catid || req.query.catid);
        const subcatid = Number(req.body.subcatid || req.query.subcatid);

        const options = {
            page: req.body.page ? Number(req.body.page) : 1,
            limit: req.body.limit ? Number(req.body.limit) : 10,
            filters: { ...(req.body.filters || {}), ...(catid ? { catid } : {}), ...(subcatid ? { subcatid } : {}) },
            orderBy: req.body.orderBy || 'id',
            orderDir: req.body.orderDir || 'DESC',
            search: req.body.search,
            searchFields: req.body.searchFields || ['name', 'des', 'dess', '$Cat.name$', '$SubCat.name$'],
            related: [
            { model: Cat, as: 'Cat', attributes: ['id', 'name'] },
            { model: SubCat, as: 'SubCat', attributes: ['id', 'name'] }
            ]
        };

        const result = await this.prodService.fetchPaginatedProds(options);
        res.status(200).json({ success: true, data: result });
        } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
        }
    };

    // --- Create form ---
    public create = async (req: Request, res: Response): Promise<void> => {
        try {
            const rawCatid = req.params.catid || req.query.catid || req.body?.catid;
            const rawSubcatid = req.params.subcatid || req.query.subcatid || req.body?.subcatid;

            const catid = rawCatid ? Number(rawCatid) : '';
            const subcatid = rawSubcatid ? Number(rawSubcatid) : '';

            res.render('superadmin/prods/create', {
            catid,
            subcatid,
            success: [],       // ✅ defined
            error: [],         // ✅ defined
            fieldErrors: []    // ✅ defined
            });
        } catch (error: any) {
            console.error('Create form error:', error);  // 👈 log server-side
            res.status(500).send(`Error: ${error.message}`);  // 👈 show in browser too
        }
    };

    // --- Show ---
    public show = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id || req.query.id || req.body.id);

        if (!id || isNaN(id)) {
        res.status(400).json({ success: false, message: "Invalid ID parameter" });
        return;
        }

        const prod = await this.prodService.findProdById(id);
        if (!prod) {
        res.status(404).json({ success: false, message: "Product not found" });
        return;
        }

        res.status(200).json({ success: true, data: prod });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
    };


    // --- Edit form ---
    public edit = async (req: Request, res: Response): Promise<void> => {
    try {
    
            const raw = req.params.id;
            const id = Number(raw);
    
           
            const prod = await this.prodService.findProdById(id);
            if (!prod) {
            res.status(404).send('Product not found');
            return;
            }

            res.render('superadmin/prods/edit', {
            title: 'Edit Product',
            prod,
            success: '',
            error: '',
            fieldErrors: []
            });
    } catch (error: any) {
        console.error(error);
        res.status(500).send('Error loading edit form');
    }
    };


    public store = [
    ...validateProd,
    asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const errors: { field: string; msg: string }[] = (req as any)._validationErrors || [];
      if (errors.length > 0) {
        req.flash('error', errors.map(e => e.msg).join('\n'));
        req.flash('fieldErrors', JSON.stringify(errors));
        res.redirect('/superadmin/prods/create');
        return;
      }

      try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const prodData = { ...req.body };
        console.log(req.body);
        console.log(prodData);

        // normalize strings
        ['name', 'des', 'dess'].forEach(f => {
          if (prodData[f]) prodData[f] = prodData[f].trim().replace(/\s+/g, ' ');
        });
        console.log(prodData);
        if (files?.img?.[0]) {
          const uploadResult = await this.imageService.upload(
            files.img[0],
            'uploads/prods/large',
            'uploads/prods/small',
            { baseFileName: `${prodData.name}-${randomSixDigits()}` }
          );
          prodData.img = uploadResult.large;
          prodData.img2 = uploadResult.small;
        }

        if (files?.document?.[0]) {
          const fileResult = await this.fileService.upload(
            files.document[0],
            'uploads/prods/docs',
            { baseFileName: `${prodData.name}-${randomSixDigits()}` }
          );
          prodData.filer = fileResult.path;
        }

        await this.prodService.registerProd(prodData);
        req.flash('success', 'Product created successfully!');
        res.redirect('/superadmin/prods/view');
      } catch (error: any) {
        req.flash('error', error.message || 'Failed to create product.');
        res.redirect('/superadmin/prods/create');
      }
    })
    ];

  // --- Update ---
    public update = [
        ...validateProdUpdate,
        async (req: Request, res: Response): Promise<void> => {
        const id = Number(req.params.id);
        const redirectUrl = `/superadmin/prods/edit/${id}`;
        try {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const updateData = { ...req.body };

            ['name', 'des', 'dess'].forEach(f => {
            if (updateData[f]) updateData[f] = updateData[f].trim().replace(/\s+/g, ' ');
            });

            if (files?.img?.[0]) {
            const uploadResult = await this.imageService.upload(
                files.img[0],
                'uploads/prods/large',
                'uploads/prods/small',
                { baseFileName: `${updateData.name}-${randomSixDigits()}` }
            );
            updateData.img = uploadResult.large;
            updateData.img2 = uploadResult.small;
            }

            if (files?.document?.[0]) {
            const fileResult = await this.fileService.upload(
                files.document[0],
                'uploads/prods/docs',
                { baseFileName: `${updateData.name}-${randomSixDigits()}` }
            );
            updateData.filer = fileResult.path;
            }

            await this.prodService.modifyProd(id, updateData);
            req.flash('success', 'Product updated successfully!');
            res.redirect('/superadmin/prods/view');
        } catch (error: any) {
            req.flash('error', error.message || 'Failed to update product.');
            res.redirect(redirectUrl);
        }
        }
    ];

    // --- Check name (create) ---
    public checkName = async (req: Request, res: Response): Promise<void> => {
        try {
            const namex = (req.body.name || req.query.name || '').trim();
            const catid = Number(req.params.catid || req.query.catid || req.body.catid);
            const subcatid = Number(req.params.subcatid || req.query.subcatid || req.body.subcatid);

            if (!namex || namex.length < 2 || !catid || isNaN(catid) || !subcatid || isNaN(subcatid)) {
            res.json({ exists: false });
            return;
            }

            const prod = await this.prodService.findProdByFilter({
            filters: { name: namex, catid, subcatid }
            });

            res.json({ exists: !!prod });
        } catch (error: any) {
            res.status(500).json({ error: 'Error checking product name.' });
        }
    };

    // --- Check name for update ---
    public checkNameForUpdate = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = Number(req.params.id || req.query.id || req.body.id);
            const catid = Number(req.params.catid || req.query.catid || req.body.catid);
            const subcatid = Number(req.params.subcatid || req.query.subcatid || req.body.subcatid);
            const namex = (req.body.name || req.query.name || '').trim();

            if (!namex || namex.length < 2 || !catid || isNaN(catid) || !subcatid || isNaN(subcatid)) {
            res.json({ exists: false });
            return;
            }

            const prod = await this.prodService.findProdByFilter({
            filters: {
                name: namex,
                catid,
                subcatid,
                ...(id && !isNaN(id) ? { id: { [Op.ne]: id } } : {})
            }
            });

            res.json({ exists: !!prod });
        } catch (error: any) {
            res.status(500).json({ error: 'Error checking product name for update.' });
        }
    };


    // --- Destroy ---
    public destroy = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = Number(req.params.id);
            if (!id || isNaN(id)) {
            res.status(400).json({ success: false, message: "Invalid ID parameter" });
            return;
            }

            const success = await this.prodService.removeProd(id);
            res.status(200).json({
            success,
            message: success ? "Product deleted successfully" : "Delete failed"
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    // --- Bulk destroy ---
    public bulkDestroy = async (req: Request, res: Response): Promise<void> => {
        try {
            const ids: number[] = req.body.ids || [];
            if (!Array.isArray(ids) || ids.length === 0) {
            res.status(400).json({ success: false, message: "No IDs provided" });
            return;
            }

            const count = await this.prodService.bulkRemoveProds(ids);
            res.status(200).json({ success: true, message: `${count} products removed` });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };







}
