import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api/v1').replace(/\/$/, '') + '/',
    timeout: 120000, // 2 minutes for long-running AI tasks
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Get token from localStorage
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        // Handle specific error cases
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // Unauthorized - clear token and redirect to login
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                    }
                    break;
                case 403:
                    // Forbidden
                    console.error('Access forbidden');
                    break;
                case 400:
                    console.error('Bad request:', (error.response.data as any)?.message || 'Invalid request');
                    break;
                case 404:
                    // Not found
                    console.error('Resource not found');
                    break;
                case 408:
                    console.error('Request timeout');
                    break;
                case 422:
                    console.error('Validation error:', (error.response.data as any)?.message);
                    break;
                case 429:
                    console.error('Too many requests. Please try again later.');
                    break;
                case 500:
                    // Server error
                    console.error('Server error:', (error.response.data as any)?.message);
                    break;
                default:
                    console.error(`An error occurred: ${error.response.status}`, error.response.data);
                    break;
            }
        } else if (error.request) {
            // Request made but no response
            console.error('Network error - no response received');
        } else {
            // Something else happened
            console.error('Error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default apiClient;
