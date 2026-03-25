import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function ChatWindow({ ticketId, ticket }) {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const { user, socket } = useAuth();
  const scrollRef = useRef();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/v1/messages/${ticketId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setMessages(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch messages");
      }
    };

    if (ticketId) {
      fetchMessages();
      if (socket) {
        socket.emit("joinIssueRoom", ticketId);
      }
    }
  }, [ticketId, socket]);

  useEffect(() => {
    if (socket) {
      socket.on("receiveMessage", (newMessage) => {
        if (newMessage.issue === ticketId) {
          setMessages((prev) => [...prev, newMessage]);
        }
      });
    }
    return () => {
      if (socket) socket.off("receiveMessage");
    };
  }, [socket, ticketId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text || !socket) return;

    const messagePayload = {
      issue: ticketId,
      text: text,
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/v1/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(messagePayload),
      });
      const data = await res.json();
      if (data.success) {
        // Broadcast via socket
        socket.emit("sendMessage", data.data);
        // Add to local state
        setMessages((prev) => [...prev, data.data]);
        setText("");
      }
    } catch (err) {
      console.error("Failed to send message");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] bg-[#2b0f12]/30 rounded-xl border border-[#4a1b1b] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isMe = m.sender._id === user.id;
          const isAuthority = m.sender.role === 'authority' || m.sender.role === 'admin';
          
          return (
            <div key={m._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-md ${
                  isMe
                    ? "bg-[#9A0D1B] text-white rounded-tr-none"
                    : isAuthority
                    ? "bg-[#350616] border border-[#9A0D1B]/50 text-white rounded-tl-none"
                    : "bg-[#3b1416] border border-[#5a1f21] text-white rounded-tl-none"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                    {m.sender.name}
                  </span>
                  {isAuthority && (
                    <span className="bg-[#9A0D1B]/20 text-[#9A0D1B] text-[8px] px-1 rounded border border-[#9A0D1B]/30">
                      OFFICIAL
                    </span>
                  )}
                </div>
                <div className="text-sm leading-relaxed">{m.text}</div>
                <div className="text-[8px] opacity-40 text-right mt-1">
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>
      <form onSubmit={send} className="p-4 bg-[#1D0515] border-t border-[#4a1b1b] flex gap-2">
        <input
          className="flex-1 px-4 py-3 rounded-lg bg-[#3b1416] border border-[#5a1f21] text-white outline-none focus:ring-2 focus:ring-[#9A0D1B] transition"
          placeholder="Type your official message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button 
          disabled={!text}
          className="bg-[#9A0D1B] hover:bg-[#7A0A15] px-6 py-2 rounded-lg text-white font-semibold transition shadow-lg disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
