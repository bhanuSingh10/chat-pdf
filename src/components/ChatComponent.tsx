"use client";
import React, { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import MessageList from "./MessageList";
import { v4 as uuidv4 } from "uuid";

// ✅ Define Message Type
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Props = { chatId: number };

const ChatComponent = ({ chatId }: Props) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // ✅ Fetch messages on load
  const { data, isLoading, error } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>("/api/get-messages", {
        chatId
      });
      return response.data;
    }
  });

  // ✅ Mutation for sending messages
  const sendMessageMutation = useMutation({
    mutationFn: async (newMessages: Message[]) => {
      const response = await axios.post("/api/chat", {
        chatId,
        messages: newMessages
      });
      return response.data;
    },
    onSuccess: (data) => {
      const aiMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: data.response
      };
      setMessages((prev) => [...prev, aiMessage]);
    },
    onError: (err) => {
      console.error("❌ Error sending message:", err);
      alert("⚠️ Failed to send message. Please try again.");
    },
    onSettled: () => {
      setLoading(false);
    }
  });

  // ✅ Auto-scroll to latest message
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  // ✅ Handle message sending
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const newUserMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: input.trim()
    };
    const updatedMessages = [...messages, newUserMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    sendMessageMutation.mutate(updatedMessages);
  };

  return (
    <div
      className="relative max-h-screen overflow-scroll"
      id="message-container"
      ref={messageContainerRef}
    >
      {/* ✅ Header */}
      <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit">
        <h3 className="text-xl font-bold">Chat</h3>
      </div>

      {/* ✅ Message List */}
      {error ? (
        <p className="text-red-500 text-center p-4">
          {" "}
          Failed to load messages.
        </p>
      ) : (
        <MessageList messages={messages} isLoading={isLoading} />
      )}

      {/* ✅ Input Form */}
      <form
        onSubmit={sendMessage}
        className="sticky bottom-0 inset-x-0 px-2 py-4 bg-white"
      >
        <div className="flex">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask any question..."
            className="w-full"
            disabled={loading}
          />
          <Button className="bg-blue-600 ml-2" type="submit" disabled={loading}>
            {loading ? "..." : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;
