// "use client"
// import React from 'react'
// import {DizzleChat} from "@/lib/db/schema"
// import Link from 'next/link'
// import { Button } from './ui/button'
// import { PlusCircle } from 'lucide-react'
// type Props = {
//     chats: DizzleChat[],
//     chatId: number,

// }

// const ChatSideBar = ([chats, chatId]: Props) => {
//   return (
//     <div className='w-full h-screen p-4 text-gray-200 bg-gray-900'>
//         <Link href = "/">
//         <Button>
//             <PlusCircle className='mr-2 w-4 h-4'/>
//         </Button>
//         </Link>
//     </div>
//   )
// }

// export default ChatSideBar;

"use client";

import React from "react";
import { DizzleChat } from "@/lib/db/schema"; 
import Link from "next/link";
import { Button } from "./ui/button";
import { MessageCircle, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  chats: DizzleChat[];
  chatId: number;
};

const ChatSideBar = ({ chats, chatId }: Props) => { 
    // ✅ Correct object destructuring
  return (
    <div className="w-full h-screen p-4 text-gray-200 bg-gray-900">
      <Link href="/">
        <Button className="w-full border-dashed border-white border">
          <PlusCircle className="mr-2 w-4 h-4" />
          New chat
        </Button>
      </Link>
      <div className="flex flex-col gap-2 mt-4">
        {chats.map(chat =>(
          <Link key={chat.id} href={`/chat/${chat.id}`}>
            <div className={cn('rounded-lg p-3 text-slate-300 flex items-center', {
              "bg-blue-600 text-white": chat.id === chatId,
              "hover: text-white": chat.id!==chatId,
            })}>
              <MessageCircle className="mr-2"/>
              <p className="text-sm truncate whitespace-nowrap text-ellipsis w-full overflow-hidden">{chat.pdfName}</p>
            </div>
          </Link>
        ))
        }
      </div>

        <div className="absolute bottom-4 left-4">
          <div className="flex items-center gap-2 text-sm text-slate-100 flex-wrap">
            <Link href="/">Home</Link>
            <Link href="/">Source</Link>
          </div>
        </div>

    </div>
  );
};

export default ChatSideBar;
