import type { ApiResponse, LoginUserDto, User } from "../types";
import instance from "../instance";
import Cookies from "js-cookie";

/**
 * Class representing the authentication API.
 */
export class AuthApi {

    /**
     * Login a user.
     * @param {LoginUserDto} user The user credentials.
     * @returns The logged-in user data.
     */
    static async login(user: LoginUserDto) {
        const { username, password } = user;
        // Make API call to login
        const response = await instance.post<ApiResponse<User>>("/auth/login", { username, password });

        return response.data;
    }

    /**
     * Logout the current user.
     */
    static logout() {
        Cookies.remove("user_session");
    }
}