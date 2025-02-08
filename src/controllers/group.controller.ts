import { Request, Response } from 'express';
import { GroupService } from '../services/group.service';
import { DataLog } from '../interfaces';
import { UserService } from '../services/user.service';

export class GroupController {

    constructor(private groupService: GroupService, private userService: UserService) {
        this.groupService = groupService;
        this.userService = userService;

        // Bind class methods
        this.getAllGroups = this.getAllGroups.bind(this);
        this.createGroup = this.createGroup.bind(this);
        this.updateGroup = this.updateGroup.bind(this);
        this.addUserToGroup = this.addUserToGroup.bind(this);
        this.deleteGroup = this.deleteGroup.bind(this);
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
                    total: totalCount,
                    totalPages: Math.ceil(totalCount / (pageSize || groups.length))
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
        const { name, description } = req.body;

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

            const newGroup = await this.groupService.createGroup({ name, description }, dataLogs);
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
     * Add user to group
     * @param req - Express Request object
     * @param res - Express Response object
     * @returns - JSON response with updated group data
     */

    public async addUserToGroup(req: Request, res: Response): Promise<any> {
        try {
            const { name, description, users } = req.body;

            // Check if users array is empty
            if (!users || !Array.isArray(users) || users.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Create group failed",
                    error: "No users provided",
                });
            }

            // Check if the group already exists
            let existingGroup = await this.groupService.getByName(name);

            // If the group already exists, return an error
            if (existingGroup) {
                return res.status(400).json({
                    success: false,
                    message: "Create group failed",
                    error: "Group name already exists",
                });
            }

            // Create group with description
            const group = await this.groupService.createGroup(
                { name, description },
                [
                    {
                        action: "created",
                        created_at: new Date(),
                        updated_at: new Date(),
                        created_by: req.user?.email || 'unknown',
                        meta: [`name: ${name}`, `description: ${description}`]
                    }
                ]
            );

            // Extract unique user IDs
            const uniqueUserIds = [...new Set(users.map((user) => user.id))];

            // Validate each user exists
            const missingUsers: string[] = [];
            const existingUsers = await Promise.all(uniqueUserIds.map(async (id) => {
                const user = await this.userService.getUserById(id);
                if (!user) {
                    missingUsers.push(id);
                    return null;
                }
                return user;
            }));

            // If any users do not exist, return an error
            if (missingUsers.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Create group failed",
                    error: "Some users do not exist",
                });
            }

            // Add users to the group
            const addedUsers = [];
            const failedUsers = [];

            // Add each user to the group
            for (const user of existingUsers) {

                let dataLogs: DataLog[] = [
                    {
                        action: "created",
                        created_at: new Date(),
                        updated_at: new Date(),
                        created_by: req.user?.email || 'unknown',
                        meta: [
                            `name: ${name}`,
                            `description: ${description}`,
                            `user_id: ${user?.id}`
                        ]
                    }
                ]

                try {
                    if (user && group) {
                        if (user?.id && group?.id) {
                            const addedUser = await this.userService.createGroupWithUser(user.id, group.id, dataLogs);
                            addedUsers.push(addedUser);
                        }
                    }
                } catch (error) {
                    if (user) {
                        console.warn(`Failed to add user ${user.id} to group ${group.id}:`, error);
                    }
                    if (user) {
                        failedUsers.push(user.id);
                    }
                }
            }

            // Return a success response with the added users and any failed users
            return res.status(200).json({
                success: true,
                message: "Users added to group successfully",
                data: {
                    addedUsers,
                    failedUsers: failedUsers.length > 0 ? failedUsers : null,
                }
            });

        } catch (error) {
            console.error("Error adding user to group:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to add user to group.",
                error: error
            });
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
        const { name, description } = req.body;

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

            const updatedGroup = await this.groupService.updateGroup(id, { name, description }, dataLogs);
            return res.status(200).json({
                message: "Group updated successfully",
                data: updatedGroup,
            });

        } catch (error) {
            console.error("Error updating group:", error);
            return res.status(500).json({ message: "Failed to update group." });
        }
    }

    public async updateUserInGroup(req: Request, res: Response): Promise<any> {
        const { groupId } = req.params;
        const { users } = req.body;

        try {
            const group = await this.groupService.getById(groupId);

            if (group === null) {
                return res.status(404).json({
                    success: false,
                    message: "Update group failed",
                    error: "Group not found",
                });
            }

            // Extract unique user IDs from the request body
            const uniqueUserIds: string[] = [...new Set((users as { id: string }[]).map((user) => user.id))];
            const missingUsers: string[] = [];

            const existingUsers = await Promise.all(uniqueUserIds.map(async (id) => {
                const user = await this.userService.getUserById(id);

                if (!user) {
                    missingUsers.push(id);
                    return null;
                }

                return user;
            }));



            // If any users do not exist, return an error
            if (missingUsers.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Update group failed",
                    error: "Some users do not exist",
                });
            }

            // Add users to the group
            const addedUsers = [];
            const failedUsers = [];

            // Add each user to the group
            for (const user of existingUsers) {

                if (user) {
                    let dataLogs: DataLog[] = [
                        {
                            action: "updated",
                            created_at: new Date(),
                            updated_at: new Date(),
                            created_by: req.user?.email || 'unknown',
                            meta: [
                                `changed_from: ${group.name} -> ${user.groups}`,
                                `action: added`,
                            ]
                        }
                    ];

                    try {
                        if (user && group) {
                            if (user?.id && group?.id) {
                                const addedUser = await this.userService.createGroupWithUser(user.id, group.id, dataLogs);
                                addedUsers.push(addedUser);
                            }
                        }
                    } catch (error) {
                        if (user) {
                            console.warn(`Failed to add user ${user.id} to group ${group.id}:`, error);
                        }
                        if (user) {
                            failedUsers.push(user.id);
                        }
                    }
                }


                if (group === null) {
                    return res.status(404).json({
                        success: false,
                        message: "Update group failed",
                        error: "Group not found",
                    });
                }
            }



        } catch (error) {
            console.error("Error updating group:", error);
            return res.status(500).json({ message: "Failed to update group." });
        }
    }

    public async deleteGroup(req: Request, res: Response): Promise<any> {
        const { id } = req.params;

        try {

            // Check if group exists in the database
            const group = await this.groupService.getById(id);

            // If the group does not exist, return an error
            if (group === null) {
                return res.status(404).json({
                    success: false,
                    message: "Delete group failed",
                    error: "Group not found",
                });
            }

            // Add a data log for the deletion
            const dataLogs: DataLog[] = [
                ...group.data_logs as unknown as DataLog[] || [],
                {
                    action: "deleted",
                    created_at: new Date(),
                    updated_at: new Date(),
                    created_by: req.user?.email || 'unknown',
                    meta: [
                        `name: ${group.name}`
                    ]
                }
            ]

            // Delete the group from the database
            const deletedGroup = await this.groupService.deleteGroup(id, dataLogs);

            // Return a success response with the deleted group data
            return res.status(200).json({
                message: "Group deleted successfully",
                data: deletedGroup,
            });

        } catch (error) {
            console.error("Error deleting group:", error);
            return res.status(500).json({ message: "Failed to delete group." });
        }
    }
}
