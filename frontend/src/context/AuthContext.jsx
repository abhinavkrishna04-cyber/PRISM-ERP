import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Set axios default base URL (fallbacks to localhost if env var missing)
    axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    useEffect(() => {
        const token = localStorage.getItem("prism_token");
        const storedUser = localStorage.getItem("prism_user");

        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            fetchPermissions();
        }
        setLoading(false);
    }, []);

    const fetchPermissions = async () => {
        try {
            const res = await axios.get("/api/auth/permissions");
            setPermissions(res.data);
        } catch (error) {
            console.error("Failed to fetch permissions", error);
        }
    };

    const authenticate = async (url, data) => {
        try {
            const res = await axios.post(url, data);
            const { token, _id, name, role, email: userEmail } = res.data;
            
            const userData = { id: _id, name, role, email: userEmail };
            
            localStorage.setItem("prism_token", token);
            localStorage.setItem("prism_user", JSON.stringify(userData));
            
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            setUser(userData);
            await fetchPermissions();
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.message || "Authentication failed" 
            };
        }
    };

    const login = (email, password) => authenticate("/api/auth/login", { email, password });
    
    const register = (name, email, password, role, companyName) => 
        authenticate("/api/auth/register", { name, email, password, role, companyName });

    const forgotPassword = async (email) => {
        try {
            const res = await axios.post("/api/auth/forgot-password", { email });
            return { success: true, data: res.data };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.message || "Error sending reset link" 
            };
        }
    };

    const getCompanies = async () => {
        try {
            const res = await axios.get("/api/auth/companies");
            return { success: true, data: res.data };
        } catch (error) {
            return { success: false, error: "Failed to fetch companies" };
        }
    };

    const hasPermission = (moduleName, action = 'view') => {
        if (user?.role === 'Admin') return true;
        const perm = permissions.find(p => p.module === moduleName);
        return perm ? perm[`can_${action}`] : false;
    };

    const logout = () => {
        localStorage.removeItem("prism_token");
        localStorage.removeItem("prism_user");
        delete axios.defaults.headers.common["Authorization"];
        setUser(null);
        setPermissions([]);
    };

    return (
        <AuthContext.Provider value={{ user, permissions, hasPermission, login, register, logout, forgotPassword, getCompanies, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
