import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";
import ChatComponent from "@/components/ChatComponent";

type Props = {
  params: {
    chatId: string;
  };
};

const ChatPage = async ({ params }: Props) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return redirect("/sign-in");
    }

    // ✅ Convert `chatId` to a number safely
    const chatId = Number(params.chatId);
    if (isNaN(chatId)) {
      return redirect("/");
    }

    // ✅ Fetch user's chats from DB
    const _chats = await db
      .select()
      .from(chats)
      .where(eq(chats.userId, userId));
    if (!_chats || _chats.length === 0) {
      return redirect("/");
    }

    // ✅ Check if user has access to this chat
    const currentChat = _chats.find((chat) => chat.id === chatId);
    if (!currentChat) {
      return redirect("/");
    }

    return (
      <div className="flex h-full max-h-screen overflow-auto mt-3">
        <div className="flex w-full max-h-screen overflow-auto">
          {/* Sidebar */}
          <div className="flex-[1] max-w-xs">
            <ChatSideBar chats={_chats} chatId={chatId} />
          </div>

          {/* PDF Viewer */}
          <div className="flex-[5] max-h-screen p-4 overflow-scroll">
            <PDFViewer pdf_url={currentChat.pdfUrl} />
          </div>

          {/* Chat Component */}
          <div className="flex-[3] border-l-4   border-l-slate-200">
            <ChatComponent chatId={chatId} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in ChatPage:", error);
    return redirect("/");
  }
};

export default ChatPage;
