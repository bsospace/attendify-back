import { HttpError } from "src/utils/handler.util";
import { prisma } from "../prisma/client";
import { users } from "@prisma/client";
import { envConfig } from "src/configs/env.config";

export class UserService {

    /**
       * getUserById retrieve a user by ID
       * @param id the user ID
       * @returns the user with the specified ID
       */
    public async getUserById(id: string): Promise<(Partial<users> & { roles: string[]; permissions: string[]; service: string }) | null> {
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

    public async createUser(User: users): Promise<users> {
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
}
