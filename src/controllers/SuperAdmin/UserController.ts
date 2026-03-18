import { Request, Response } from 'express';
import { UserService } from '@services/actions/SuperAdmin/UserService';

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    // 7-Rule: GET Many / Search / Paginated
    public list = async (req: Request, res: Response): Promise<void> => {
        try {
            const options = {
                page: req.query.page ? parseInt(req.query.page as string) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
                filters: req.body.filters || {},
                orderBy: req.query.orderBy as string,
                orderDir: req.query.orderDir as 'ASC' | 'DESC',
                search: req.query.search as string,
                searchFields: req.body.searchFields, // Passed in body to keep URL clean
                useAnd: req.body.useAnd === true,
                related: req.body.related,
                fields: req.body.fields
            };

            const result = options.page 
                ? await this.userService.fetchPaginatedUsers(options)
                : { rows: await this.userService.fetchAllUsers(options), count: 0 };

            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    // 2-Rule: GET Single by ID
    public show = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const options = {
                related: req.body.related,
                fields: req.body.fields
            };
            const user = await this.userService.findUserById(id, options);
            if (!user) {
                res.status(404).json({ success: false, message: "User not found" });
                return;
            }
            res.status(200).json({ success: true, data: user });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    // ACTION: Store (Register)
    public store = async (req: Request, res: Response): Promise<void> => {
        try {
            const newUser = await this.userService.registerUser(req.body);
            res.status(201).json({ success: true, data: newUser });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    // ACTION: Update
    public update = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const updatedUser = await this.userService.modifyUser(id, req.body);
            res.status(200).json({ success: true, data: updatedUser });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    // ACTION: Delete Single
    public destroy = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const success = await this.userService.removeUser(id);
            res.status(200).json({ success, message: success ? "User deleted" : "Delete failed" });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    // ACTION: Delete Many
    public bulkDestroy = async (req: Request, res: Response): Promise<void> => {
        try {
            const count = await this.userService.bulkRemoveUsers(req.body.filters);
            res.status(200).json({ success: true, message: `${count} users removed` });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
}