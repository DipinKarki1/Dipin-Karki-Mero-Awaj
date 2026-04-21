import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext.jsx";
import { API_BASE_URL } from "../config/api";
import {
  NewspaperIcon,
  HandThumbUpIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";

export default function Issues() {
  const ITEMS_PER_PAGE = 10;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [feedbackIssue, setFeedbackIssue] = useState(null);
  const [feedbackData, setFeedbackData] = useState({ rating: 5, comment: "" });
  const [statusUpdateIssue, setStatusUpdateIssue] = useState(null);
  const [statusUpdateData, setStatusUpdateData] = useState({ status: "In Progress", message: "" });
  const { user } = useAuth();

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/v1/issues`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const sortedIssues = data.data.sort(
          (a, b) => (b.votes?.length || 0) - (a.votes?.length || 0)
        );
        setItems(sortedIssues);
      }
    } catch (err) {
      toast.error("Failed to fetch issues");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (id) => {
    if (!user) {
      return toast.error("Please login to vote");
    }
    const issue = items.find((i) => i._id === id);
    if (issue && Array.isArray(issue.votes) && issue.votes.includes(user.id)) {
      return toast.error("You have already voted on this issue");
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/v1/issues/${id}/vote`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Vote counted");
        setItems((prev) => {
          const next = prev.map((item) =>
            item._id === id ? { ...item, votes: data.data?.votes || item.votes } : item
          );
          next.sort(
            (a, b) => (b.votes?.length || 0) - (a.votes?.length || 0)
          );
          return next;
        });
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to vote");
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/v1/issues/${feedbackIssue._id}/feedback`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(feedbackData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Feedback submitted!");
        setFeedbackIssue(null);
        setFeedbackData({ rating: 5, comment: "" });
        fetchIssues();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to submit feedback");
    }
  };

  const handleStatusUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/v1/issues/${statusUpdateIssue._id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(statusUpdateData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Status updated successfully!");
        setStatusUpdateIssue(null);
        setStatusUpdateData({ status: "In Progress", message: "" });
        fetchIssues();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const statusStyle = {
    Open: { color: "text-red-400 border-red-500/40", icon: <ClockIcon className="w-4 h-4" /> },
    "In Progress": { color: "text-yellow-400 border-yellow-500/40", icon: <ArrowPathIcon className="w-4 h-4" /> },
    Resolved: { color: "text-green-400 border-green-500/40", icon: <CheckCircleIcon className="w-4 h-4" /> },
  };
  const getStatusMeta = (status) => statusStyle[status] || statusStyle.Open;
  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = items.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage((prevPage) => Math.min(prevPage, totalPages));
  }, [totalPages]);

  return (
    <div className="bg-gradient-to-br from-[#120406] via-[#1d080b] to-[#0a0203] p-6 rounded-xl shadow-xl max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 p-4 border border-[#4a1b1b] rounded-xl bg-[#2b0f12]/70">
        <div className="flex items-center gap-4">
          <NewspaperIcon className="w-8 text-red-500" />
          <h1 className="text-3xl font-bold text-white">
            Community Issues
          </h1>
        </div>

        {user?.role === "user" && (
          <Link
            to="/issues/create"
            className="px-5 py-3 rounded-lg 
                       bg-gradient-to-r from-red-700 to-red-600 
                       hover:from-red-600 hover:to-red-500
                       transition text-white font-semibold shadow-lg"
          >
            Report Issue
          </Link>
        )}
      </div>

      {/* Issues Grid */}
      {loading ? (
        <div className="text-center py-10 text-white">Loading issues...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-10 text-white">No issues reported yet.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paginatedItems.map((i) => {
              const hasVoted = user && Array.isArray(i.votes) && i.votes.includes(user.id);
              const isOwner = user && (i.author?._id === user.id);
              return (
                <div
                  key={i._id}
                  className="bg-[#2b0f12]/80 border border-[#4a1b1b] 
                           rounded-2xl shadow-lg p-6 text-white"
                >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-semibold">{i.title}</h3>
                  <span
                    className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1.5 ${getStatusMeta(i.status).color}`}
                  >
                    {getStatusMeta(i.status).icon}
                    {i.status || "Open"}
                  </span>
                </div>

                <div className="mt-2 text-xs text-gray-400 flex justify-between">
                  <span>Category: {i.category}</span>
                  <span>Loc: {i.location}</span>
                </div>

                {i.imageUrl && (
                  <div className="mt-4">
                    <img
                      src={i.imageUrl}
                      alt={i.title}
                      className="w-full h-40 object-cover rounded-lg border border-[#4a1b1b]"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}

                <p className="mt-3 text-gray-300 leading-relaxed line-clamp-2">
                  {i.description}
                </p>

                {/* Progress Tracker Button */}
                {i.progressUpdates && i.progressUpdates.length > 0 && (
                  <div className="mt-4 p-3 bg-[#3b1416]/50 border border-[#5a1f21] rounded-lg">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-[#9A0D1B] font-bold uppercase tracking-wider flex items-center gap-1">
                        <ArrowPathIcon className="w-3 h-3" />
                        Latest Update
                      </span>
                      <span className="text-gray-500">
                        {new Date(i.progressUpdates[i.progressUpdates.length - 1].updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-200 italic">
                      "{i.progressUpdates[i.progressUpdates.length - 1].message}"
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-5 flex items-center justify-between">
                  <div className="flex gap-4">
                    {user?.role === "user" && !isOwner && (
                      <button
                        onClick={() => handleVote(i._id)}
                        disabled={hasVoted}
                        title={hasVoted ? "You already voted" : "Vote for this issue"}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition text-white ${
                          hasVoted
                            ? "bg-red-500/60 cursor-not-allowed"
                            : "bg-red-700 hover:bg-red-600"
                        }`}
                      >
                        <HandThumbUpIcon className="w-5" />
                        {Array.isArray(i.votes) ? i.votes.length : 0} Supports
                      </button>
                    )}
                    {user?.role === "user" && isOwner && (
                      <span className="text-xs text-gray-400 italic">
                        You cannot vote on your own issue.
                      </span>
                    )}

                    <button
                      onClick={() => setSelectedIssue(i)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg 
                               bg-[#3b1416] border border-[#5a1f21] 
                               hover:border-red-500 transition text-white"
                    >
                      <EyeIcon className="w-5" />
                      Track Progress
                    </button>

                    {i.status === "Resolved" && user && i.author?._id === user.id && !i.feedback && (
                      <button
                        onClick={() => setFeedbackIssue(i)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg 
                                 bg-green-700 hover:bg-green-600 transition text-white"
                      >
                        Give Feedback
                      </button>
                    )}

                    {(user?.role === "authority" || user?.role === "admin") && i.status !== "Resolved" && (
                      <button
                        onClick={() => setStatusUpdateIssue(i)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg 
                                 bg-blue-700 hover:bg-blue-600 transition text-white"
                      >
                        Update Status
                      </button>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">By: {i.author?.name || "Unknown"}</span>
                </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t border-[#4a1b1b] pt-6 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-gray-400">
              Showing {startIndex + 1}-{Math.min(startIndex + paginatedItems.length, items.length)} of {items.length} issues
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))}
                disabled={currentPage === 1}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                  currentPage === 1
                    ? "cursor-not-allowed border-[#4a1b1b] bg-[#2b0f12]/40 text-gray-500"
                    : "border-[#5a1f21] bg-[#2b0f12] text-white hover:border-red-500"
                }`}
              >
                Previous
              </button>

              <span className="rounded-lg border border-[#5a1f21] bg-[#2b0f12] px-4 py-2 text-sm font-semibold text-white">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                  currentPage === totalPages
                    ? "cursor-not-allowed border-[#4a1b1b] bg-[#2b0f12]/40 text-gray-500"
                    : "border-[#5a1f21] bg-[#9A0D1B] text-white hover:bg-[#7A0A15]"
                }`}
              >
                Next Page
              </button>
            </div>
          </div>
        </>
      )}

      {/* Status Update Modal (Authority Only) */}
      {statusUpdateIssue && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1D0515] border border-[#4a1b1b] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Update Issue Status</h2>
            <p className="text-gray-400 text-sm mb-6">Changing status for: "{statusUpdateIssue.title}"</p>
            
            <form onSubmit={handleStatusUpdateSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">New Status</label>
                <select
                  className="w-full px-4 py-3 rounded-lg bg-[#3b1416] border border-[#5a1f21] text-white outline-none focus:ring-2 focus:ring-[#9A0D1B] transition"
                  value={statusUpdateData.status}
                  onChange={(e) => setStatusUpdateData({ ...statusUpdateData, status: e.target.value })}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Progress Note</label>
                <textarea
                  className="w-full px-4 py-3 rounded-lg bg-[#3b1416] border border-[#5a1f21] text-white outline-none focus:ring-2 focus:ring-[#9A0D1B] transition resize-none h-32"
                  placeholder="E.g., Team dispatched to location, work started..."
                  required
                  value={statusUpdateData.message}
                  onChange={(e) => setStatusUpdateData({ ...statusUpdateData, message: e.target.value })}
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-lg bg-[#9A0D1B] hover:bg-[#7A0A15] transition text-white font-semibold shadow-lg"
                >
                  Confirm Update
                </button>
                <button
                  type="button"
                  onClick={() => setStatusUpdateIssue(null)}
                  className="flex-1 px-6 py-3 rounded-lg bg-[#3b1416] text-white hover:bg-[#4a1b1b] transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackIssue && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1D0515] border border-[#4a1b1b] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Share Your Feedback</h2>
            <p className="text-gray-400 text-sm mb-6">How satisfied are you with the resolution of "{feedbackIssue.title}"?</p>
            
            <form onSubmit={handleFeedbackSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFeedbackData({ ...feedbackData, rating: num })}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition ${
                        feedbackData.rating >= num ? "bg-[#9A0D1B] text-white" : "bg-[#3b1416] text-gray-400 border border-[#5a1f21]"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Comment</label>
                <textarea
                  className="w-full px-4 py-3 rounded-lg bg-[#3b1416] border border-[#5a1f21] text-white outline-none focus:ring-2 focus:ring-[#9A0D1B] transition resize-none h-32"
                  placeholder="Tell us about your experience..."
                  value={feedbackData.comment}
                  onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-lg bg-[#9A0D1B] hover:bg-[#7A0A15] transition text-white font-semibold shadow-lg"
                >
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackIssue(null)}
                  className="flex-1 px-6 py-3 rounded-lg bg-[#3b1416] text-white hover:bg-[#4a1b1b] transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Progress Tracking Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1D0515] border border-[#4a1b1b] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#4a1b1b] flex justify-between items-center bg-[#2b0f12]">
              <div>
                <h2 className="text-2xl font-bold text-white">Tracking Progress</h2>
                <p className="text-gray-400 text-sm mt-1">{selectedIssue.title}</p>
              </div>
              <button 
                onClick={() => setSelectedIssue(null)}
                className="text-gray-400 hover:text-white transition text-2xl"
              >
                &times;
              </button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto bg-gradient-to-b from-[#1D0515] to-[#0a0203]">
              <div className="space-y-8 relative">
                {/* Timeline Line */}
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-[#4a1b1b]"></div>

                {/* Initial Report */}
                <div className="relative pl-12">
                  <div className="absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full bg-[#9A0D1B] border-4 border-[#1D0515]"></div>
                  <div className="bg-[#2b0f12]/40 p-4 rounded-2xl border border-[#4a1b1b]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-red-400 font-bold text-xs uppercase">Issue Reported</span>
                      <span className="text-gray-500 text-xs">{new Date(selectedIssue.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-300 text-sm">Citizen reported the issue to Mero Awaj.</p>
                  </div>
                </div>

                {/* Progress Updates */}
                {selectedIssue.progressUpdates?.map((update, idx) => (
                  <div key={idx} className="relative pl-12">
                    <div className={`absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full border-4 border-[#1D0515] ${
                      update.status === 'Resolved' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                    <div className="bg-[#2b0f12]/60 p-5 rounded-2xl border border-[#4a1b1b] shadow-lg">
                      <div className="flex justify-between items-center mb-3">
                        <span className={`font-bold text-xs uppercase px-2 py-0.5 rounded border ${getStatusMeta(update.status).color}`}>
                          {update.status || "Open"}
                        </span>
                        <span className="text-gray-500 text-xs">{new Date(update.updatedAt).toLocaleString()}</span>
                      </div>
                      <p className="text-white text-base leading-relaxed">
                        {update.message}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest">
                        <div className="w-4 h-0.5 bg-[#9A0D1B]"></div>
                        Official Update by Authority
                      </div>
                    </div>
                  </div>
                ))}

                {selectedIssue.feedback && (
                  <div className="relative pl-12">
                    <div className="absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full bg-blue-500 border-4 border-[#1D0515]"></div>
                    <div className="bg-blue-900/20 p-5 rounded-2xl border border-blue-900/40 shadow-lg">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-xs uppercase text-blue-400">Citizen Feedback</span>
                        <div className="flex text-yellow-500">
                          {[...Array(selectedIssue.feedback.rating)].map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-white text-base italic">
                        "{selectedIssue.feedback.comment}"
                      </p>
                      <div className="mt-3 text-[10px] text-gray-500 uppercase tracking-widest">
                        Case Closed & Verified
                      </div>
                    </div>
                  </div>
                )}

                {selectedIssue.progressUpdates?.length === 0 && !selectedIssue.feedback && (
                  <div className="relative pl-12 italic text-gray-500 text-sm">
                    No official updates yet. Authorities will post progress here soon.
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 bg-[#2b0f12]/80 border-t border-[#4a1b1b] flex justify-end">
              <button 
                onClick={() => setSelectedIssue(null)}
                className="px-6 py-2 rounded-lg bg-[#3b1416] text-white hover:bg-[#4a1b1b] transition font-semibold"
              >
                Close Tracker
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



