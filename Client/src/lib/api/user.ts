import type { ApiResponse, Config, LoginUserDto, User, UserCounts } from "../types";
import instance from "../instance";
import Cookies from "js-cookie";
import { Logger, capitalizeFirstLetter } from "../utils";

/**
 * Class representing the authentication API.
 */
export class UserApi {

    /**
     * Login a user.
     * @param {LoginUserDto} user The user credentials.
     * @returns A promise that resolves to the user data.
     */
    static async login(user: LoginUserDto) {
        const { username, password } = user;
        try {
            // Make API call to login
            const response = await instance.post<ApiResponse<User>>("/user/login", { username, password });

            return response.data;
        } catch (error) {
            Logger.error("Login error:", error);
            throw error;
        }
    }

    /**
     * Logout the current user.
     */
    static logout() {
        Cookies.remove("user_session");
    }

    /**
     * Get all users.
     * @param pageSize Number of users per page.
     * @param pageNumber The page number to fetch.
     * @param sortBy The field to sort by.
     * @param ascending Whether to sort in ascending order.
     * @param query Optional search query to filter users.
     * @returns A promise that resolves to the list of users.
     */
    static async fetchAll(
        pageSize: number = 10,
        pageNumber: number = 1,
        sortBy: string = 'id',
        ascending: boolean = true,
        query: string = null!) {
        try {
            const response = await instance.get<ApiResponse<User[]>>("/user", {
                params: {
                    pageSize: pageSize,
                    pageNumber: pageNumber,
                    sortBy: capitalizeFirstLetter(sortBy),
                    ascending: ascending,
                    query: query
                }
            });
            return response.data;
        } catch (error) {
            Logger.error("Fetch users error:", error);
            throw error;
        }
    }

    /**
     * Get the count of users.
     * @param query Optional search query to filter users.
     * @returns A promise that resolves to the user counts.
     */
    static async fetchCount(query: string = null!) {
        try {
            const response = await instance.get<ApiResponse<UserCounts>>("/user/count", {
                params: {
                    query: query
                }
            });
            return response.data;
        } catch (error) {
            Logger.error("Fetch user count error:", error);
            throw error;
        }
    }

    /**
     * Delete a user.
     * @param userId The ID of the user to delete.
     * @returns A promise that resolves when the user is deleted.
     */
    static async deleteUser(userId: number) {
        try {
            const response = await instance.delete<ApiResponse<void>>(`/user/${userId}`);
            return response.data;
        } catch (error) {
            Logger.error("Delete user error:", error);
            throw error;
        }
    }

    /**
     * Update a user.
     * @param userId ID of the user to update
     * @param user The user object with updated information.
     * @returns A promise that resolves to the updated user data.
     */
    static async updateUser(userId: number, user: User) {
        try {
            const response = await instance.put<ApiResponse<User>>(`/user/${userId}`, user);
            return response.data;
        } catch (error) {
            Logger.error("Update user error:", error);
            throw error;
        }
    }

    /**
     * Create a new user.   
     * @param user The user object to create.
     * @returns A promise that resolves to the created user data.
     */
    static async createUser(user: User) {
        try {
            const response = await instance.post<ApiResponse<User>>(`/user`, user);
            return response.data;
        } catch (error) {
            Logger.error("Create user error:", error);
            throw error;
        }
    }
}

export class ConfigApi {
    static async fetchConfig() {
        try {
            const response = await instance.get<ApiResponse<Array<Config>>>("/config");
            return response.data;
        } catch (error) {
            Logger.error("Fetch config error:", error);
            throw error;
        }
    }

    static async updateConfig(config: Config) {
        try {
            const response = await instance.post<ApiResponse<string>>("/config", config);
            return response.data;
        } catch (error) {
            Logger.error("Update config error:", error);
            throw error;
        }
    }

    static async fetchConfigByKey(key: string) {
        try {
            const response = await instance.get<ApiResponse<string>>(`/config/${key}`);
            return response.data;
        } catch (error) {
            Logger.error("Fetch config by key error:", error);
            throw error;
        }
    }

    static async deleteConfigByKey(key: string) {
        try {
            const response = await instance.delete<ApiResponse<string>>(`/config/${key}`);
            return response.data;
        } catch (error) {
            Logger.error("Delete config by key error:", error);
            throw error;
        }
    }
}