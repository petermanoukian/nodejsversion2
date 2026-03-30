// src/request/superadmin/prod/validateProd.ts
import { body } from 'express-validator';
import { ProdService } from '@services/actions/Common/ProdService';

const prodService = new ProdService();

const validateProd = [
  // catid required, must be integer
  body('catid')
    .notEmpty().withMessage('Category ID is required')
    .isInt({ gt: 0 }).withMessage('Category ID must be a positive integer'),

  // subcatid required, must be integer
  body('subcatid')
    .notEmpty().withMessage('SubCategory ID is required')
    .isInt({ gt: 0 }).withMessage('SubCategory ID must be a positive integer'),

  // name required, min length 2
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long')
    .custom(async (value, { req }) => {
      const catid = Number(req.body.catid);
      const subcatid = Number(req.body.subcatid);
      if (!catid || !subcatid) return true;

      const existing = await prodService.findProdByFilter({
        filters: { name: value.trim(), catid, subcatid }
      });
      if (existing) {
        throw new Error('A product with this name already exists in the same category/subcategory');
      }
      return true;
    }),

  // des optional
  body('des')
    .optional()
    .isString().withMessage('Description must be a string'),

  // dess optional
  body('dess')
    .optional()
    .isString().withMessage('Long description must be a string'),

  // img optional
  body('img')
    .optional()
    .isString().withMessage('Image path must be a string'),

  // filer optional
  body('filer')
    .optional()
    .isString().withMessage('File path must be a string'),
];

export default validateProd;
