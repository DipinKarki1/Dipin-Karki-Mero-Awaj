import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext.jsx";
import { API_BASE_URL } from "../config/api";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!profileData.name || !profileData.email) {
      return toast.error("Name and email are required");
    }

    setSavingProfile(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (data.success) {
        updateUser(data.user);
        toast.success("Profile updated");
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err) {
      toast.error("Server error. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      return toast.error("Please fill all password fields");
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("New passwords do not match");
    }

    setSavingPassword(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/me/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Password updated");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(data.message || "Failed to update password");
      }
    } catch (err) {
      toast.error("Server error. Please try again.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 grid gap-6">
      <div className="bg-[#2b0f12]/80 border border-[#4a1b1b] rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Profile</h2>
        <form onSubmit={saveProfile} className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm text-gray-300">Username</label>
            <input
              name="name"
              value={profileData.name}
              onChange={handleProfileChange}
              className="px-4 py-3 rounded-md bg-[#3b1416] border border-[#5a1f21] text-white text-sm outline-none"
              placeholder="Your name"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-gray-300">Email</label>
            <input
              name="email"
              type="email"
              value={profileData.email}
              onChange={handleProfileChange}
              className="px-4 py-3 rounded-md bg-[#3b1416] border border-[#5a1f21] text-white text-sm outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-3 rounded-md bg-[#9A0D1B] hover:bg-[#7A0A15] transition text-white text-sm font-semibold disabled:opacity-50"
            >
              {savingProfile ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-[#2b0f12]/80 border border-[#4a1b1b] rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Change Password</h2>
        <form onSubmit={savePassword} className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm text-gray-300">Current Password</label>
            <input
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className="px-4 py-3 rounded-md bg-[#3b1416] border border-[#5a1f21] text-white text-sm outline-none"
              placeholder="Current password"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-gray-300">New Password</label>
            <input
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="px-4 py-3 rounded-md bg-[#3b1416] border border-[#5a1f21] text-white text-sm outline-none"
              placeholder="New password"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-gray-300">Confirm New Password</label>
            <input
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className="px-4 py-3 rounded-md bg-[#3b1416] border border-[#5a1f21] text-white text-sm outline-none"
              placeholder="Confirm new password"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={savingPassword}
              className="px-5 py-3 rounded-md bg-[#3b1416] text-white hover:bg-[#4a1b1b] transition text-sm font-semibold disabled:opacity-50"
            >
              {savingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

