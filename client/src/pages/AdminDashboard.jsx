import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext.jsx";
import { API_BASE_URL } from "../config/api";

const CATEGORY_OPTIONS = ["Road", "Water", "Electricity"];

export default function AdminDashboard() {
  const { user: currentUser } = useAuth();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [edits, setEdits] = useState({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const [overviewRes, usersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/admin/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/v1/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const overviewData = await overviewRes.json();
      const usersData = await usersRes.json();

      if (overviewData.success) {
        setOverview(overviewData.data);
      } else {
        toast.error(overviewData.message || "Failed to load overview");
      }

      if (usersData.success) {
        setUsers(usersData.data);
        const initialEdits = {};
        usersData.data.forEach((u) => {
          initialEdits[u._id] = {
            name: u.name || "",
            email: u.email || "",
          };
        });
        setEdits(initialEdits);
      } else {
        toast.error(usersData.message || "Failed to load users");
      }
    } catch (err) {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      return (
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q) ||
        u.authorityCategory?.toLowerCase().includes(q)
      );
    });
  }, [users, query]);

  const authorityUsers = useMemo(() => {
    return users.filter((u) => u.role === "authority");
  }, [users]);

  const authorityCounts = useMemo(() => {
    const counts = CATEGORY_OPTIONS.reduce((acc, cat) => {
      acc[cat] = 0;
      return acc;
    }, {});
    authorityUsers.forEach((u) => {
      if (u.authorityCategory && counts[u.authorityCategory] !== undefined) {
        counts[u.authorityCategory] += 1;
      }
    });
    return counts;
  }, [authorityUsers]);

  const handleFieldChange = (id, field, value) => {
    setEdits((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSave = async (userId) => {
    const edit = edits[userId];
    if (!edit) return;

    setUpdatingId(userId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: edit.name,
          email: edit.email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("User updated");
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId
              ? {
                  ...u,
                  name: data.data.name,
                  email: data.data.email,
                  role: data.data.role,
                  authorityCategory: data.data.authorityCategory,
                  civicPoints: data.data.civicPoints,
                  rank: data.data.rank,
                }
              : u
          )
        );
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (userId) => {
    const target = users.find((u) => u._id === userId);
    if (!target) return;
    const confirmDelete = window.confirm(
      `Delete ${target.name || "this user"} (${target.email})? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    setDeletingId(userId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("User deleted");
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        setEdits((prev) => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const counts = overview?.counts || {};

  return (
    <div className="bg-gradient-to-br from-[#120406] via-[#1d080b] to-[#0a0203] p-6 rounded-xl shadow-xl max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 p-5 border border-[#4a1b1b] rounded-xl bg-[#2b0f12]/70">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Command Center</h1>
          <p className="text-gray-300 mt-2">
            Monitor civic issues, manage users and authorities, and prioritize urgent cases.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="self-start lg:self-auto px-4 py-2 rounded-lg bg-[#9A0D1B] hover:bg-[#7A0A15] transition text-white font-semibold"
        >
          Refresh Data
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-white">Loading admin dashboard...</div>
      ) : (
        <>
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#2b0f12]/80 border border-[#4a1b1b] rounded-2xl p-5 text-white">
              <p className="text-xs uppercase tracking-widest text-gray-400">Total Users</p>
              <p className="text-3xl font-bold mt-2">{counts.totalUsers || 0}</p>
            </div>
            <div className="bg-[#2b0f12]/80 border border-[#4a1b1b] rounded-2xl p-5 text-white">
              <p className="text-xs uppercase tracking-widest text-gray-400">Authorities</p>
              <p className="text-3xl font-bold mt-2">{counts.totalAuthorities || 0}</p>
            </div>
            <div className="bg-[#2b0f12]/80 border border-[#4a1b1b] rounded-2xl p-5 text-white">
              <p className="text-xs uppercase tracking-widest text-gray-400">Admins</p>
              <p className="text-3xl font-bold mt-2">{counts.totalAdmins || 0}</p>
            </div>
            <div className="bg-[#2b0f12]/80 border border-[#4a1b1b] rounded-2xl p-5 text-white">
              <p className="text-xs uppercase tracking-widest text-gray-400">Total Issues</p>
              <p className="text-3xl font-bold mt-2">{counts.totalIssues || 0}</p>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#2b0f12]/80 border border-[#4a1b1b] rounded-2xl p-5 text-white">
              <h2 className="text-lg font-bold mb-4">Issue Status</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Open</span>
                  <span className="font-semibold text-red-300">{counts.openIssues || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">In Progress</span>
                  <span className="font-semibold text-yellow-300">{counts.inProgressIssues || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Resolved</span>
                  <span className="font-semibold text-green-300">{counts.resolvedIssues || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#2b0f12]/80 border border-[#4a1b1b] rounded-2xl p-5 text-white lg:col-span-2">
              <h2 className="text-lg font-bold mb-4">Top Priority Issues (Most Votes)</h2>
              {overview?.topIssues?.length ? (
                <div className="space-y-3">
                  {overview.topIssues.map((issue) => (
                    <div
                      key={issue._id}
                      className="flex items-center justify-between bg-[#3b1416]/60 border border-[#5a1f21] rounded-xl p-3"
                    >
                      <div>
                        <p className="font-semibold">{issue.title}</p>
                        <p className="text-xs text-gray-400">
                          {issue.category} - {issue.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-300">Votes</p>
                        <p className="text-xl font-bold text-red-300">{issue.voteCount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No voting data yet.</p>
              )}
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#2b0f12]/80 border border-[#4a1b1b] rounded-2xl p-5 text-white">
              <h2 className="text-lg font-bold mb-4">Recent Issues</h2>
              {overview?.recentIssues?.length ? (
                <div className="space-y-3">
                  {overview.recentIssues.map((issue) => (
                    <div
                      key={issue._id}
                      className="flex items-center justify-between border-b border-[#4a1b1b] pb-2"
                    >
                      <div>
                        <p className="font-semibold">{issue.title}</p>
                        <p className="text-xs text-gray-400">{issue.category}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No issues reported yet.</p>
              )}
            </div>

            <div className="bg-[#2b0f12]/80 border border-[#4a1b1b] rounded-2xl p-5 text-white">
              <h2 className="text-lg font-bold mb-4">Authority Coverage</h2>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORY_OPTIONS.map((cat) => (
                  <div
                    key={cat}
                    className="bg-[#3b1416]/60 border border-[#5a1f21] rounded-xl p-3"
                  >
                    <p className="text-xs uppercase tracking-widest text-gray-400">{cat}</p>
                    <p className="text-2xl font-bold mt-2">{authorityCounts[cat] || 0}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Keep authority coverage balanced so each issue category has dedicated responders.
              </p>
            </div>
          </section>

          <section className="bg-[#2b0f12]/80 border border-[#4a1b1b] rounded-2xl p-5 text-white mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-bold">Authority Management</h2>
                <p className="text-sm text-gray-400">
                  Review active authority accounts and their assigned categories.
                </p>
              </div>
            </div>
            {authorityUsers.length === 0 ? (
              <p className="text-gray-400">No authority accounts found.</p>
            ) : (
              <div className="space-y-3">
                {authorityUsers.map((auth) => (
                  <div
                    key={auth._id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-[#3b1416]/60 border border-[#5a1f21] rounded-xl p-4"
                  >
                    <div>
                      <p className="font-semibold">{auth.name}</p>
                      <p className="text-xs text-gray-400">{auth.email}</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="px-3 py-1 rounded-full bg-[#1D0515] border border-[#4a1b1b]">
                        {auth.authorityCategory || "Unassigned"}
                      </span>
                      <span className="text-gray-400 text-xs">
                        Joined {new Date(auth.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-[#2b0f12]/80 border border-[#4a1b1b] rounded-2xl p-5 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-bold">User Management</h2>
                <p className="text-sm text-gray-400">
                  Control roles, authority assignments, and verify trusted responders.
                </p>
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email, role..."
                className="w-full md:w-72 px-4 py-2 rounded-lg bg-[#1D0515] border border-[#4a1b1b] text-white placeholder:text-gray-500"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-[#4a1b1b] text-gray-400">
                    <th className="py-3 pr-4">Name</th>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Role</th>
                    <th className="py-3 pr-4">Category</th>
                    <th className="py-3 pr-4">Points</th>
                    <th className="py-3 pr-4">Rank</th>
                    <th className="py-3 pr-4">Action</th>
                    <th className="py-3 pr-4">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const edit = edits[u._id] || {
                      name: u.name || "",
                      email: u.email || "",
                    };
                    return (
                      <tr key={u._id} className="border-b border-[#3b1416]">
                        <td className="py-3 pr-4">
                          <input
                            className="bg-[#1D0515] border border-[#4a1b1b] rounded-md px-2 py-1 text-white w-40"
                            value={edit.name}
                            onChange={(e) => handleFieldChange(u._id, "name", e.target.value)}
                          />
                        </td>
                        <td className="py-3 pr-4">
                          <input
                            className="bg-[#1D0515] border border-[#4a1b1b] rounded-md px-2 py-1 text-white w-52"
                            value={edit.email}
                            onChange={(e) => handleFieldChange(u._id, "email", e.target.value)}
                          />
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-gray-300">{u.role}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-gray-300">
                            {u.role === "authority" ? u.authorityCategory || "Unassigned" : "-"}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-gray-300">{u.civicPoints}</td>
                        <td className="py-3 pr-4 text-gray-300">{u.rank}</td>
                        <td className="py-3 pr-4">
                          <button
                            onClick={() => handleSave(u._id)}
                            disabled={updatingId === u._id}
                            className="px-3 py-1 rounded-md bg-[#9A0D1B] hover:bg-[#7A0A15] transition text-white text-xs font-semibold disabled:opacity-60"
                          >
                            {updatingId === u._id ? "Saving..." : "Edit"}
                          </button>
                        </td>
                        <td className="py-3 pr-4">
                          <button
                            onClick={() => handleDelete(u._id)}
                            disabled={deletingId === u._id || currentUser?.id === u._id}
                            className="px-3 py-1 rounded-md bg-red-700 hover:bg-red-600 transition text-white text-xs font-semibold disabled:opacity-60"
                            title={currentUser?.id === u._id ? "You cannot delete your own account" : "Delete user"}
                          >
                            {deletingId === u._id ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <p className="text-gray-400 mt-4">No users match your search.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

