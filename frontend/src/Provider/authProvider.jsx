import { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useLocation } from "wouter";
import { AuthContext } from "@/context/authContext";
import { apiRequest } from "@/lib/api";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  // fetch user on mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await apiRequest("GET", "/api/auth/user");
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, []);

  // login
  const login = useCallback(
    async (payload) => {
      try {
        const data = await apiRequest("POST", "/api/auth/login", payload);
        setUser(data.user);
        toast.success("Signed in successfully");
        setLocation("/");
      } catch (err) {
        toast.error(err.message || "Login failed");
      }
    },
    [setLocation]
  );

  // register
  const register = useCallback(
    async (payload) => {
      try {
        const data = await apiRequest("POST", "/api/auth/register", payload);
        setUser(data.user);
        toast.success("Account created");
        setLocation("/");
      } catch (err) {
        toast.error(err.message || "Registration failed");
      }
    },
    [setLocation]
  );

  // logout
  const logout = useCallback(async () => {
    try {
      await apiRequest("GET", "/api/auth/logout");
      setUser(null);
      toast.success("Signed out");
      setLocation("/");
    } catch (err) {
      toast.error(err.message || "Logout failed");
    }
  }, [setLocation]);

  const value = {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
