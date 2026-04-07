import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { BookOpenIcon, MegaphoneIcon, ShieldCheckIcon, GlobeAmericasIcon, PlusIcon } from "@heroicons/react/24/solid";
import { API_BASE_URL } from "../config/api";

export default function Awareness() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: "",
    content: "",
    category: "Guideline",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [editingArticle, setEditingArticle] = useState(null);
  const [editData, setEditData] = useState({
    title: "",
    content: "",
    category: "Guideline",
  });
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const [editExistingImage, setEditExistingImage] = useState("");
  const { user } = useAuth();

  const categoryIcons = {
    Guideline: <BookOpenIcon className="w-6 h-6 text-blue-400" />,
    News: <MegaphoneIcon className="w-6 h-6 text-red-400" />,
    Rights: <ShieldCheckIcon className="w-6 h-6 text-green-400" />,
    Environment: <GlobeAmericasIcon className="w-6 h-6 text-emerald-400" />,
  };

  const fetchArticles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/awareness`);
      const data = await res.json();
      if (data.success) {
        setArticles(data.data);
      }
    } catch (err) {
      toast.error("Failed to load awareness content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    if (!imagePreview) return;
    return () => {
      URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    if (!editImagePreview) return;
    return () => {
      URL.revokeObjectURL(editImagePreview);
    };
  }, [editImagePreview]);

  const resetArticleForm = () => {
    setShowCreateModal(false);
    setNewArticle({ title: "", content: "", category: "Guideline" });
    setImageFile(null);
    setImagePreview("");
  };

  const openEditModal = (article) => {
    setEditingArticle(article);
    setEditData({
      title: article.title || "",
      content: article.content || "",
      category: article.category || "Guideline",
    });
    setEditImageFile(null);
    setEditImagePreview("");
    setEditExistingImage(article.image || "");
  };

  const closeEditModal = () => {
    setEditingArticle(null);
    setEditData({ title: "", content: "", category: "Guideline" });
    setEditImageFile(null);
    setEditImagePreview("");
    setEditExistingImage("");
  };

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", newArticle.title);
      formData.append("content", newArticle.content);
      formData.append("category", newArticle.category);
      if (imageFile) {
        formData.append("image", imageFile);
      }
      const res = await fetch(`${API_BASE_URL}/api/v1/awareness`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Awareness article published!");
        resetArticleForm();
        fetchArticles();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to publish article");
    }
  };

  const handleUpdateArticle = async (e) => {
    e.preventDefault();
    if (!editingArticle) return;
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", editData.title);
      formData.append("content", editData.content);
      formData.append("category", editData.category);
      if (editImageFile) {
        formData.append("image", editImageFile);
      }

      const res = await fetch(`${API_BASE_URL}/api/v1/awareness/${editingArticle._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Article updated");
        closeEditModal();
        fetchArticles();
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      toast.error("Failed to update article");
    }
  };

  const handleDeleteArticle = async (article) => {
    const confirmDelete = window.confirm(
      `Delete article "${article.title}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/v1/awareness/${article._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Article deleted");
        fetchArticles();
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch (err) {
      toast.error("Failed to delete article");
    }
  };

  return (
    <div className="min-h-screen bg-[#1D0515] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">
            Civic Awareness & Participation
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Stay informed about your rights, community guidelines, and local news. 
            Empowering citizens to take active roles in society.
          </p>

          {/* Authority Only Publish Button */}
          {(user?.role === 'authority' || user?.role === 'admin') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#9A0D1B] hover:bg-[#7A0A15] transition text-white font-bold shadow-xl"
            >
              <PlusIcon className="w-5 h-5" />
              Publish Awareness Article
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9A0D1B] mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => {
              const canManage =
                user?.role === "admin" || user?.role === "authority";

              return (
                <div 
                  key={article._id}
                  className="bg-[#2b0f12]/60 backdrop-blur border border-[#4a1b1b] rounded-2xl overflow-hidden shadow-2xl hover:border-[#9A0D1B]/50 transition-all group"
                >
                  <div className="h-48 overflow-hidden bg-[#3b1416] relative">
                    {article.image ? (
                      <img 
                        src={article.image} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                        No image provided
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-[#1D0515]/80 backdrop-blur px-3 py-1 rounded-full border border-[#4a1b1b] flex items-center gap-2">
                      {categoryIcons[article.category]}
                      <span className="text-xs font-bold uppercase tracking-wider">{article.category}</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3 group-hover:text-[#9A0D1B] transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                      {article.content}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-[#4a1b1b]">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase">Published by</span>
                        <span className="text-xs font-semibold text-[#9A0D1B]">{article.author?.name}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 italic">
                        {new Date(article.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {canManage && (
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          onClick={() => openEditModal(article)}
                          className="px-4 py-2 rounded-lg bg-[#3b1416] border border-[#5a1f21] text-white text-xs font-semibold hover:border-[#9A0D1B] transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(article)}
                          className="px-4 py-2 rounded-lg bg-red-700/80 text-white text-xs font-semibold hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Participation Section */}
        <div
          className="mt-20 rounded-3xl p-8 lg:p-12 shadow-xl"
          style={{
            background: "linear-gradient(135deg, var(--surface-2) 0%, var(--surface-1) 50%, var(--surface-3) 100%)",
            border: "1px solid var(--border-2)",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Promoting Active Participation</h2>
              <p className="text-lg mb-8 leading-relaxed" style={{ color: "var(--text-2)" }}>
                Mero Awaj rewards citizens who actively contribute to their community. 
                Earn **Civic Points** by reporting issues, voting on priorities, and providing feedback.
              </p>
              <div className="space-y-4">
                {[
                  { label: "Report an Issue", points: "+50" },
                  { label: "Vote on Community Issue", points: "+10" },
                  { label: "Provide Feedback on Resolution", points: "+30" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{ backgroundColor: "var(--surface-1)", border: "1px solid var(--border-2)" }}
                  >
                    <span className="font-medium">{item.label}</span>
                    <span className="font-bold" style={{ color: "var(--accent)" }}>{item.points} Points</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 blur-3xl rounded-full" style={{ backgroundColor: "rgba(0,103,75,0.15)" }}></div>
              <div
                className="relative p-8 rounded-2xl shadow-xl text-center"
                style={{ backgroundColor: "var(--surface-1)", border: "1px solid var(--border-2)" }}
              >
                <div className="text-5xl font-black mb-4" style={{ color: "var(--accent)" }}>Trophy</div>
                <h3 className="text-2xl font-bold mb-2">Climb the Ranks</h3>
                <p className="text-sm mb-6" style={{ color: "var(--text-3)" }}>From Citizen to Civic Leader</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {['Citizen', 'Contributor', 'Active Citizen', 'Civic Leader'].map((rank) => (
                    <span
                      key={rank}
                      className="px-4 py-2 rounded-full text-xs font-bold"
                      style={{ backgroundColor: "var(--surface-3)", border: "1px solid var(--border-2)", color: "var(--text-1)" }}
                    >
                      {rank}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Article Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1D0515] border border-[#4a1b1b] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#4a1b1b] flex justify-between items-center bg-[#2b0f12]">
              <h2 className="text-2xl font-bold text-white">Promote Civic Awareness</h2>
              <button onClick={resetArticleForm} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>
            
            <form onSubmit={handleCreateArticle} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 uppercase tracking-wider">Article Title</label>
                  <input
                    className="w-full px-4 py-3 rounded-xl bg-[#3b1416] border border-[#5a1f21] text-white outline-none focus:ring-2 focus:ring-[#9A0D1B] transition"
                    placeholder="Enter catchy title..."
                    required
                    value={newArticle.title}
                    onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 uppercase tracking-wider">Category</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl bg-[#3b1416] border border-[#5a1f21] text-white outline-none focus:ring-2 focus:ring-[#9A0D1B] transition"
                    value={newArticle.category}
                    onChange={(e) => setNewArticle({...newArticle, category: e.target.value})}
                  >
                    <option value="Guideline">Guideline</option>
                    <option value="News">News</option>
                    <option value="Rights">Rights</option>
                    <option value="Environment">Environment</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 uppercase tracking-wider">Upload Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-4 py-3 rounded-xl bg-[#3b1416] border border-[#5a1f21] text-white outline-none focus:ring-2 focus:ring-[#9A0D1B] transition"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) {
                      setImageFile(null);
                      setImagePreview("");
                      return;
                    }
                    setImageFile(file);
                    const previewUrl = URL.createObjectURL(file);
                    setImagePreview(previewUrl);
                  }}
                />
                {imagePreview && (
                  <div className="mt-3 border border-[#4a1b1b] rounded-xl overflow-hidden bg-[#2b0f12]">
                    <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                      }}
                      className="w-full py-2 text-sm bg-[#3b1416] hover:bg-[#4a1b1b] transition"
                    >
                      Remove Image
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 uppercase tracking-wider">Content</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl bg-[#3b1416] border border-[#5a1f21] text-white outline-none focus:ring-2 focus:ring-[#9A0D1B] transition resize-none h-48"
                  placeholder="Write the educational content or news here..."
                  required
                  value={newArticle.content}
                  onChange={(e) => setNewArticle({...newArticle, content: e.target.value})}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 rounded-xl bg-[#9A0D1B] hover:bg-[#7A0A15] transition text-white font-bold shadow-lg"
                >
                  Publish to Community
                </button>
                <button
                  type="button"
                  onClick={resetArticleForm}
                  className="px-6 py-4 rounded-xl bg-[#3b1416] text-white hover:bg-[#4a1b1b] transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Article Modal */}
      {editingArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1D0515] border border-[#4a1b1b] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#4a1b1b] flex justify-between items-center bg-[#2b0f12]">
              <h2 className="text-2xl font-bold text-white">Edit Awareness Article</h2>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>

            <form onSubmit={handleUpdateArticle} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 uppercase tracking-wider">Article Title</label>
                  <input
                    className="w-full px-4 py-3 rounded-xl bg-[#3b1416] border border-[#5a1f21] text-white outline-none focus:ring-2 focus:ring-[#9A0D1B] transition"
                    required
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 uppercase tracking-wider">Category</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl bg-[#3b1416] border border-[#5a1f21] text-white outline-none focus:ring-2 focus:ring-[#9A0D1B] transition"
                    value={editData.category}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                  >
                    <option value="Guideline">Guideline</option>
                    <option value="News">News</option>
                    <option value="Rights">Rights</option>
                    <option value="Environment">Environment</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 uppercase tracking-wider">Upload New Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-4 py-3 rounded-xl bg-[#3b1416] border border-[#5a1f21] text-white outline-none focus:ring-2 focus:ring-[#9A0D1B] transition"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) {
                      setEditImageFile(null);
                      setEditImagePreview("");
                      return;
                    }
                    setEditImageFile(file);
                    const previewUrl = URL.createObjectURL(file);
                    setEditImagePreview(previewUrl);
                  }}
                />
                {editImagePreview ? (
                  <div className="mt-3 border border-[#4a1b1b] rounded-xl overflow-hidden bg-[#2b0f12]">
                    <img src={editImagePreview} alt="Preview" className="w-full h-40 object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setEditImageFile(null);
                        setEditImagePreview("");
                      }}
                      className="w-full py-2 text-sm bg-[#3b1416] hover:bg-[#4a1b1b] transition"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : editExistingImage ? (
                  <div className="mt-3 border border-[#4a1b1b] rounded-xl overflow-hidden bg-[#2b0f12]">
                    <img src={editExistingImage} alt="Current" className="w-full h-40 object-cover" />
                    <div className="w-full py-2 text-xs text-gray-400 text-center bg-[#3b1416]">
                      Current image
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 uppercase tracking-wider">Content</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl bg-[#3b1416] border border-[#5a1f21] text-white outline-none focus:ring-2 focus:ring-[#9A0D1B] transition resize-none h-48"
                  required
                  value={editData.content}
                  onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 rounded-xl bg-[#9A0D1B] hover:bg-[#7A0A15] transition text-white font-bold shadow-lg"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-6 py-4 rounded-xl bg-[#3b1416] text-white hover:bg-[#4a1b1b] transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

