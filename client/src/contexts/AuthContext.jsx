import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { API_BASE_URL, SOCKET_URL } from "../config/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user) {
      const newSocket = io(SOCKET_URL);
      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, [user]);

  const applyAuthSession = (data) => {
    if (!data?.user) return;
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
  };

  const login = async (email, password, role, name) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, name }),
      });
      const data = await res.json();
      if (data.success) {
        applyAuthSession(data);
        toast.success('Logged in successfully!');
        return { ok: true };
      }
      if (data.requiresVerification) {
        localStorage.setItem('pendingEmail', data.email || email);
        toast.error(data.message || 'Email not verified');
        return { ok: false, requiresVerification: true, email: data.email || email };
      }
      toast.error(data.message || 'Login failed');
      return { ok: false };
    } catch (err) {
      console.error('Login Error:', err);
      toast.error('Server connection failed. Is the backend running?');
      return { ok: false };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (data.success && data.requiresVerification) {
        localStorage.setItem('pendingEmail', data.email || userData.email);
        toast.success(data.message || 'Verification code sent');
        return { ok: true, requiresVerification: true, email: data.email || userData.email };
      }
      if (data.success) {
        applyAuthSession(data);
        toast.success('Account created successfully!');
        return { ok: true };
      }
      toast.error(data.message || 'Signup failed');
      return { ok: false };
    } catch (err) {
      console.error('Signup Error:', err);
      toast.error('Server connection failed. Is the backend running?');
      return { ok: false };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast.success('Logged out');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user,
      socket,
      login,
      signup,
      logout,
      updateUser,
      setAuthSession: applyAuthSession,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // Return mock values if provider is missing to avoid crashes
    return {
      user: { id: 1, name: "User" },
      socket: { on: () => {}, off: () => {}, emit: () => {} },
      updateUser: () => {},
      setAuthSession: () => {},
    };
  }
  return context;
}


