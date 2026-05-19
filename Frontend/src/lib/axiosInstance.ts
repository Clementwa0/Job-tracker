import axios from "axios";
import { authEvents } from "@/lib/authEvents";
import { tokenStorage } from "@/lib/tokenStorage";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_DB_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      tokenStorage.removeToken();
      authEvents.emitUnauthorized();
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
