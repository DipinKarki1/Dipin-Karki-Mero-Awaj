import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext.jsx";
import { API_BASE_URL } from "../config/api";

function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuthSession } = useAuth();

  const [email, setEmail] = useState(
    location.state?.email || localStorage.getItem("pendingEmail") || ""
  );
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email || !otp) return toast.error("Email and OTP are required");

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (data.success) {
        setAuthSession(data);
        localStorage.removeItem("pendingEmail");
        toast.success("Email verified successfully!");
        navigate("/");
      } else {
        toast.error(data.message || "Verification failed");
      }
    } catch (err) {
      console.error("Verify Email Error:", err);
      toast.error("Server connection failed. Is the backend running?");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) return toast.error("Email is required");
    setResending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "OTP sent");
      } else {
        toast.error(data.message || "Failed to resend OTP");
      }
    } catch (err) {
      console.error("Resend OTP Error:", err);
      toast.error("Server connection failed. Is the backend running?");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-48px)] flex items-center justify-center px-4 bg-gradient-to-br from-[#120406] via-[#1d080b] to-[#0a0203]">
      <div className="relative w-full max-w-xl bg-[#2b0f12]/80 backdrop-blur border border-[#4a1b1b] rounded-2xl shadow-2xl p-10">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/20 blur-3xl rounded-full"></div>

        <h1 className="text-3xl font-extrabold text-white text-center">Verify Your Email</h1>
        <p className="text-center text-gray-300 mt-3 text-base">
          We sent a 6-digit OTP to your email. Enter it below to continue.
        </p>

        <form onSubmit={handleVerify} className="mt-8 space-y-6">
          <div>
            <label className="text-gray-300 text-sm">Email Address</label>
            <input
              className="mt-2 w-full px-5 py-4 rounded-lg bg-[#3b1416] border border-[#5a1f21] text-white text-lg outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm">OTP Code</label>
            <input
              className="mt-2 w-full px-5 py-4 rounded-lg bg-[#3b1416] border border-[#5a1f21] text-white text-lg outline-none focus:ring-2 focus:ring-amber-500 tracking-[0.35em]"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              inputMode="numeric"
            />
          </div>

          <button
            className="w-full mt-4 px-6 py-4 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 transition-all duration-300 text-white text-lg font-bold tracking-wide"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-gray-400">
          <button
            className="text-amber-300 hover:text-amber-200"
            onClick={handleResend}
            disabled={resending}
            type="button"
          >
            {resending ? "Sending..." : "Resend code"}
          </button>
          <Link to="/login" className="text-gray-300 hover:text-white">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;

