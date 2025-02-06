import { Request, Response } from 'express';
import { GroupService } from '../services/group.service';
import { DataLog } from '../interfaces';

export class GroupController {

    constructor(private groupService: GroupService) {
        this.groupService = groupService;

        // Bind class methods
        this.getAllGroups = this.getAllGroups.bind(this);
        this.createGroup = this.createGroup.bind(this);
        this.updateGroup = this.updateGroup.bind(this);
    }

    /**
     *  Get all groups with pagination and search
     * @param req - Express Request object
     * @param res - Express Response object
     * @returns - JSON response with groups data
     */

    public async getAllGroups(req: Request, res: Response): Promise<any> {
        const page: number = parseInt(req.query.page as string) || 1;
        const pageSize: number = parseInt(req.query.pageSize as string);
        const search: string = req.query.search as string || '';
        const logs: boolean = req.query.logs === 'true';

        try {
            const { groups, totalCount } = await this.groupService.getAllGroups(page, pageSize, search, logs);

            return res.status(200).json({
                message: "Groups retrieved successfully",
                data: groups,
                meta: {
                    page,
                    pageSize: pageSize || groups.length,
                    total: totalCount
                }
            });
        } catch (error) {
            console.error("Error fetching groups:", error);
            return res.status(500).json({ message: "Failed to fetch groups." });
        }
    }

    /**
     * Create a new group
     * @param req - Express Request object
     * @param res - Express Response object 
     * @returns - JSON response with new group data 
     */

    public async createGroup(req: Request, res: Response): Promise<any> {
        const { name } = req.body;

        try {

            const group = await this.groupService.getByName(name);

            if (group !== null) {
                return res.status(400).json({
                    success: false,
                    message: "Create group failed",
                    error: "Group name already exists",
                });
            }

            const dataLogs: DataLog[] = [
                {
                    action: "created",
                    created_at: new Date(),
                    updated_at: new Date(),
                    created_by: req.user?.email || 'unknown',
                    meta: [
                        `name: ${name}`
                    ]
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


    /**
     * Update a group
     * @param req - Express Request object
     * @param res - Express Response object
     * @returns - JSON response with updated group data
     */

    public async updateGroup(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        const { name } = req.body;

        try {
            const group = await this.groupService.getById(id);

            if (group === null) {
                return res.status(404).json({
                    success: false,
                    message: "Update group failed",
                    error: "Group not found",
                });
            }

            const existingData: DataLog[] = Array.isArray(group.data_logs) ? group.data_logs as unknown as DataLog[] : [];


            let dataLogs: DataLog[] = []

            if (group.name !== name) {
                dataLogs = [
                    ...existingData,
                    {
                        action: "updated",
                        created_at: new Date(),
                        updated_at: new Date(),
                        created_by: req.user?.email || 'unknown',
                        meta: [
                            `name: ${group.name} -> ${name}`
                        ]
                    }
                ]
            } else {
                dataLogs = group.data_logs as unknown as DataLog[] || [];
            }

            const updatedGroup = await this.groupService.updateGroup(id, { name }, dataLogs);
            return res.status(200).json({
                message: "Group updated successfully",
                data: updatedGroup,
            });

        } catch (error) {
            console.error("Error updating group:", error);
            return res.status(500).json({ message: "Failed to update group." });
        }
    }
}
