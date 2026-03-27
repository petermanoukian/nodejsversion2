import { Router } from 'express';
import { CatController } from '@controllers/SuperAdmin/CatController';
import multer from 'multer';

// Use memory storage because ImageUploadService/Sharp needs the buffer
const upload = multer({ storage: multer.memoryStorage() });
const router = Router();
const catController = new CatController();

// Named route constants (explicit paths)

// Routes
router.get('/view', catController.view);   // render the HTML view
router.get('/list', catController.list);   // JSON data via query params
router.post('/list', catController.list);  // optional POST for filters

router.get('/dropdownjson', catController.dropdownJson);   // JSON
router.post('/dropdownjson', catController.dropdownJson);  // JSON via POST
router.get('/dropdownjson/:id', catController.dropdownJson);   // JSON with preselect
router.post('/dropdownjson/:id', catController.dropdownJson);  // JSON with preselect via POST


router.get('/dropdown/view', catController.dropdownView);   // Partial view
router.post('/dropdown/view', catController.dropdownView);  // Partial view via POST
router.get('/dropdown/view/:id', catController.dropdownView);   // Partial view with preselect
router.post('/dropdown/view/:id', catController.dropdownView);  // Partial view with preselect via POST


router.get('/create', catController.create);
router.post('/store', upload.fields([
    { name: 'img', maxCount: 1 }, 
    { name: 'document', maxCount: 1 }
]), catController.store);


router.get('/check-name', catController.checkName);
router.post('/check-name', catController.checkName);

// Explicit create check (no id)
router.get('/check-name-update', catController.checkNameForUpdate);
router.post('/check-name-update', catController.checkNameForUpdate);

// Explicit update check (with id)
router.get('/check-name-update/:id', catController.checkNameForUpdate);
router.post('/check-name-update/:id', catController.checkNameForUpdate);

router.get('/show/:id', catController.show);
router.get('/edit/:id', catController.edit);

router.post('/update/:id', upload.fields([
    { name: 'img', maxCount: 1 },
    { name: 'document', maxCount: 1 }
]), catController.update);

// GET (legacy / quick link delete)
router.get('/delete/:id', catController.destroy);

// POST (if you want to delete via a form submission)
router.post('/delete/:id', catController.destroy);

// DELETE (the REST‑correct way for AJAX / fetch)
router.delete('/delete/:id', catController.destroy);

router.post('/delete-all', catController.bulkDestroy);

export default router;
