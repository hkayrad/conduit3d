import axios, { type AxiosResponse } from "axios";

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    },
    withCredentials: true,
})

instance.interceptors.response.use((response: AxiosResponse) => {
    return response;
}, (error) => {
    console.log("Unhandled API Error:", error?.response?.data?.message || error.message);
    return Promise.reject(error);
})

export default instance;