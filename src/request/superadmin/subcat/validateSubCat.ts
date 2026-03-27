// src/request/superadmin/subcat/validateSubCat.ts
import { body } from 'express-validator';
import SubCat from '@models/Common/SubCat.model';
import path from 'path';
import { Op } from 'sequelize';

const allowedImgMimetypes = [
  'image/jpeg', 'image/jpg', 'image/gif',
  'image/png', 'image/tiff', 'image/webp',
];

const allowedDocMimetypes = [
  'image/jpeg', 'image/png', 'image/gif', 'image/tiff', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/html', 'application/json',
];

const allowedDocExtensions = [
  '.jpg', '.jpeg', '.png', '.gif', '.tiff', '.webp',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.txt', '.html', '.json',
];

const validateSubCat = [
  // --- Name + CatID uniqueness ---
  body('name').custom(async (value, { req }) => {
    (req as any)._validationErrors = (req as any)._validationErrors || [];
    const errors: { field: string; msg: string }[] = (req as any)._validationErrors;

    const name = (value || '').trim();
    const catid =
      req.body?.catid ? Number(req.body.catid) :
      req.query?.catid ? Number(req.query.catid) :
      req.params?.catid ? Number(req.params.catid) :
      NaN;

    if (!catid || Number.isNaN(catid)) {
      errors.push({ field: 'catid', msg: 'Cat ID is required' });
    }

    if (!name) {
      errors.push({ field: 'name', msg: 'Name is required' });
    } else if (name.length > 255) {
      errors.push({ field: 'name', msg: 'Name must be less than 255 characters' });
    } else if (!Number.isNaN(catid)) {
      try {
        const existing = await SubCat.findOne({ where: { name, catid } });
        if (existing) {
          errors.push({ field: 'name', msg: 'Name already exists under this Category. Please use a different name.' });
        }
      } catch (err: any) {
        console.error('[validateSubCat name check failed]', err.message);
      }
    }

    return true;
  }),

  // --- File validation ---
  body('_files').custom((value, { req }) => {
    (req as any)._validationErrors = (req as any)._validationErrors || [];
    const errors: { field: string; msg: string }[] = (req as any)._validationErrors;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    const imgFile = files?.img?.[0];
    if (imgFile && !allowedImgMimetypes.includes(imgFile.mimetype)) {
      errors.push({ field: 'img', msg: 'Invalid image format. Allowed: jpg, jpeg, gif, png, tiff, webp' });
    }

    const docFile = files?.document?.[0];
    if (docFile) {
      const ext = path.extname(docFile.originalname).toLowerCase();
      if (!allowedDocMimetypes.includes(docFile.mimetype) || !allowedDocExtensions.includes(ext)) {
        errors.push({ field: 'document', msg: 'Invalid document format. Allowed: images, pdf, doc/docx, xls/xlsx, txt, html, json' });
      }
    }

    return true;
  }),
];

export default validateSubCat;
