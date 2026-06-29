"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "@/features/auth/services/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("mp_token");
    if (!stored) {
      setIsLoading(false);
      return;
    }
    // Token exists — verify it is still valid
    authApi
      .me()
      .then((userData) => {
        setUser(userData);
        setToken(stored);
      })
      .catch(() => {
        // Expired / invalid token — clear it
        localStorage.removeItem("mp_token");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  async function login(email, password) {
    const result = await authApi.login({ email, password });
    localStorage.setItem("mp_token", result.token);
    setToken(result.token);
    setUser(result.user ?? result);
    return result;
  }

  async function register(name, email, password) {
    const result = await authApi.register({ name, email, password });
    localStorage.setItem("mp_token", result.token);
    setToken(result.token);
    setUser(result.user ?? result);
    return result;
  }
  async function loginWithGoogle(credential) {
    const result = await authApi.google(credential);
    localStorage.setItem("mp_token", result.token);
    setToken(result.token);
    setUser(result.user ?? result);
    return result;
  }

  function logout() {
    localStorage.removeItem("mp_token");
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout , loginWithGoogle}}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
