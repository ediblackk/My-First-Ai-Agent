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
            config.headers['Authorization'] = `Bearer ${token}`;
            // Log request details in development
            if (import.meta.env.DEV) {
                console.log('Request:', {
                    method: config.method,
                    url: config.url,
                    headers: config.headers,
                    data: config.data,
                    token
                });
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor pentru gestionarea erorilor
instance.interceptors.response.use(
    (response) => {
        // Log response in development
        if (import.meta.env.DEV) {
            console.log('Response:', {
                status: response.status,
                headers: response.headers,
                data: response.data
            });
        }
        return response;
    },
    (error) => {
        if (error.response) {
            // Log error details in development
            if (import.meta.env.DEV) {
                console.log('Error Response:', {
                    status: error.response.status,
                    headers: error.response.headers,
                    data: error.response.data,
                    config: error.config
                });
            }

            // Eroare de autentificare
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('isAdmin');
                // Doar redirecționăm dacă nu suntem deja pe pagina principală
                if (window.location.pathname !== '/') {
                    window.location.href = '/';
                }
            }
            
            // Eroare de autorizare
            if (error.response.status === 403) {
                // Nu mai redirecționăm automat, lăsăm componenta să gestioneze eroarea
                console.error('Access forbidden:', error.response.data.error);
            }
        }
        return Promise.reject(error);
    }
);

export default instance;
