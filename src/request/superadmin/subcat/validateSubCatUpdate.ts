// src/request/superadmin/subcat/validateSubCatUpdate.ts
import { body } from 'express-validator';
import SubCat from '@models/Common/SubCat.model';
import path from 'path';
import { Op } from 'sequelize';

// same allowed mimetypes/extensions as above...

const validateSubCatUpdate = [
  body('name').custom(async (value, { req }) => {
    (req as any)._validationErrors = (req as any)._validationErrors || [];
    const errors: { field: string; msg: string }[] = (req as any)._validationErrors;

    const name = (value || '').trim();
    const catid =
      req.body?.catid ? Number(req.body.catid) :
      req.query?.catid ? Number(req.query.catid) :
      req.params?.catid ? Number(req.params.catid) :
      NaN;

    const id =
      req.body?.id ? Number(req.body.id) :
      req.params?.id ? Number(req.params.id) :
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
        const existing = await SubCat.findOne({
          where: {
            name,
            catid,
            id: { [Op.ne]: id }
          }
        });
        if (existing) {
          errors.push({ field: 'name', msg: 'Name already exists under this Cat. Please use a different name.' });
        }
      } catch (err: any) {
        console.error('[validateSubCatUpdate name check failed]', err.message);
      }
    }

    return true;
  }),

  // same file validation as above...
];

export default validateSubCatUpdate;
