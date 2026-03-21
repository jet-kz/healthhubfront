import axios from 'axios';

// We point to the Next.js API routes (proxy), not directly to FastAPI
const baseURL = '/api';

export const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for cookies
});

// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Response interceptor - Handle auth errors and auto-refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Check if we have a refresh token before attempting refresh
            if (!document.cookie.includes('refresh_token')) {
                // No refresh token, redirect to login
                if (typeof window !== 'undefined') {
                    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                    const currentPath = window.location.pathname;
                    if (!currentPath.startsWith('/login') && !currentPath.startsWith('/signup')) {
                        window.location.href = `/login?from=${encodeURIComponent(currentPath)}`;
                    }
                }
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Wait for the refresh to complete
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    return apiClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Attempt to refresh the token
                const response = await axios.post('/api/auth/refresh', {}, {
                    withCredentials: true
                });

                const { access_token } = response.data;

                // Store new access token in cookie (1 hour - healthcare standard)
                document.cookie = `access_token=${access_token}; path=/; max-age=${60 * 60}; SameSite=Strict`;

                processQueue(null, access_token);
                isRefreshing = false;

                // Retry original request
                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;

                // Refresh failed - redirect to login
                if (typeof window !== 'undefined') {
                    // Clear all tokens
                    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

                    // Redirect to login
                    const currentPath = window.location.pathname;
                    window.location.href = `/login?from=${encodeURIComponent(currentPath)}`;
                }

                return Promise.reject(refreshError);
            }
        }

        // 403 shouldn't automatically redirect to login because the user IS authenticated,
        // they just don't have permission for this specific resource.
        if (error.response?.status === 403) {
            console.warn("403 Forbidden: Missing permissions for this endpoint.");
        }

        const message = error.response?.data?.detail || error.message;
        console.error('API Error:', message);
        return Promise.reject(error);
    }
);
