import { body } from 'express-validator';
import Cat from '@models/Common/Cat.model';

const validateCat = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 255 }).withMessage('Name must be less than 255 characters')
    .custom(async (value) => {
      const existing = await Cat.findOne({ where: { name: value } });
      if (existing) {
        throw new Error('Name must be unique');
      }
      return true;
    }),

  body('filer')
    .optional()
    .isString().withMessage('Filer must be a string')
    .isLength({ max: 255 }).withMessage('Filer must be less than 255 characters'),

  body('img')
    .optional()
    .custom((value, { req }) => {
      const file = req.files?.img?.[0];
      if (!file) return true; // nullable
      const allowed = ['image/jpeg','image/jpg','image/gif','image/png','image/tiff','image/webp'];
      if (!allowed.includes(file.mimetype)) {
        throw new Error('Invalid image type. Allowed: jpg, jpeg, gif, png, tiff, webp');
      }
      return true;
    }),

  body('document')
    .optional()
    .custom((value, { req }) => {
      const file = req.files?.document?.[0];
      if (!file) return true; // nullable
      const allowed = [
        'image/jpeg','image/png','image/gif','image/tiff','image/webp',
        'application/pdf',
        'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain','text/html','application/json'
      ];
      if (!allowed.includes(file.mimetype)) {
        throw new Error('Invalid document type. Allowed: images, doc/docx, xls/xlsx, pdf, txt, html, json');
      }
      return true;
    }),
];

export default validateCat;

