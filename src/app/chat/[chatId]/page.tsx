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
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  // ✅ Ensure chatId is a valid number
  const chatId = parseInt(params.chatId, 10);
  if (isNaN(chatId)) {
    return redirect("/");
  }

  // ✅ Fix for `_chats` check
  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
  if (!_chats || _chats.length === 0) {
    return redirect("/");
  }

  // ✅ Ensure user has access to the chat
  const chatExists = _chats.some((chat) => chat.id === chatId);
  if (!chatExists) {
    return redirect("/");
  }
  const currentChat = _chats.find(chat => chat.id === (chatId));

  return (
    <div className="flex h-full max-h-screen  overflow-auto mt-3">
      <div className="flex w-full max-h-screen overflow-auto ">
        <div className="flex-[1] max-w-xs">
          <ChatSideBar chats={_chats} chatId={chatId} />
        </div>
        <div className="max-h-screen p-4 overflow-scroll flex-[5]">
          <PDFViewer pdf_url={currentChat?.pdfUrl || ''}/>
        </div>
        <div className="flex-[3] border-l-4 border-l-slate-200">
          <ChatComponent/>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;


// import React from "react";
// import { auth } from "@clerk/nextjs/server";
// import { redirect } from "next/navigation";
// import { db } from "@/lib/db";
// import { chats } from "@/lib/db/schema";
// import { eq } from "drizzle-orm";
// import ChatSideBar from "@/components/ChatSideBar";
// type Props = {
//   params: {
//     chatId: string;
//   };
// };

// const ChatPage = async ({ params: { chatId } }: Props) => {
//   const { userId } = await auth();
//   if (!userId) {
//     return redirect("/sign-in");
//   }

//   const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
//   if (!_chats) {
//     return redirect("/");
//   }
//   if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
//     return redirect("/");
//   }

//   return (
//     <div className="flex max-h-screen overflow-hidden">
//       <div className="flex w-full max-h-screen overflow-scroll">
//         <div className="felx-[1] max-w-xs">
//             <ChatSideBar chats = {_chats} chatId={parseInt(chatId)}/>
//         </div>
//         {/*  */}
//         <div className="max-h-screen p-4 overflow-scroll flex-[5]"></div>
//         {/*  */}
//         <div className="flex-[3] border-l-4 border-l-slate-200"></div>
//       </div>
//     </div>
//   );
// };
// export default ChatPage;
