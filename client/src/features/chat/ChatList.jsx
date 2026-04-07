import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";

export default function ChatList() {
  const { ticketId } = useParams();
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/v1/issues/chat`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setTickets(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch chat issues");
      }
    };
    fetchTickets();
  }, []);

  return (
    <div className="bg-[#1D0515] h-full overflow-y-auto">
      <div className="p-4 border-b border-[#4a1b1b]">
        <h2 className="text-xl font-bold text-white">Issues Discussions</h2>
      </div>
      <div className="flex flex-col">
        {tickets.map((t) => (
          <Link
            key={t._id}
            to={`/chats/${t._id}`}
            className={`p-4 border-b border-[#4a1b1b] hover:bg-[#2b0f12] transition flex flex-col gap-1 ${
              ticketId === t._id ? "bg-[#2b0f12] border-r-4 border-r-[#9A0D1B]" : ""
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">{t.title}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                t.status === 'Resolved' ? 'text-green-400 border-green-500/30' : 'text-yellow-400 border-yellow-500/30'
              }`}>
                {t.status}
              </span>
            </div>
            <span className="text-xs text-gray-400">{t.category}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

