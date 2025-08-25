import type { ApiResponse, LoginUserDto, User } from "../types";
import instance from "../instance";
import Cookies from "js-cookie";

export default class AuthApi {

    static async login(user: LoginUserDto) {
        const { username, password } = user;
        // Make API call to login
        const response = await instance.post<ApiResponse<User>>("/auth/login", { username, password });

        return response.data;
    }

    static logout() {
        Cookies.remove("user_session");
    }
}