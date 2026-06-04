// ============================================
// FILE: frontend/js/api-client.js (CREATE THIS)
// ============================================
// Unified API client for consistent error handling

const API_BASE = '/api';

class APIClient {
    constructor() {
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const config = {
            credentials: 'same-origin',
            headers: this.defaultHeaders,
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await this.parseResponse(response);
            
            if (!response.ok) {
                throw {
                    status: response.status,
                    message: this.getErrorMessage(data, response.status),
                    data: data
                };
            }
            
            return { success: true, data, status: response.status };
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            return {
                success: false,
                error: error.message || 'Network error occurred',
                status: error.status || 500
            };
        }
    }

    async parseResponse(response) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            try {
                return await response.json();
            } catch {
                return {};
            }
        }
        return {};
    }

    getErrorMessage(data, status) {
        if (data.errors) {
            const firstError = Object.values(data.errors)[0];
            return typeof firstError === 'string' ? firstError : 'Validation error';
        }
        if (data.error) return data.error;
        if (status === 401) return 'Please login to continue.';
        if (status === 404) return 'Resource not found.';
        if (status === 500) return 'Server error. Please try again.';
        return 'An unexpected error occurred.';
    }

    // Auth endpoints
    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async logout() {
        return this.request('/auth/logout', { method: 'POST' });
    }

    // User endpoints
    async getCurrentUser() {
        return this.request('/users/me');
    }

    async updateProfile(data) {
        return this.request('/users/me', {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    // Lesson endpoints
    async getLessons() {
        return this.request('/lessons');
    }

    async getLesson(id) {
        return this.request(`/lessons/${id}`);
    }

    async createLesson(data) {
        return this.request('/lessons', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateLesson(id, data, method = 'PATCH') {
        return this.request(`/lessons/${id}`, {
            method: method,
            body: JSON.stringify(data)
        });
    }

    async deleteLesson(id) {
        return this.request(`/lessons/${id}`, { method: 'DELETE' });
    }
}

const api = new APIClient();