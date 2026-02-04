import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:4500/api',
});

// Add a request interceptor to include the appropriate token
instance.interceptors.request.use((config) => {
    const roles = ['admin', 'student', 'department', 'guard'];
    let token = null;

    for (const role of roles) {
        const t = localStorage.getItem(`${role}Token`);
        if (t) {
            token = t;
            break;
        }
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default instance;
