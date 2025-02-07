import { HttpError } from "../utils/handler.util";
import { prisma } from "../../prisma/client";
import { users, groups, user_group } from '@prisma/client';
import { envConfig } from "../configs/env.config";
import { DataLog } from "../interfaces";

export class UserService {

    /**
     * getUsers retrieves all users from the database
     * @param page the page number
     * @param pageSize the number of users per page
     * @param search the search query
     * @param logs whether to include logs
     * @returns all users in the database
     */

    public async getAllUsers(
        page?: number,
        pageSize?: number,
        search?: string,
        logs: boolean = false
    ): Promise<{ users: (Partial<users>)[], totalCount: number }> {
        try {
            // Check if pagination should be applied
            const isPaginated = typeof page === 'number' && typeof pageSize === 'number' && page > 0 && pageSize > 0;

            // Default values if pagination is used
            const currentPage = isPaginated ? page : 1;
            const currentPageSize = isPaginated ? pageSize : 10;
            const searchQuery = search?.trim() ?? '';

            // Calculate pagination offset
            const skip = isPaginated ? (currentPage - 1) * currentPageSize : undefined;

            // Fetch users with optional search and pagination
            const users = await prisma.users.findMany({
                where: {
                    deleted_at: null,
                    ...(searchQuery && {
                        OR: [
                            { username: { contains: searchQuery, mode: 'insensitive' } },
                            { email: { contains: searchQuery, mode: 'insensitive' } },
                            { first_name: { contains: searchQuery, mode: 'insensitive' } },
                            { last_name: { contains: searchQuery, mode: 'insensitive' } }
                        ]
                    })
                },

                include: {
                    user_role: {
                        include: {
                            role: {
                                include: {
                                    role_permissions: {
                                        include: {
                                            permission: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    user_permissions: {
                        include: {
                            permission: true,
                        },
                    },
                },

                orderBy: { created_at: 'desc' },
                ...(isPaginated && { skip, take: currentPageSize }), // Apply pagination only if needed
            });

            // Get total count of users (for pagination)
            const totalCount = await prisma.users.count({
                where: {
                    deleted_at: null,
                    ...(searchQuery && {
                        OR: [
                            { username: { contains: searchQuery, mode: 'insensitive' } },
                            { email: { contains: searchQuery, mode: 'insensitive' } },
                            { first_name: { contains: searchQuery, mode: 'insensitive' } },
                            { last_name: { contains: searchQuery, mode: 'insensitive' } }
                        ]
                    })
                }
            });

            // Map users to include roles and permissions
            const mappedUsers = users.map((user) => {
                const roles = user.user_role.map((ur) => ur.role.name);
                let permissions = user.user_role.flatMap((ur) => ur.role.role_permissions.map((p) => p.permission.name));
                permissions = permissions.concat(user.user_permissions.map((up) => up.permission.name));

                return {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                };
            });

            return { users: mappedUsers, totalCount };
        } catch (error) {
            console.error('Error retrieving users:', error);
            throw new HttpError(500, 'Failed to retrieve users', error);
        }
    }
    /**
       * getUserById retrieve a user by ID
       * @param id the user ID
       * @returns the user with the specified ID
       */
    public async getUserById(id: string): Promise<(Partial<users> & { roles: string[]; permissions: string[]; groups: string[]; service: string }) | null> {
        try {
            const user = await prisma.users.findUnique({
                where: { id },
                include: {
                    user_role: {
                        include: {
                            role: {
                                include: {
                                    role_permissions: {
                                        include: {
                                            permission: true,
                                        },
                                    },
                                },
                            },
                        },

                    },
                    user_permissions: {
                        include: {
                            permission: true,
                        },
                    },
                    user_group: {
                        include: {
                            group: true,
                        }
                    }
                },
            });

            if (!user) return null;

            // Extract roles, permissions, and services
            const roles = user.user_role.map((ur) => ur.role.name);
            let permissions = user.user_role.flatMap((ur) => ur.role.role_permissions.map((p) => p.permission.name));
            permissions = permissions.concat(user.user_permissions.map((up) => up.permission.name));

            return {
                id: user.id,
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                created_at: user.created_at,
                updated_at: user.updated_at,
                deleted_at: user.deleted_at,
                roles,
                permissions,
                service: envConfig.app.serviceName,
                groups: user.user_group.map((ug) => ug.group.name),
            };
        } catch (error) {
            console.error('Error retrieving user by ID:', error);
            throw new HttpError(500, 'Failed to retrieve user by ID', error);
        }
    }

    /**
     * Fetches a user by email from the database.
     * @param email - The email of the user to fetch.
     * @returns The user object if found, otherwise null.
     * @throws Error if the database query fails.
     */
    public async getUserByEmail(email: string): Promise<(Partial<users> & { roles: string[]; permissions: string[]; service: string }) | null> {
        try {
            const user = await prisma.users.findUnique({
                where: { email },
                include: {
                    user_role: {
                        include: {
                            role: {
                                include: {
                                    role_permissions: {
                                        include: {
                                            permission: true,
                                        },
                                    },
                                },
                            },
                        },

                    },
                    user_permissions: {
                        include: {
                            permission: true,
                        },
                    }
                },
            });

            if (!user) return null;

            // Extract roles, permissions, and services
            const roles = user.user_role.map((ur) => ur.role.name);
            let permissions = user.user_role.flatMap((ur) => ur.role.role_permissions.map((p) => p.permission.name));
            permissions = permissions.concat(user.user_permissions.map((up) => up.permission.name));

            return {
                id: user.id,
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                created_at: user.created_at,
                updated_at: user.updated_at,
                deleted_at: user.deleted_at,
                roles,
                permissions,
                service: envConfig.app.serviceName,
            };
        } catch (error) {
            console.error('Error retrieving user by ID:', error);
            throw new HttpError(500, 'Failed to retrieve user by ID', error);
        }
    }

    /**
     * Creates a new user in the database.
     * @param User - The user object to create.
     * @returns - The created user object.
     */

    public async createUser(User: Partial<users>): Promise<users> {
        try {
            const user = await prisma.users.create({
                data: {
                    ...User,
                    username: User.username || '',
                    email: User.email || '',
                    first_name: User.first_name || '',
                    last_name: User.last_name || '',
                    created_at: new Date(),
                    updated_at: new Date(),
                    data_logs: User.data_logs || undefined,
                },
            });
            return user;
        } catch (error) {
            console.error("Error creating user:", error);
            throw new Error("Failed to create user.");
        }
    }

    /**
     * 
     * @param userId
     * @param groupId 
     * @returns 
     */
    public async createGroupWithUser(userId: string, groupId: string, logs: DataLog[]): Promise<user_group> {
        try {
            // Instead of updating the user, create an entry in user_group table
            const userGroup = await prisma.user_group.create({
                data: {
                    user_id: userId,
                    group_id: groupId,
                    data_logs: JSON.stringify(logs),
                },
            });

            return userGroup;
        } catch (error) {
            console.error(`Failed to add user ${userId} to group ${groupId}:`, error);
            throw new Error("Failed to add user to group.");
        }
    }

    public async getByUsername(username: string): Promise<users | null> {
        try {
            const user = await prisma.users.findFirst({
                where: { username },
            });

            return user;
        } catch (error) {
            console.error('Error retrieving user by username:', error);
            throw new HttpError(500, 'Failed to retrieve user by username', error);
        }
    }


    public async getUserByGroupName(
        name: string,
        page?: number,
        pageSize?: number,
        search?: string,
        logs: boolean = false,
    ): Promise<{ users: (Partial<users>)[], totalCount: number }> {
        try {

            // Check if pagination should be applied
            const isPaginated = typeof page === 'number' && typeof pageSize === 'number' && page > 0 && pageSize > 0;

            // Default values if pagination is used
            const currentPage = isPaginated ? page : 1;
            const currentPageSize = isPaginated ? pageSize : 10;
            const searchQuery = search?.trim() ?? '';

            // Calculate pagination offset
            const skip = isPaginated ? (currentPage - 1) * currentPageSize : undefined;

            // Fetch users with optional search and pagination
            const users = await prisma.users.findMany({
                where: {
                    deleted_at: null,
                    user_group: {
                        some: {
                            group: {
                                name: name,
                            },
                        },
                    },
                    ...(searchQuery && {
                        OR: [
                            { username: { contains: searchQuery, mode: 'insensitive' } },
                            { email: { contains: searchQuery, mode: 'insensitive' } },
                            { first_name: { contains: searchQuery, mode: 'insensitive' } },
                            { last_name: { contains: searchQuery, mode: 'insensitive' } }
                        ]
                    })
                },
                orderBy: { created_at: 'desc' },
                ...(isPaginated && { skip, take: currentPageSize }),
            });

            const totalCount = await prisma.users.count({
                where: {
                    deleted_at: null,
                    user_group: {
                        some: {
                            group: {
                                name: name,
                            },
                        },
                    },
                    ...(searchQuery && {
                        OR: [
                            { username: { contains: searchQuery, mode: 'insensitive' } },
                            { email: { contains: searchQuery, mode: 'insensitive' } },
                            { first_name: { contains: searchQuery, mode: 'insensitive' } },
                            { last_name: { contains: searchQuery, mode: 'insensitive' } }
                        ]
                    })
                }
            });

            return { users, totalCount};
            
        } catch (error) {
            console.error('Error retrieving user by group name:', error);
            throw new HttpError(500, 'Failed to retrieve user by group name', error);
        }
    }

}
