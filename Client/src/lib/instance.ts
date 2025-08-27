import axios, { type AxiosResponse } from "axios";
import { store } from "./store";
import { setIsDataLoading } from "../app/layout/map/mapSlice";

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    },
    withCredentials: true,
})

instance.interceptors.request.use((config) => {
    store.dispatch(setIsDataLoading(true));
    return config;
});

instance.interceptors.response.use((response: AxiosResponse) => {
    store.dispatch(setIsDataLoading(false));
    return response;
}, (error) => {
    store.dispatch(setIsDataLoading(false));
    console.log("Unhandled API Error:", error?.response?.data?.message || error.message);
    return Promise.reject(error);
})

export default instance;