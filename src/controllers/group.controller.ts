import { Request, Response } from 'express';
import { GroupService } from '../services/group.service';
import { create } from 'domain';

export class GroupController {

    constructor(private groupService: GroupService) {
        this.groupService = groupService;

        // Bind class methods
        this.getAllGroups = this.getAllGroups.bind(this);
        this.createGroup = this.createGroup.bind(this);
    }

    // Get all groups with pagination and search
    public async getAllGroups(req: Request, res: Response): Promise<any> {
        const page: number = parseInt(req.query.page as string) || 1;
        const pageSize: number = parseInt(req.query.pageSize as string) || 10;
        const search: string = req.query.search as string || '';

        try {
            const { groups, totalCount } = await this.groupService.getAllGroups(page, pageSize, search);

            return res.status(200).json({
                message: "Groups retrieved successfully",
                data: groups,
                meta: {
                    page,
                    pageSize,
                    total: totalCount
                }
            });
        } catch (error) {
            console.error("Error fetching groups:", error);
            return res.status(500).json({ message: "Failed to fetch groups." });
        }
    }

    // Create a new group
    public async createGroup(req: Request, res: Response): Promise<any> {
        const { name } = req.body;

        try {

            const group = await this.groupService.getByName(name);

            if (group !== null) {
                return res.status(400).json({
                    success: false,
                    message: "Create group failed",
                    errors: "Group name already exists",
                });
            }

            const dataLogs = [
                {
                    action: "created",
                    created_at: new Date(),
                    updated_at: new Date(),
                    created_by: req.user?.id || 'unknown',
                }
            ]

            const newGroup = await this.groupService.createGroup({ name }, dataLogs);
            return res.status(201).json({
                message: "Group created successfully",
                data: newGroup,
            });

        } catch (error) {
            console.error("Error creating group:", error);
            return res.status(500).json({ message: "Failed to create group." });
        }
    }
}
