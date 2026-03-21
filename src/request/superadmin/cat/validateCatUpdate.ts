import { body } from 'express-validator';
import Cat from '@models/Common/Cat.model';
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

const validateCatUpdate = [
  body('name').custom(async (value, { req }) => {
    (req as any)._validationErrors = (req as any)._validationErrors || [];
    const errors: { field: string; msg: string }[] = (req as any)._validationErrors;
    const name = (value || '').trim();

    if (!name) {
      errors.push({ field: 'name', msg: 'Name is required' });
    } else if (name.length > 255) {
      errors.push({ field: 'name', msg: 'Name must be less than 255 characters' });
    } else {
      try {
        let id: number | undefined;
        if (req.body?.id) id = Number(req.body.id);
        else if (req.params?.id) id = Number(req.params.id);

        if (!id || Number.isNaN(id)) {
          console.warn('[validateCatUpdate] No valid ID found for uniqueness check');
        } else {
          const existing = await Cat.findOne({
            where: { name, id: { [Op.ne]: id } }
          });
          if (existing) {
             errors.push({ field: 'name', msg: 'Name already exists. Please use a different name.' });

          }
        }
      } catch (err: any) {
        console.error('[validateCatUpdate name check failed]', err.message);
      }
    }

    return true;
  }),

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

export default validateCatUpdate;