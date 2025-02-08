"use client";
import React from "react";
import { Input } from "./ui/input";
import { useChat } from "ai/react";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import MessageList from "./MessageList";

const ChatComponent = () => {
  const { input, handleInputChange, handleSubmit, messages } = useChat({
    api: "/api/chat",  // Ensure it's calling the updated API route
  });

  
 
 
  return (
    <div className="relative h-screen max-h-screen overflow-scroll">
      {/* Header */}
      <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit">
        <h3 className="text-xl font-bold">Chats</h3>
      </div>

      {/* ✅ Pass messages correctly */}
      <MessageList messages={messages} />
      

      {/* Chat Input */}
      <form
        className="sticky bottom-0 inset-x-0 px-2 py-4 bg-white flex"
        onSubmit={handleSubmit}
      >
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask any question..."
          className="w-full ml-2"
        />
        <Button className="bg-blue-600 ml-2" type="submit">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatComponent;
