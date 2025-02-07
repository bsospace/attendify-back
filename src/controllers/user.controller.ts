import { Request, Response } from "express";
import { UserService } from "../services/user.service";

export class UserController {
    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;

        this.getAllUsers = this.getAllUsers.bind(this);
    }

    public async getAllUsers(req: Request, res: Response): Promise<any> {
        try {
            // Extract query parameters
            const page = req.query.page ? parseInt(req.query.page as string) : undefined;
            const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined;
            const search = req.query.search ? String(req.query.search) : undefined;
            const logs = req.query.logs === "true"; // Convert logs to boolean

            // Validate numeric parameters
            if ((page !== undefined && isNaN(page)) || (pageSize !== undefined && isNaN(pageSize))) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid pagination parameters",
                });
            }

            // Call service method
            const { users, totalCount } = await this.userService.getAllUsers(page, pageSize, search, logs);

            return res.status(200).json({
                success: true,
                message: "Users retrieved successfully",
                data: users,
                meta: {
                    page: page || 1,
                    pageSize: pageSize || users.length,
                    total: totalCount,
                    totalPages: Math.ceil(totalCount / (pageSize || users.length)),
                }
            });

        } catch (error) {
            console.error("Error retrieving users:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to retrieve users",
                error: error,
            });
        }
    }
}
