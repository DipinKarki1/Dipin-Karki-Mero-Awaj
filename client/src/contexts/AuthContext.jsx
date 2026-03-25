import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user) {
      const newSocket = io("http://localhost:5000");
      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, [user]);

  const login = async (email, password, role, name) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, name }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        toast.success('Logged in successfully!');
        return true;
      } else {
        toast.error(data.message || 'Login failed');
        return false;
      }
    } catch (err) {
      console.error('Login Error:', err);
      toast.error('Server connection failed. Is the backend running?');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        toast.success('Account created successfully!');
        return true;
      } else {
        toast.error(data.message || 'Signup failed');
        return false;
      }
    } catch (err) {
      console.error('Signup Error:', err);
      toast.error('Server connection failed. Is the backend running?');
      return false;
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
    <AuthContext.Provider value={{ user, socket, login, signup, logout, updateUser, loading }}>
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
    };
  }
  return context;
}
