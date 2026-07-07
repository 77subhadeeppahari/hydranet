import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("hn_token");
    if (!token) { setLoading(false); return; }
    // Always fetch /auth/me on load — it returns the authoritative role from DB
    api.get("/auth/me")
      .then(({ data }) => setAdmin({ username: data.username, recovery_email: data.recovery_email, role: data.role || "admin" }))
      .catch(() => { localStorage.removeItem("hn_token"); setAdmin(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const { data } = await api.post("/auth/login", { username, password });
    localStorage.setItem("hn_token", data.access_token);
    // Use role from login response directly — no extra round-trip needed
    setAdmin({ username: data.username, recovery_email: data.recovery_email, role: data.role || "admin" });
    return data;
  };

  const logout = () => {
    localStorage.removeItem("hn_token");
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
