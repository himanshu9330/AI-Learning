import apiClient from '../lib/apiClient';

export interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    grade: string;
    target_exam: string;
    ability_score: number;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    status: string;
    message: string;
    data: {
        user: User;
        token: string;
        refreshToken: string;
    };
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    grade: string;
    target_exam: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface UpdateProfileData {
    name?: string;
    email?: string;
    avatar?: string;
    grade?: string;
    target_exam?: string;
    ability_score?: number;
}

class AuthService {
    /**
     * Register a new user
     */
    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('auth/register', data);

        // Store token and user data
        if (response.data.data.token) {
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('refreshToken', response.data.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }

        return response.data;
    }

    /**
     * Login user
     */
    async login(data: LoginData): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('auth/login', data);

        // Store token and user data
        if (response.data.data.token) {
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('refreshToken', response.data.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }

        return response.data;
    }

    /**
     * Logout user
     */
    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }

    /**
     * Get current user profile
     */
    async getProfile(): Promise<{ status: string; data: { user: User } }> {
        const response = await apiClient.get('auth/profile');
        return response.data;
    }

    /**
     * Update user profile
     */
    async updateProfile(data: Partial<User>): Promise<{ status: string; data: { user: User } }> {
        const response = await apiClient.put<{ status: string; data: { user: User } }>('auth/profile', data);
        if (response.data.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
    }

    async googleLogin(idToken: string): Promise<{ status: string; data: { user: User; token: string } }> {
        const response = await apiClient.post<{ status: string; data: { user: User; token: string } }>('auth/google', { idToken });
        if (response.data.data.token) {
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
    }

    /**
     * Get stored user
     */
    getStoredUser(): User | null {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        }
        return null;
    }

    /**
     * Get stored token
     */
    getStoredToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!this.getStoredToken();
    }
}

export default new AuthService();
