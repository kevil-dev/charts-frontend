"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi } from "@/features/auth/services/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children, initialUser = null }) {
  const [user, setUser] = useState(initialUser);
  const [isLoading, setIsLoading] = useState(!initialUser);

  const refetchUser = useCallback(async function refetchUser() {
    try {
      const data = await authApi.me();
      setUser(data.user ?? data);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refetchUser().finally(() => setIsLoading(false));
  }, []);

  async function login(email, password) {
    await authApi.login({ email, password });
    await refetchUser();
  }

  async function register(name, email, password) {
    await authApi.register({ name, email, password });
    await refetchUser();
  }

  async function loginWithGoogle(credential) {
    await authApi.google(credential);
    await refetchUser();
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
      value={{ user, isLoading, login, register, logout, loginWithGoogle, refetchUser }}
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
