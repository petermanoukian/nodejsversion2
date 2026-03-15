import { Request, Response } from 'express';
import { DashboardService } from '../../services/actions/SuperAdmin/DashboardService';

export class DashboardController {
    private dashboardService: DashboardService;

    constructor() {
        this.dashboardService = new DashboardService();
    }
    public index = (req: Request, res: Response): void => {
        try {
            // Get the user exactly as it was set in the middleware
            const user = (req as any).user;

            if (!user) {
                return res.redirect('/login');
            }

            // Send the fucken user
            return res.render('superadmin/index', {
                layout: 'superadmin/layout/main', // Points to the file we just made
                user,
                title: 'High Command'
            });

        } catch (error) {
            return res.redirect('/login');
        }
    };
}