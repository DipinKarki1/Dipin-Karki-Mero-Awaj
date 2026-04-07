import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import NoAdminRoute from "./components/NoAdminRoute.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import SignUp from "./pages/SignUp.jsx";
import Login from "./pages/Login.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Issues from "./pages/Issues.jsx";
import CreateIssue from "./pages/CreateIssue.jsx";
import Chats from "./pages/Chats.jsx";
import Awareness from "./pages/Awareness.jsx";
import Profile from "./pages/Profile.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

function App() {
  const location = useLocation();
  const hideNavbar = [
    "/login",
    "/signup",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
  ].includes(location.pathname);
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", storedTheme);
  }, []);
  return (
    <AuthProvider>
      <div style={{ fontFamily: "system-ui, Arial" }}>
        <Toaster
          position="top-center"
          gutter={12}
          containerStyle={{ margin: "8px" }}
          toastOptions={{
            success: { duration: 3000 },
            error: { duration: 5000 },
            style: {
              fontSize: "16px",
              maxWidth: "500px",
              padding: "16px 24px",
              backgroundColor: "var(--surface-2)",
              color: "var(--text-1)",
              border: "1px solid var(--border-2)",
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
            },
          }}
        />
        {!hideNavbar && <Navbar />}
        <div>
          <Routes>
            <Route
              path="/"
              element={
                <NoAdminRoute>
                  <Home />
                </NoAdminRoute>
              }
            />
            <Route
              path="/about"
              element={
                <NoAdminRoute>
                  <About />
                </NoAdminRoute>
              }
            />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route 
              path="/awareness" 
              element={
                <ProtectedRoute>
                  <Awareness />
                </ProtectedRoute>
              } 
            />

            {/* Protected Routes */}
            <Route 
              path="/issues" 
              element={
                <ProtectedRoute>
                  <Issues />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/issues/create" 
              element={
                <ProtectedRoute>
                  <CreateIssue />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chats" 
              element={
                <ProtectedRoute>
                  <NoAdminRoute>
                    <Chats />
                  </NoAdminRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chats/:ticketId" 
              element={
                <ProtectedRoute>
                  <NoAdminRoute>
                    <Chats />
                  </NoAdminRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
