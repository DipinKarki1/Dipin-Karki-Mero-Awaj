import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ChatWindow from "../features/chat/ChatWindow";
import ChatList from "../features/chat/ChatList";
import { useAuth } from "../contexts/AuthContext";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";
import {
  ChatBubbleLeftRightIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { getTicketById } from "../services/ticketService";

export default function Chats() {
  const { ticketId } = useParams();
  const { socket } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [participantCount, setParticipantCount] = useState(0);

  useEffect(() => {
    if (!ticketId) {
      setTicket(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchTicketDetails = async () => {
      setLoading(true);
      const response = await getTicketById(ticketId);
      if (response.success) {
        setTicket(response.ticket);
      } else {
        setError(response.message);
      }
      setLoading(false);
    };

    fetchTicketDetails();
  }, [ticketId]);

  useEffect(() => {
    if (socket && ticketId) {
      socket.on(
        "ticketRoomParticipants",
        ({ ticketId: roomTicketId, count }) => {
          if (parseInt(ticketId) === parseInt(roomTicketId)) {
            setParticipantCount(count);
          }
        }
      );
    }

    return () => {
      if (socket) {
        socket.off("ticketRoomParticipants");
      }
    };
  }, [socket, ticketId]);

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-[#1D0515]">
      {/* Chat List Sidebar */}
      <div className="w-1/4 min-w-[300px] border-r border-[#4a1b1b] overflow-y-auto">
        <ChatList />
      </div>

      {/* Chat Window or Welcome Screen */}
      <div className="flex-1 bg-[#1D0515]">
        {ticketId ? (
          loading ? (
            <div className="h-full flex items-center justify-center">
              <Spinner />
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center p-6">
              <ErrorMessage>{error}</ErrorMessage>
            </div>
          ) : (
            <div className="p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">Issue Discussion</h1>
                  <p className="text-sm text-gray-400">{ticket?.title}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#350616] border border-[#550816] text-[#9A0D1B]">
                  <UsersIcon className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    {participantCount > 0
                      ? `${participantCount} Active`
                      : "Private Room"}
                  </span>
                </div>
              </div>
              <ChatWindow ticketId={ticketId} ticket={ticket} />
            </div>
          )
        ) : (
          <div className="flex w-full h-full flex-col items-center justify-center p-6 text-center">
            <div className="bg-[#2b0f12]/50 backdrop-blur p-12 rounded-3xl border border-[#4a1b1b] max-w-lg shadow-2xl">
              <div className="w-24 h-24 bg-[#3b1416] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#5a1f21]">
                <ChatBubbleLeftRightIcon className="w-12 h-12 text-[#9A0D1B]" />
              </div>
              <h2 className="text-3xl font-extrabold text-white mb-4">Mero Awaj Messaging</h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Connect with authorities and your community. 
                Select a discussion from the sidebar to start sharing your voice.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
