import {
  ArrowUpIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import {
  BuildingOfficeIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Home() {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);

  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/v1/issues/feedbacks");
        const data = await res.json();
        if (data.success) {
          setFeedbacks(data.data || []);
        } else {
          setFeedbacks([]);
        }
      } catch (err) {
        setFeedbacks([]);
      } finally {
        setLoadingFeedbacks(false);
      }
    };
    loadFeedbacks();
  }, []);

  return (
    <div style={{ background: "var(--app-bg)", color: "var(--text-1)", minHeight: "100vh" }}>
      {/* Hero Section */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--surface-2) 0%, var(--surface-1) 55%, var(--surface-3) 100%)",
          minHeight: "70vh",
          padding: "4rem 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "48rem" }}>
          <h1
            style={{
              fontSize: "3.75rem",
              fontWeight: "bold",
              letterSpacing: "-0.025em",
              color: "var(--text-1)",
            }}
          >
            Report Issues, Get Solutions with mero Awaj
          </h1>
          <p
            style={{
              marginTop: "2rem",
              fontSize: "1.25rem",
              color: "var(--text-2)",
            }}
          >
            A platform where citizens can report community issues, vote on
            priorities, and connect directly with authorities for faster
            resolutions.
          </p>
          <div style={{ marginTop: "2.5rem", display: "flex", gap: "1.5rem", justifyContent: "center" }}>
            <Link
              to="/issues"
              style={{
                backgroundColor: "var(--accent)",
                color: "#ffffff",
                padding: "0.75rem 1.75rem",
                borderRadius: "0.5rem",
                fontWeight: "600",
                textDecoration: "none",
                boxShadow: "0 8px 24px rgba(0, 103, 75, 0.25)",
                transition: "all 0.3s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-strong)")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "var(--accent)")}
            >
              Get Started
            </Link>
            <Link
              to="/about"
              style={{
                color: "var(--accent)",
                padding: "0.75rem 1.75rem",
                border: "2px solid var(--accent)",
                borderRadius: "0.5rem",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Learn more
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ padding: "4rem 1rem", backgroundColor: "var(--surface-3)" }}>
        <h2 style={{ fontSize: "2.25rem", fontWeight: "bold", textAlign: "center", marginBottom: "3rem", color: "var(--text-1)" }}>
          Our Features
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem" }}>
          {[
            { Icon: ClipboardDocumentCheckIcon, title: "Report Issues", desc: "Easily submit and document community problems with photos and descriptions" },
            { Icon: ArrowUpIcon, title: "Vote on Issues", desc: "Help prioritize which problems need immediate attention through community voting" },
            { Icon: ChatBubbleOvalLeftEllipsisIcon, title: "Chat with Authorities", desc: "Direct communication channel with local authorities for faster problem resolution" },
            { Icon: MapPinIcon, title: "Location Tracking", desc: "Precise mapping of issues to help authorities locate and address problems quickly" },
          ].map(({ Icon, title, desc }) => (
            <div
              key={title}
              style={{
                backgroundColor: "var(--surface-1)",
                padding: "2rem",
                borderRadius: "1rem",
                textAlign: "center",
                boxShadow: "0 12px 24px rgba(0, 103, 75, 0.08)",
                border: "1px solid var(--border-1)",
              }}
            >
              <Icon style={{ width: "4rem", height: "4rem", color: "var(--accent)", marginBottom: "1rem" }} />
              <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--text-1)" }}>{title}</h3>
              <p style={{ marginTop: "0.75rem", color: "var(--text-2)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div style={{ padding: "4rem 1rem", backgroundColor: "var(--surface-3)" }}>
        <h2 style={{ fontSize: "2.25rem", fontWeight: "bold", textAlign: "center", marginBottom: "3rem", color: "var(--text-1)" }}>
          How It Works
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "3rem" }}>
          {[
            { Icon: ClipboardDocumentCheckIcon, title: "Report Issue", text: "Document the problem with photos, description, and location" },
            { Icon: UserGroupIcon, title: "Community Votes", text: "Fellow citizens vote and comment on issues to establish priority" },
            { Icon: BuildingOfficeIcon, title: "Authority Response", text: "Local authorities acknowledge, update status, and address the problem" },
            { Icon: CheckCircleIcon, title: "Problem Resolved", text: "Issues are tracked until resolution and verified by the community" },
          ].map(({ Icon, title, text }) => (
            <div key={title} style={{ textAlign: "center", maxWidth: "16rem" }}>
              <Icon style={{ width: "3rem", height: "3rem", color: "var(--accent)", marginBottom: "1rem" }} />
              <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "var(--text-1)" }}>{title}</h3>
              <p style={{ marginTop: "0.5rem", fontSize: "0.95rem", color: "var(--text-2)" }}>{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback */}
      <div style={{ padding: "4rem 1rem", backgroundColor: "var(--surface-2)" }}>
        <h2 style={{ fontSize: "2.25rem", fontWeight: "bold", textAlign: "center", marginBottom: "3rem", color: "var(--text-1)" }}>
          Community Feedback
        </h2>
        {loadingFeedbacks ? (
          <div style={{ textAlign: "center", color: "var(--text-3)" }}>Loading feedback...</div>
        ) : feedbacks.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-3)" }}>
            No feedback yet. Resolved issues will show here once citizens share their experience.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
            {feedbacks.map((item) => (
              <div
                key={item.issueId}
                style={{
                  backgroundColor: "var(--surface-1)",
                  padding: "2rem",
                  borderRadius: "1rem",
                  border: "1px solid var(--border-1)",
                  boxShadow: "0 12px 24px rgba(0, 103, 75, 0.08)",
                }}
              >
                <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1rem" }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} style={{ color: "var(--accent)", fontSize: "1.1rem" }}>
                      {i <= (item.rating || 0) ? "*" : "-"}
                    </span>
                  ))}
                </div>
                <p style={{ fontStyle: "italic", color: "var(--text-2)", marginBottom: "1rem" }}>
                  "{item.comment || "No comment provided."}"
                </p>
                <div>
                  <div style={{ fontWeight: "bold", color: "var(--text-1)" }}>{item.author}</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-3)" }}>
                    Issue: {item.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Final CTA */}
      {user ? (
        <div
          style={{
            padding: "4rem 1rem",
            textAlign: "center",
            background: "linear-gradient(to bottom, var(--surface-2), var(--surface-1))",
          }}
        >
          <h2 style={{ fontSize: "2.25rem", fontWeight: "bold", color: "var(--text-1)", marginBottom: "1rem" }}>
            Welcome back, {user.name}
          </h2>
          <p style={{ fontSize: "1.05rem", marginBottom: "2rem", color: "var(--text-2)" }}>
            Keep the momentum going. Track your issues, vote on priorities, or report a new concern.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
            <Link
              to="/issues"
              style={{
                backgroundColor: "var(--accent)",
                color: "#ffffff",
                padding: "0.85rem 2rem",
                borderRadius: "0.5rem",
                fontWeight: "600",
                textDecoration: "none",
                boxShadow: "0 10px 20px rgba(0, 103, 75, 0.2)",
              }}
            >
              View Issues
            </Link>
            {user.role === "user" && (
              <Link
                to="/issues/create"
                style={{
                  backgroundColor: "var(--surface-1)",
                  color: "var(--accent)",
                  padding: "0.85rem 2rem",
                  borderRadius: "0.5rem",
                  fontWeight: "600",
                  textDecoration: "none",
                  border: "2px solid var(--accent)",
                }}
              >
                Report an Issue
              </Link>
            )}
            <Link
              to="/profile"
              style={{
                backgroundColor: "var(--surface-1)",
                color: "var(--text-1)",
                padding: "0.85rem 2rem",
                borderRadius: "0.5rem",
                fontWeight: "600",
                textDecoration: "none",
                border: "1px solid var(--border-2)",
              }}
            >
              Go to Profile
            </Link>
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: "4rem 1rem",
            textAlign: "center",
            background: "linear-gradient(to bottom, var(--surface-2), var(--surface-1))",
          }}
        >
          <h2 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--text-1)", marginBottom: "1.5rem" }}>
            Ready to improve your community?
          </h2>
          <p style={{ fontSize: "1.125rem", marginBottom: "2rem", color: "var(--text-2)" }}>
            Join thousands of citizens making a difference in their neighborhoods
          </p>
          <Link
            to="/signup"
            style={{
              backgroundColor: "var(--accent)",
              color: "white",
              padding: "1rem 3rem",
              borderRadius: "0.5rem",
              fontSize: "1.25rem",
              fontWeight: "bold",
              textDecoration: "none",
              boxShadow: "0 10px 24px rgba(0, 103, 75, 0.25)",
            }}
          >
            Join mero Awaj Today
          </Link>
        </div>
      )}
    </div>
  );
}
