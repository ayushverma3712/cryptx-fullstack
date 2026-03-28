// client/src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../utils/api";

const Ctx = createContext();
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem("cx_user")); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // Sync user to localStorage
  const saveUser = u => {
    setUser(u);
    if (u) localStorage.setItem("cx_user", JSON.stringify(u));
    else   localStorage.removeItem("cx_user");
  };

  // Re-fetch fresh profile from server
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("cx_token");
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await api.get("/auth/me");
      saveUser(data.user);
    } catch {
      localStorage.removeItem("cx_token");
      saveUser(null);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  // ── Actions ────────────────────────────────────────────────
  async function register(fullName, email, password) {
    const { data } = await api.post("/auth/register", { fullName, email, password });
    localStorage.setItem("cx_token", data.token);
    await refreshUser();
    return data;
  }

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("cx_token", data.token);
    saveUser(data.user);
    return data;
  }

  function logout() {
    localStorage.removeItem("cx_token");
    saveUser(null);
  }

  async function verifyOTP(otp) {
    const { data } = await api.post("/auth/verify-otp", { otp });
    await refreshUser();
    return data;
  }

  async function resendOTP() {
    const { data } = await api.post("/auth/resend-otp");
    return data;
  }

  async function forgotPassword(email) {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
  }

  async function resetPassword(token, password) {
    const { data } = await api.post("/auth/reset-password", { token, password });
    return data;
  }

  async function changePassword(currentPassword, newPassword) {
    const { data } = await api.post("/auth/change-password", { currentPassword, newPassword });
    return data;
  }

  async function updateProfile(fullName) {
    const { data } = await api.put("/auth/profile", { fullName });
    saveUser(prev => ({ ...prev, fullName: data.fullName, avatarInitials: data.avatarInitials }));
    return data;
  }

  // Called after crypto operation to update local stats
  function bumpStats(type, bytes) {
    setUser(prev => {
      if (!prev) return prev;
      const field = type === "encrypt" ? "totalEncryptions" : "totalDecryptions";
      const updated = {
        ...prev,
        [field]: (prev[field] || 0) + 1,
        totalBytesProcessed: (prev.totalBytesProcessed || 0) + bytes,
      };
      localStorage.setItem("cx_user", JSON.stringify(updated));
      return updated;
    });
  }

  return (
    <Ctx.Provider value={{ user, loading, register, login, logout, verifyOTP, resendOTP, forgotPassword, resetPassword, changePassword, updateProfile, refreshUser, bumpStats }}>
      {children}
    </Ctx.Provider>
  );
}
