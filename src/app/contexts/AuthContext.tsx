import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  company: string;
  avatar?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, company: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── API helpers ───────────────────────────────────────────────────────────────
async function apiLogin(email: string, password: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Invalid email or password");
  }
  return res.json() as Promise<{ user: User; token: string }>;
}

async function apiSignup(email: string, password: string, name: string, company: string) {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name, company }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Signup failed");
  }
  return res.json() as Promise<{ user: User; token: string }>;
}

async function apiUpdateProfile(token: string, data: Partial<User>) {
  const res = await fetch("/api/auth/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json() as Promise<User>;
}

// Token validation: decode our simple base64 token from backend
function isTokenValid(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token));
    return payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session
  useEffect(() => {
    const storedToken = localStorage.getItem("devdoc_token");
    const storedUser = localStorage.getItem("devdoc_user");
    if (storedToken && storedUser && isTokenValid(storedToken)) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { user, token } = await apiLogin(email, password);
    setUser(user);
    setToken(token);
    localStorage.setItem("devdoc_token", token);
    localStorage.setItem("devdoc_user", JSON.stringify(user));
  };

  const signup = async (email: string, password: string, name: string, company: string) => {
    const { user, token } = await apiSignup(email, password, name, company);
    setUser(user);
    setToken(token);
    localStorage.setItem("devdoc_token", token);
    localStorage.setItem("devdoc_user", JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("devdoc_token");
    localStorage.removeItem("devdoc_user");
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user || !token) return;
    try {
      const updated = await apiUpdateProfile(token, data);
      setUser(updated);
      localStorage.setItem("devdoc_user", JSON.stringify(updated));
    } catch {
      // Fallback: update locally if backend fails
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem("devdoc_user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signup,
        logout,
        updateProfile,
        isAuthenticated: !!user && !!token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
