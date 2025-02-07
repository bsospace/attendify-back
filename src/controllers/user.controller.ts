import e, { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { GroupService } from '../services/group.service';

export class UserController {
    private userService: UserService;
    private groupService: GroupService;

    constructor(userService: UserService, groupService: GroupService) {
        this.userService = userService;
        this.groupService = groupService;

        this.getAllUsers = this.getAllUsers.bind(this);
        this.getByGroupName = this.getByGroupName.bind(this);
    }

    /**
     * Get all users with pagination and search
     * @param req - Request object
     * @param res - Response object
     * @returns - Response object
     */

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


    public async getByGroupName(req: Request, res: Response): Promise<any> {
        try {
            // Extract query parameters
            const page = req.query.page ? parseInt(req.query.page as string) : undefined;
            const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined;
            const search = req.query.search ? String(req.query.search) : undefined;
            const logs = req.query.logs === "true"; // Convert logs to boolean
            const groupName = req.params.groupName;

            // Check if group exists in the database
            const group = await this.groupService.getByName(groupName);

            if (!group) {
                return res.status(404).json({
                    success: false,
                    message: "Get group by name failed",
                    error: "Group not found"
                });
            }

            // Validate numeric parameters
            if ((page !== undefined && isNaN(page)) || (pageSize !== undefined && isNaN(pageSize))) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid pagination parameters",
                });
            }

            // Call service method
            const { users, totalCount } = await this.userService.getUserByGroupName(groupName, page, pageSize, search, logs);

            // Return response if no users found for the group
            if(!users || users.length == 0) {
                return res.status(404).json({
                    success: false,
                    message: "Users not found",
                    error: "No users found for the group"
                });
            }

            // Return response with users
            
            return res.status(200).json({
                success: true,
                message: "Users retrieved successfully",
                data: users,
                meta: {
                    page: page || 1,
                    pageSize: pageSize || users.length,
                    total: totalCount,
                    totalPages: Math.ceil(totalCount / (pageSize || users.length)) || 0,
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
