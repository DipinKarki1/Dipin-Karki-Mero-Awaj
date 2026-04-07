import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import toast from "react-hot-toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("user");
  const [authorityName, setAuthorityName] = useState("");
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    if (!email || !password) return toast.error("All fields required");
    if (role === "authority" && !authorityName.trim()) {
      return toast.error("Authority name is required");
    }
    const result = await login(
      email,
      password,
      role,
      role === "authority" ? authorityName.trim() : undefined
    );
    if (result?.requiresVerification) {
      navigate("/verify-email", { state: { email: result.email || email } });
      return;
    }
    if (result?.ok) {
      navigate("/");
    }
  }

  return (
    <div className="min-h-[calc(100vh-48px)] flex items-center justify-center px-4 bg-gradient-to-br from-[#120406] via-[#1d080b] to-[#0a0203]">
      <div className="relative w-full max-w-xl bg-[#2b0f12]/80 backdrop-blur border border-[#4a1b1b] rounded-2xl shadow-2xl p-10">
      
        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-700/20 blur-3xl rounded-full"></div>

        {/* Header */}
        <h1 className="text-4xl font-extrabold text-white text-center">
          Mero Awaj
        </h1>
        <p className="text-center text-gray-300 mt-3 text-lg">
          Your voice matters. Share problems. Create change.
        </p>

        {/* Form */}
        <form onSubmit={onSubmit} className="mt-10 space-y-6">
          <div>
            <label className="text-gray-300 text-sm">Email Address</label>
            <input
              className="mt-2 w-full px-5 py-4 rounded-lg bg-[#3b1416] border border-[#5a1f21] text-white text-lg outline-none focus:ring-2 focus:ring-violet-600"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm">Password</label>
            <div className="relative mt-2">
              <input
                className="w-full px-5 py-4 pr-14 rounded-lg bg-[#3b1416] border border-[#5a1f21] text-white text-lg outline-none focus:ring-2 focus:ring-violet-600"
                placeholder="********"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3l18 18"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.477 10.48a3 3 0 104.243 4.243"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.88 5.1A9.964 9.964 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.957 9.957 0 01-4.16 5.34"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.228 6.228A9.957 9.957 0 002.458 12c1.274 4.057 5.064 7 9.542 7 1.6 0 3.124-.376 4.47-1.044"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15a3 3 0 100-6 3 3 0 000 6z"
                    />
                  </svg>
                )}
              </button>
            </div>
            <div className="mt-2 text-right">
              <Link
                to="/forgot-password"
                className="text-xs text-violet-300 hover:text-violet-200"
              >
                Forgot password?
              </Link>
            </div>
          </div>
          {role === "authority" && (
            <div>
              <label className="text-gray-300 text-sm">Authority Name</label>
              <input
                className="mt-2 w-full px-5 py-4 rounded-lg bg-[#3b1416] border border-[#5a1f21] text-white text-lg outline-none focus:ring-2 focus:ring-violet-600"
                placeholder="E.g., Road Department"
                value={authorityName}
                onChange={(e) => setAuthorityName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="text-gray-300 text-sm">Login As</label>
            <select
              className="mt-2 w-full px-5 py-4 rounded-lg bg-[#3b1416] border border-[#5a1f21] text-white text-lg outline-none focus:ring-2 focus:ring-violet-600"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">User</option>
              <option value="authority">Authority</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            className="w-full mt-4 px-6 py-4 rounded-lg 
                      bg-red-700 hover:bg-red-600 
                      transition text-white text-lg font-semibold tracking-wide"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Raise Your Voice 🚨"}
          </button>

        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400">
          <p className="text-sm">
            New to Mero Awaj?
            <Link
              to="/signup"
              className="ml-2 text-violet-400 hover:text-violet-300 font-medium"
            >
              Create an account
            </Link>
          </p>

          <p className="mt-3 text-xs text-gray-500">
            Speak up for society. Together, we make a difference.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
