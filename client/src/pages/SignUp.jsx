import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import toast from "react-hot-toast";

function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    if (!name || !email || !password) return toast.error("All fields required");
    const result = await signup({ name, email, password });
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
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-700/20 blur-3xl rounded-full"></div>

        {/* Header */}
        <h1 className="text-4xl font-extrabold text-white text-center">
          Join Mero Awaj
        </h1>
        <p className="text-center text-gray-300 mt-3 text-lg">
          Speak up for your community. Be the change.
        </p>

        {/* Form */}
        <form onSubmit={onSubmit} className="mt-10 space-y-6">
          <div>
            <label className="text-gray-300 text-sm">Full Name</label>
            <input
              className="mt-2 w-full px-5 py-4 rounded-lg bg-[#3b1416] border border-[#5a1f21] text-white text-lg outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm">Email Address</label>
            <input
              className="mt-2 w-full px-5 py-4 rounded-lg bg-[#3b1416] border border-[#5a1f21] text-white text-lg outline-none focus:ring-2 focus:ring-red-600"
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
                className="w-full px-5 py-4 pr-14 rounded-lg bg-[#3b1416] border border-[#5a1f21] text-white text-lg outline-none focus:ring-2 focus:ring-red-600"
                placeholder="Create a strong password"
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
          </div>

          {/* CTA Button */}
          <button
            className="w-full mt-4 px-6 py-4 rounded-lg 
                       bg-gradient-to-r from-red-700 to-red-600 
                       hover:from-red-600 hover:to-red-500 
                       transition-all duration-300
                       text-white text-lg font-bold tracking-wide shadow-lg"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Your Voice 🔥"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400">
          <p className="text-sm">
            Already part of Mero Awaj?
            <Link
              to="/login"
              className="ml-2 text-violet-400 hover:text-violet-300 font-medium"
            >
              Login here
            </Link>
          </p>

          <p className="mt-3 text-xs text-gray-500">
            Together, we raise voices that matter.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
