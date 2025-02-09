import { NextResponse } from "next/server";
import { getContext, getMatchesFromEmbeddings } from "@/lib/context"; // ✅ Extract PDF context
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    console.log("📩 Received request at /api/chat");

    const { messages, chatId } = await req.json();
    console.log("🛠️ Parsed request body:", { chatId, messages });

    // ✅ Validate chatId
    if (!chatId) {
      console.error("❌ chatId is missing!");
      return NextResponse.json({ error: "chatId is required" }, { status: 400 });
    }

    // ✅ Fetch chat from DB
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
    if (_chats.length !== 1) {
      console.error("❌ Chat not found for chatId:", chatId);
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const fileKey = _chats[0].fileKey;
    console.log("📄 Retrieved fileKey:", fileKey);

    // ✅ Extract the last user message
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage?.content?.trim()) {
      console.error("❌ Empty message detected!");
      return NextResponse.json({ error: "Message content is empty" }, { status: 400 });
    }

    console.log("📨 Fetching PDF context...");
    const context = await getContext(lastMessage.content, fileKey); // ✅ Get related PDF text
    console.log("📄 Extracted Context:", context);

    // ✅ Construct a better prompt for Gemini
    const prompt = `
  You are a helpful assistant. Use the following context to answer the user's question:

  --- START CONTEXT ---
  Career Summary:
  ${context}
  --- END CONTEXT ---
`;

    // const prompt = `
    //   You are a helpful AI assistant with access to a PDF document.
    //   Use only the following context to answer the user's question:

    //   --- START PDF CONTEXT ---
    //   ${context}
    //   --- END PDF CONTEXT ---

    //   If the answer is **not in the context**, respond:
    //   "I couldn't find this information in the provided document."
    // `;

    console.log("📨 Sending request to Gemini...");

    // ✅ Send request to Gemini API
  
    const API_KEY = process.env.GEMINI_API_KEY;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }], // ✅ Send PDF context + user question
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
            stopSequences: ["\n\n"],
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Gemini API Error:", errorData);
      return NextResponse.json({ error: errorData }, { status: 500 });
    }

    const data = await response.json();
    const completion = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure about that.";

    console.log("✅ Gemini Response:", completion);

    return NextResponse.json({ response: completion });
  } catch (error) {
    console.error("❌ Error in API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


