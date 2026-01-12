import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

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
  const [token, setToken] = useState(localStorage.getItem("accessToken"));

  //set axios default headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  //check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("accessToken");
      if (storedToken) {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/profile`,
            {
              headers: { Authorization: `Bearer ${storedToken}` },
            }
          );
          setUser(response.data.user);
          setToken(storedToken);
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const register = async (email, password, username, role = "user") => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/register`,
        {
          email,
          password,
          username,
          role,
        }
      );

      console.log("Registration response:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Registration error:", error);
      console.error("Error response:", error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || "Registration failed",
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        {
          email,
          password,
        }
      );

      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      setToken(accessToken);
      setUser(user);

      console.log("Login successful:", user);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      console.error("Error response:", error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
