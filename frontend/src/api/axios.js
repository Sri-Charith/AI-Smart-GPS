import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:4500/api',
});

// Add a request interceptor to include the admin token
instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default instance;
