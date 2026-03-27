// src/routes/superadmin/subcats.ts
import { Router } from 'express';
import { SubCatController } from '@controllers/SuperAdmin/SubCatController';
import multer from 'multer';

// Use memory storage because ImageUploadService/Sharp needs the buffer
const upload = multer({ storage: multer.memoryStorage() });
const router = Router();
const subCatController = new SubCatController();

// --- Routes ---

// Render the HTML view
router.get('/view', subCatController.view);
router.get('/view/:catid', subCatController.view);

// List SubCats (optionally scoped by catid)
router.get('/list', subCatController.list);
router.get('/list/:catid', subCatController.list);
router.post('/list', subCatController.list);
router.post('/list/:catid', subCatController.list);

// Create form (optionally scoped by catid)
router.get('/create', subCatController.create);
router.get('/create/:catid', subCatController.create);

// --- Dropdown routes ---


router.get('/dropdown/view', subCatController.dropdownView);  // Partial view
router.post('/dropdown/view', subCatController.dropdownView); // Partial view via POST
router.get('/dropdown/view/:id', subCatController.dropdownView);  // Partial view with preselect
router.post('/dropdown/view/:id', subCatController.dropdownView); // Partial view with preselect via POST


router.get('/dropdownjson', subCatController.dropdownJson);   // JSON
router.post('/dropdownjson', subCatController.dropdownJson);  // JSON via POST
router.get('/dropdownjson/:id', subCatController.dropdownJson);   // JSON with preselect
router.post('/dropdownjson/:id', subCatController.dropdownJson);  // JSON with preselect via POST





// Store new SubCat (with optional catid)
router.post('/store', upload.fields([
    { name: 'img', maxCount: 1 },
    { name: 'document', maxCount: 1 }
]), subCatController.store);

// --- Name checks ---
// No change: global check
router.get('/check-name', subCatController.checkName);
router.post('/check-name', subCatController.checkName);

// Explicit create check (no id, but catid may be passed in query/body)
router.get('/check-name-update', subCatController.checkNameForUpdate);
router.post('/check-name-update', subCatController.checkNameForUpdate);

// Explicit update check (with id AND catid)
router.get('/check-name-update/:catid/:id', subCatController.checkNameForUpdate);
router.post('/check-name-update/:catid/:id', subCatController.checkNameForUpdate);

// --- Retrieval & mutation ---
router.get('/show/:id', subCatController.show);
router.get('/edit/:id', subCatController.edit);

// --- Update ---
router.post(
  '/update/:id',
  upload.fields([
    { name: 'img', maxCount: 1 },
    { name: 'document', maxCount: 1 }
  ]),
  subCatController.update
);

// --- Delete (single) ---
router.get('/delete/:id', subCatController.destroy);
router.post('/delete/:id', subCatController.destroy);
router.delete('/delete/:id', subCatController.destroy);

// --- Bulk Delete ---
router.post('/delete-all', subCatController.bulkDestroy);


export default router;
