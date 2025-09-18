import axios, { type AxiosResponse } from "axios";
import { store } from "./store";
import { setIsDataLoading } from "../app/layout/map/mapSlice";
import { Logger } from "./utils";

// Create an Axios instance with default configuration
const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    },
    withCredentials: true,
})

// Add a request interceptor to set loading state before a request is made
instance.interceptors.request.use((config) => {
    store.dispatch(setIsDataLoading(true));
    return config;
});

// Add a response interceptor to unset loading state after a response is received
instance.interceptors.response.use((response: AxiosResponse) => {
    store.dispatch(setIsDataLoading(false));
    return response;
}, (error) => {
    if (error instanceof axios.Cancel)
        return Promise.reject("Request cancelled");
    
    Logger.error(error.response?.data);
    store.dispatch(setIsDataLoading(false));
    return error.response;
})

export default instance;