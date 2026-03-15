import { Router } from 'express';
import { DashboardController } from '../../controllers/SuperAdmin/DashboardController';
import { isSuperAdmin } from '../../middleware/SuperAdminMiddleware';

// ✅ Import your cats route
import catsRouter from './cats';

const router = Router();
const dashboardController = new DashboardController();

// 1. All routes here are locked behind the Level 1 check
router.use(isSuperAdmin);

/**
 * Entry Point: GET /superadmin/dashboard
 */
router.get('/dashboard', dashboardController.index);

/**
 * Cats routes: all locked behind isSuperAdmin
 * Example: GET /superadmin/cats
 */
router.use('/cats', catsRouter);

export default router;
