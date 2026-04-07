import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Email is required");

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/password/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("pendingResetEmail", email);
        toast.success(data.message || "OTP sent to your email");
        navigate("/reset-password", { state: { email } });
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Forgot Password Error:", err);
      toast.error("Server connection failed. Is the backend running?");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-48px)] flex items-center justify-center px-4 bg-gradient-to-br from-[#120406] via-[#1d080b] to-[#0a0203]">
      <div className="relative w-full max-w-xl bg-[#2b0f12]/80 backdrop-blur border border-[#4a1b1b] rounded-2xl shadow-2xl p-10">
        <div className="absolute -bottom-12 -right-10 w-40 h-40 bg-cyan-500/20 blur-3xl rounded-full"></div>

        <h1 className="text-3xl font-extrabold text-white text-center">Reset Password</h1>
        <p className="text-center text-gray-300 mt-3 text-base">
          Enter your email and we will send a one-time code.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="text-gray-300 text-sm">Email Address</label>
            <input
              className="mt-2 w-full px-5 py-4 rounded-lg bg-[#3b1416] border border-[#5a1f21] text-white text-lg outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            className="w-full mt-4 px-6 py-4 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 transition-all duration-300 text-white text-lg font-bold tracking-wide"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Sending..." : "Send OTP"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-gray-300 hover:text-white">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;

