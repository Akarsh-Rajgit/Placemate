import React, { createContext, useState, useContext, useEffect } from "react";
import apiClient from "../api/apiClient";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("authToken");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post("/api/auth/login", {
        email,
        password,
      });
      const { user: userData, token } = response.data;

      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.detail || "Login failed";
      return { success: false, error: message };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const response = await apiClient.post("/api/auth/register", {
        name,
        email,
        password,
        role,
      });
      const { user: userData, token } = response.data;

      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.detail || "Registration failed";
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
