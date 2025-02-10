import { groups, users } from '@prisma/client';
import { prisma } from '../../prisma/client';

export class GroupService {

    constructor() { }
    // Pagination and search added to getAllGroups method, now returning count as well

    /**
     * Get all groups with pagination and search
     * @param page - Page number 
     * @param pageSize - Number of items per page
     * @param search - Search query 
     * @param logs - Include data logs
     * @returns - Array of groups and total count
     */

    public async getAllGroups(
        page?: number,
        pageSize?: number,
        search?: string,
        logs?: boolean
    ): Promise<{ groups: groups[], totalCount: number }> {
        try {
            // Ensure valid pagination values
            const isPaginated = typeof page === 'number' && typeof pageSize === 'number' && page > 0 && pageSize > 0;

            // Default values if pagination is used
            const currentPage = isPaginated ? page : 1;
            const currentPageSize = isPaginated ? pageSize : 10;
            const searchQuery = search?.trim() ?? '';

            // Calculate pagination offset
            const skip = isPaginated ? (currentPage - 1) * currentPageSize : undefined;

            // Get groups with pagination and search
            const groups = await prisma.groups.findMany({
                where: {
                    deleted_at: null,
                    ...(searchQuery && {
                        OR: [
                            { name: { contains: searchQuery, mode: 'insensitive' } },
                            { description: { contains: searchQuery, mode: 'insensitive' } }
                        ],
                    }),
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    created_at: true,
                    updated_at: true,
                    deleted_at: true,
                    data_logs: logs ?? false,
                },
                orderBy: { created_at: 'desc' },
                ...(isPaginated && { skip, take: currentPageSize }), // Apply pagination only if valid
            });

            // Get total count of groups (for pagination)
            const totalCount = await prisma.groups.count({
                where: {
                    deleted_at: null,
                    ...(searchQuery && {
                        name: {
                            contains: searchQuery,
                            mode: 'insensitive',
                        }
                    })
                }
            });

            return { groups, totalCount };
        } catch (error) {
            console.error("Error fetching groups:", error);
            throw new Error("Failed to fetch groups.");
        }
    }

    public async getById(id: string, logs?: boolean): Promise<groups | null> {
        try {
            const group = await prisma.groups.findFirst({
                where: {
                    id: id,
                    deleted_at: null,
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    created_at: true,
                    updated_at: true,
                    deleted_at: true,
                    data_logs: logs ?? false,
                }
            });

            return group;
        } catch (error) {
            console.error("Error fetching group:", error);
            throw new Error("Failed to fetch group.");
        }
    }

    public async getByName(name: string): Promise<groups | null> {
        try {
            const group = await prisma.groups.findFirst({
                where: {
                    name: name,
                    deleted_at: null,
                },
            });

            return group;
        } catch (error) {
            console.error("Error fetching group:", error);
            throw new Error("Failed to fetch group.");
        }
    }

    public async createGroup(groups: Partial<groups>, data_logs: any): Promise<groups> {
        try {
            const group = await prisma.groups.create({
                data: {
                    ...groups,
                    name: groups.name ?? '',
                    created_at: new Date(),
                    updated_at: new Date(),
                    data_logs: data_logs,
                },
            });

            return group;
        } catch (error) {
            console.error("Error creating group:", error);
            throw new Error("Failed to create group.");
        }
    }

    public async updateGroup(id: string, groups: Partial<groups>, data_logs: any): Promise<groups> {
        try {
            const group = await prisma.groups.update({
                where: { id: id },
                data: {
                    ...groups,
                    updated_at: new Date(),
                    data_logs: data_logs,
                },
            });

            return group;
        } catch (error) {
            console.error("Error updating group:", error);
            throw new Error("Failed to update group.");
        }
    }

    public async getUserByGroupName(name: string): Promise<users[]> {
        try {
            const users = await prisma.users.findMany({
                where: {
                    user_group: {
                        some: {
                            group: {
                                name: name,
                            },
                        },
                    }
                },
            });

            return users;
        } catch (error) {
            console.error("Error fetching users by group name:", error);
            throw new Error("Failed to fetch users by group name.");
        }
    }


    public async deleteGroup(id: string, data_logs: any): Promise<groups> {
        try {
            const group = await prisma.groups.update({
                where: { id: id },
                data: {
                    deleted_at: new Date(),
                    data_logs: data_logs,
                },
            });

            return group;
        } catch (error) {
            console.error("Error deleting group:", error);
            throw new Error("Failed to delete group.");
        }
    }
}
