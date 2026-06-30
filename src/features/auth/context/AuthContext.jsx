"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "@/features/auth/services/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children, initialUser = null }) {
  const [user, setUser] = useState(initialUser);
  const [isLoading, setIsLoading] = useState(!initialUser);

  useEffect(() => {
    authApi
      .me()
      .then((data) => {
        setUser(data.user ?? data);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  async function login(email, password) {
    const result = await authApi.login({ email, password });
    setUser(result.user ?? result);
    return result;
  }

  async function register(name, email, password) {
    const result = await authApi.register({ name, email, password });
    setUser(result.user ?? result);
    return result;
  }

  async function loginWithGoogle(credential) {
    const result = await authApi.google(credential);
    setUser(result.user ?? result);
    return result;
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch {
      // server call failed — still clear client state
    }
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, loginWithGoogle }}
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