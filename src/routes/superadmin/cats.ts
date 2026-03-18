import { Router } from 'express';
import { CatController } from '../../controllers/SuperAdmin/CatController';
import multer from 'multer';

// Use memory storage because ImageUploadService/Sharp needs the buffer
const upload = multer({ storage: multer.memoryStorage() });
const router = Router();
const catController = new CatController();

// Named route constants (explicit paths)

// Routes
router.get('/view', catController.list);

router.get('/create', catController.create);
router.post('/store', upload.fields([
    { name: 'img', maxCount: 1 }, 
    { name: 'document', maxCount: 1 }
]), catController.store);


router.get('/check-name', catController.checkName);
router.post('/check-name', catController.checkName);

router.get('/show/:id', catController.show);
router.get('/edit/:id', catController.edit);

router.post('/update/:id', upload.fields([
    { name: 'img', maxCount: 1 },
    { name: 'document', maxCount: 1 }
]), catController.update);

router.get('/delete/:id', catController.destroy);
router.post('/delete-all', catController.bulkDestroy);

export default router;
