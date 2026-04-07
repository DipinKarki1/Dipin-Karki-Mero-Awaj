import { NavLink, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import logo from "../../image/Mero awaj logo.png";
import { BellIcon, MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { API_BASE_URL } from "../config/api";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const isAdmin = user?.role === "admin";
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md transition-colors ${
      isActive ? "text-red-300" : "text-gray-200"
    } hover:text-red-300`;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!showNotifications) return;
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 20000);
    return () => clearInterval(timer);
  }, [showNotifications]);

  const fetchNotifications = async () => {
    if (user?.role !== "user") return;
    try {
      setLoadingNotifications(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/v1/issues/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data || []);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#2b0f12]/90 backdrop-blur border-b border-[#4a1b1b]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-3">

          {/* LEFT: Logo */}
          <Link to={isAdmin ? "/admin" : "/"} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#3b1416] border border-[#5a1f21] flex items-center justify-center overflow-hidden">
              <img src={logo} alt="Mero Awaj" className="w-full h-full object-contain" />
            </div>
            <span className="text-white font-semibold tracking-wide">
              Mero Awaj
            </span>
          </Link>

          {/* CENTER: Navigation Links */}
          <ul className="hidden md:flex gap-6 items-center text-sm font-semibold">
            {!isAdmin && (
              <li>
                <NavLink to="/" className={linkClass}>
                  Home
                </NavLink>
              </li>
            )}
            <li>
              <NavLink to="/issues" className={linkClass}>
                View Issues
              </NavLink>
            </li>
            {user?.role === "user" && (
              <li>
                <NavLink to="/issues/create" className={linkClass}>
                  Create Issue
                </NavLink>
              </li>
            )}
            {!isAdmin && (
              <li>
                <NavLink to="/chats" className={linkClass}>
                  Chat
                </NavLink>
              </li>
            )}
            <li>
              <NavLink to="/awareness" className={linkClass}>
                Awareness
              </NavLink>
            </li>
            {user?.role === "admin" && (
              <li>
                <NavLink to="/admin" className={linkClass}>
                  Admin Dashboard
                </NavLink>
              </li>
            )}
            {!isAdmin && (
              <li>
                <NavLink to="/about" className={linkClass}>
                  About
                </NavLink>
              </li>
            )}
            {user && (
              <li>
                <NavLink to="/profile" className={linkClass}>
                  Profile
                </NavLink>
              </li>
            )}
          </ul>

          {/* RIGHT: Theme + Auth */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
              className="w-9 h-9 grid place-items-center rounded-md bg-[#3b1416] border border-[#5a1f21] text-yellow-300"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {theme === "dark" ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>

            {user?.role === "user" && (
              <div className="relative">
                <button
                  onClick={() => {
                    const next = !showNotifications;
                    setShowNotifications(next);
                    if (next) {
                      fetchNotifications();
                    }
                  }}
                  className="w-9 h-9 grid place-items-center rounded-md bg-[#3b1416] border border-[#5a1f21] text-white"
                  aria-label="Notifications"
                  title="Notifications"
                >
                  <BellIcon className="w-5 h-5" />
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[#4a1b1b] bg-[#2b0f12] shadow-2xl z-50">
                    <div className="px-4 py-3 border-b border-[#4a1b1b] flex items-center justify-between">
                      <span className="text-white font-semibold text-sm">Notifications</span>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-white text-sm"
                      >
                        Close
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {loadingNotifications ? (
                        <div className="px-4 py-4 text-sm text-gray-400">Loading...</div>
                      ) : notifications.length === 0 ? (
                        <div className="px-4 py-4 text-sm text-gray-400">
                          No authority updates yet for your issues.
                        </div>
                      ) : (
                        notifications.map((item) => (
                          <div
                            key={`${item.issueId}-${item.updatedAt}-${item.sequence ?? 0}`}
                            className="px-4 py-3 border-b border-[#3b1416]"
                          >
                            <div className="text-sm text-white font-semibold">{item.title}</div>
                            <div className="text-xs text-gray-400 mt-1">{item.message}</div>
                            <div className="text-[10px] text-gray-500 mt-2">
                              Status: {item.status} - {new Date(item.updatedAt).toLocaleString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden xl:flex flex-col items-end border-r border-[#4a1b1b] pr-4">
                  <span className="text-white font-bold text-sm leading-none">{user.name}</span>
                  {user.role === "user" && (
                    <span className="text-[#9A0D1B] text-[10px] font-black uppercase tracking-widest mt-1">
                      {user.rank} - {user.civicPoints} pts
                    </span>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-md bg-red-700 text-white text-sm font-semibold hover:bg-red-600 transition-colors shadow-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md bg-red-600 text-white text-sm font-semibold hover:bg-red-500 transition-colors shadow-lg"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="px-3 py-2 rounded-md bg-red-700 text-white text-sm font-semibold hover:bg-red-600 transition-colors shadow-lg"
                >
                  Signup
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}




