import axios from 'axios';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor pentru adăugarea token-ului de autentificare
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor pentru gestionarea erorilor
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Eroare de autentificare
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('isAdmin');
                window.location.href = '/';
            }
            
            // Eroare de autorizare
            if (error.response.status === 403) {
                if (window.location.pathname.startsWith('/admin')) {
                    window.location.href = '/';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default instance;
