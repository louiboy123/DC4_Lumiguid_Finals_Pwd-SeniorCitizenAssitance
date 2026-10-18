import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get('/auth/user');
                setUser(res.data);
            } catch {
                logout();
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const login = async ({ email, password }) => {
        const res = await api.post('/auth/login', { email, password });
        setAuth(res.data.token, res.data.user);
        return res.data;
    };

    const register = async (details) => {
        const res = await api.post('/auth/register', {
            ...details,
            password_confirmation: details.password,
        });
        setAuth(res.data.token, res.data.user);
        return res.data;
    };

    const setAuth = (tokenValue, userValue) => {
        localStorage.setItem('token', tokenValue);
        localStorage.setItem('user', JSON.stringify(userValue));
        setToken(tokenValue);
        setUser(userValue);
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch {}
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const me = async () => {
        const res = await api.get('/auth/user');
        setUser(res.data);
        return res.data;
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, me }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
