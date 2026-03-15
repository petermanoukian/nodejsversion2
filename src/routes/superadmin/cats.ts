import { Router } from 'express';
import { CatController } from '../../controllers/SuperAdmin/CatController';
import multer from 'multer';

// Use memory storage because ImageUploadService/Sharp needs the buffer
const upload = multer({ storage: multer.memoryStorage() });
const router = Router();
const catController = new CatController();

// 7-Rule: List all cats
router.get('/', catController.list);

// Store (Process Form)
// We use .fields() to handle 'img' and potential 'document'
router.post('/store', upload.fields([
    { name: 'img', maxCount: 1 }, 
    { name: 'document', maxCount: 1 }
]), catController.store);

// 2-Rule: GET Single by ID
router.get('/show/:id', catController.show);

// Update (Process Form)
router.post('/update/:id', upload.fields([
    { name: 'img', maxCount: 1 },
    { name: 'document', maxCount: 1 }
]), catController.update);

// Delete Single
router.get('/delete/:id', catController.destroy);

// Delete All (Mass Action)
router.post('/delete-all', catController.bulkDestroy);

export default router;