// src/services/axios/apiAuth.ts
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

export const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1`,
    timeout: 15_000,
    withCredentials: false,
});

const getAccessToken = () => Cookies.get("access_token");
const getRefreshToken = () => Cookies.get("refresh_token");

// Attach Authorization header
api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Refresh flow (single-flight)
let isRefreshing = false;
let pendingQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null) => {
    pendingQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    pendingQueue = [];
};

api.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // If not 401 or already retried, just reject
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        // mark as retried
        originalRequest._retry = true;

        // queue requests while refreshing
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                pendingQueue.push({
                    resolve: (token) => {
                        // set the new token on the original request and retry
                        if (token) {
                            originalRequest.headers = originalRequest.headers ?? {};
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        resolve(api(originalRequest));
                    },
                    reject,
                });
            });
        }

        // start refresh
        isRefreshing = true;

        try {
            const rToken = getRefreshToken();
            if (!rToken) throw new Error("Invalid credentials");

            // Call your refresh endpoint
            const refreshRes = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/user/refresh`,
                { refreshToken: rToken }
            );

            const newAccessToken = (refreshRes.data?.accessToken as string) || "";
            const newRefreshToken = (refreshRes.data?.refreshToken as string) || null;

            // Persist tokens
            if (newAccessToken) Cookies.set("access_token", newAccessToken, { sameSite: "Lax" });
            if (newRefreshToken) Cookies.set("refresh_token", newRefreshToken, { sameSite: "Lax" });

            // Replay queued requests
            processQueue(null, newAccessToken);

            // Retry the failed one
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
        } catch (refreshErr) {
            // Fail queued requests
            processQueue(refreshErr, null);

            // Optional: clear cookies & redirect to login
            Cookies.remove("access_token");
            Cookies.remove("refresh_token");
            // window.location.href = "/auth/login"; // if you want

            return Promise.reject(refreshErr);
        } finally {
            isRefreshing = false;
        }
    }
);
