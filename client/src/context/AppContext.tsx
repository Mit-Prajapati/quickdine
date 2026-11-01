/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api.ts";
import toast from "react-hot-toast";

<<<<<<< HEAD
=======

>>>>>>> fde275601113eba676e52f741dcc60d1a94ad995
interface UserType {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: "user" | "admin" | "owner";
}

interface AppContextType {
    user: UserType | null;
    token: string | null;
    loading: boolean;
    isAuthenticated: boolean;
    isAuthModalOpen: boolean;
    setAuthModalOpen: (open: boolean) => void;
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string, phone?: string, role?: string) => Promise<boolean>;
    logout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

interface Props {
    children: React.ReactNode;
}

export const AppContextProvider = ({ children }: Props) => {
    const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

    const [user, setUser] = useState<UserType | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const [loading, setLoading] = useState<boolean>(true);
    const [isAuthModalOpen, setAuthModalOpen] = useState<boolean>(false);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            setLoading(true);
            const res = await api.post("/auth/login",{email,password});
            const {token:UserToken, ...userData} = res.data;
            localStorage.setItem("token",UserToken)
            setToken(UserToken)
            setUser(userData)
            toast.success(`Welcome Back ${userData.name}`)
            return true;
        } catch (error:any) {
            toast.error(error?.response?.data?.message || error?.message )
            return false;
        }finally{
            setLoading(false);
        }
    };


    //   const login = async (email: string, password: string): Promise<boolean> => {
    //     try {
    //         setLoading(true);
    //         const res = await api.post("/auth/login",{email,password});
    //         const {token:UserToken, ...userData} = res.data;
    //         localStorage.setItem("token",UserToken)
    //         setToken(UserToken)
    //         setUser(userData)
    //         toast.success(`Welcome Back ${userData.name}`)
    //         return true;
    //     } catch (error:any) {
    //         toast.error(error?.response?.data?.message || error?.message )
    //         return false;
    //     }finally{
    //         setLoading(false);
    //     }
    // };
    













    const register = async (name: string, email: string, password: string, phone?: string, role?: string): Promise<boolean> => {
            try {
            setLoading(true);
            const res = await api.post("/auth/ragister",{name,email,password,phone,role});
            const {token:UserToken, ...userData} = res.data;
            localStorage.setItem("token",UserToken)
            setToken(UserToken)
            setUser(userData)
            toast.success(`Welcome Quick Dine Club ${userData.name}`)
            return true;
        } catch (error:any) {
            toast.error(error?.response?.data?.message || error?.message )
            return false;
        }finally{
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        window.location.href = "/";
    };

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const res = await api.get("/auth/me")
                    setUser(res.data)
                } catch (error:any) {
                    toast.error(error?.response?.data?.message || error?.message )
                    if (error?.response?.status === 401) {
                        localStorage.removeItem("token");
                        setToken(null);
                        setUser(null);
                    }
                }
            }
            setLoading(false);
        };
        loadUser();
    }, [token]);

    const value: AppContextType = {
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAuthModalOpen,
        setAuthModalOpen,
        login,
        register,
        logout,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within AppContextProvider");
    }
    return context;
};
