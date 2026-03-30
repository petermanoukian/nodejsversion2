// src/request/superadmin/prod/validateProdUpdate.ts
import { body } from 'express-validator';
import Prod from '@models/Common/Prod.model';
import { Op } from 'sequelize';

const validateProdUpdate = [
  body('name').custom(async (value, { req }) => {
    (req as any)._validationErrors = (req as any)._validationErrors || [];
    const errors: { field: string; msg: string }[] = (req as any)._validationErrors;

    const name = (value || '').trim();
    const catid =
      req.body?.catid ? Number(req.body.catid) :
      req.query?.catid ? Number(req.query.catid) :
      req.params?.catid ? Number(req.params.catid) :
      NaN;

    const subcatid =
      req.body?.subcatid ? Number(req.body.subcatid) :
      req.query?.subcatid ? Number(req.query.subcatid) :
      req.params?.subcatid ? Number(req.params.subcatid) :
      NaN;

    const id =
      req.body?.id ? Number(req.body.id) :
      req.params?.id ? Number(req.params.id) :
      NaN;

    if (!catid || Number.isNaN(catid)) {
      errors.push({ field: 'catid', msg: 'Category ID is required' });
    }
    if (!subcatid || Number.isNaN(subcatid)) {
      errors.push({ field: 'subcatid', msg: 'SubCategory ID is required' });
    }

    if (!name) {
      errors.push({ field: 'name', msg: 'Name is required' });
    } else if (name.length > 255) {
      errors.push({ field: 'name', msg: 'Name must be less than 255 characters' });
    } else if (!Number.isNaN(catid) && !Number.isNaN(subcatid)) {
      try {
        const existing = await Prod.findOne({
          where: {
            name,
            catid,
            subcatid,
            id: { [Op.ne]: id }
          }
        });
        if (existing) {
          errors.push({
            field: 'name',
            msg: 'A product with this name already exists under this category/subcategory.'
          });
        }
      } catch (err: any) {
        console.error('[validateProdUpdate name check failed]', err.message);
      }
    }

    return true;
  }),

  // Optional fields validation
  body('des').optional().isString().withMessage('Description must be a string'),
  body('dess').optional().isString().withMessage('Long description must be a string'),
  body('img').optional().isString().withMessage('Image path must be a string'),
  body('filer').optional().isString().withMessage('File path must be a string'),
];

export default validateProdUpdate;
