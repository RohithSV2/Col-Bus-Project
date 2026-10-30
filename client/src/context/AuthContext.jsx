import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/auth/me");
      if (res.data.success) {
        setUser(res.data.user);
        setPass(res.data.pass);
        setUnreadNotifications(res.data.unreadNotifications || 0);
      }
    } catch (err) {
      // Session not active
      setUser(null);
      setPass(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    if (res.data.success) {
      localStorage.setItem("smartbus_token", res.data.token);
      setUser(res.data.user);
      setPass(res.data.pass);
      return res.data;
    }
    throw new Error(res.data.message || "Login failed");
  };

  const register = async (formData) => {
    const res = await api.post("/auth/register", formData);
    if (res.data.success) {
      localStorage.setItem("smartbus_token", res.data.token);
      setUser(res.data.user);
      setPass(res.data.pass);
      return res.data;
    }
    throw new Error(res.data.message || "Registration failed");
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      // ignore
    }
    localStorage.removeItem("smartbus_token");
    setUser(null);
    setPass(null);
  };

  const quickLogin = async (role = "admin") => {
    const accounts = {
      admin: { email: "admin@smartbus.edu", password: "Admin@123" },
      conductor: { email: "conductor@smartbus.edu", password: "Conductor@123" },
      student_active: { email: "rahul@college.edu", password: "Student@123" },
      student_pending: { email: "ananya@college.edu", password: "Student@123" },
      student_expired: { email: "arjun@college.edu", password: "Student@123" },
      student_suspended: { email: "priya@college.edu", password: "Student@123" },
    };

    const target = accounts[role] || accounts.admin;
    return await login(target.email, target.password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        pass,
        loading,
        unreadNotifications,
        setUser,
        setPass,
        login,
        register,
        logout,
        quickLogin,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
