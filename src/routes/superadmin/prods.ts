// src/routes/superadmin/prods.ts
import { Router } from 'express';
import { ProdController } from '@controllers/SuperAdmin/ProdController';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();
const prodController = new ProdController();

// --- Routes ---

// Render the HTML view
router.get('/view', prodController.view);
router.get('/view/:catid', prodController.view);
router.get('/view/:catid/:subcatid', prodController.view);

// List Products (optionally scoped by catid/subcatid)
router.get('/list', prodController.list);
router.get('/list/:catid', prodController.list);
router.get('/list/:catid/:subcatid', prodController.list);
router.post('/list', prodController.list);

// Create form
router.get('/create', prodController.create);
router.get('/create/:catid', prodController.create);
router.get('/create/:catid/:subcatid', prodController.create);

// Store new Product
router.post(
  '/store',
  upload.fields([
    { name: 'img', maxCount: 1 },
    { name: 'document', maxCount: 1 }
  ]),
  prodController.store
);

// --- Name checks ---
router.get('/check-name', prodController.checkName);
router.post('/check-name', prodController.checkName);

router.get('/check-name-update', prodController.checkNameForUpdate);
router.post('/check-name-update', prodController.checkNameForUpdate);



// --- Retrieval & mutation ---
router.get('/show/:id', prodController.show);
router.get('/edit/:id', prodController.edit);

// --- Update ---
router.post(
  '/update/:id',
  upload.fields([
    { name: 'img', maxCount: 1 },
    { name: 'document', maxCount: 1 }
  ]),
  prodController.update
);

// --- Delete (single) ---
router.get('/delete/:id', prodController.destroy);
router.post('/delete/:id', prodController.destroy);
router.delete('/delete/:id', prodController.destroy);

// --- Bulk Delete ---
router.post('/delete-all', prodController.bulkDestroy);

export default router;
