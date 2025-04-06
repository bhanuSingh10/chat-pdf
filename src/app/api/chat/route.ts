import { NextResponse } from "next/server";
import { getContext } from "@/lib/context"; // Your PDF context extraction
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    console.log("📩 Received request at /api/chat");

    const { messages, chatId } = await req.json();
    console.log("🛠️ Parsed request body:", { chatId, messages });

    if (!chatId) {
      console.error("❌ chatId is missing!");
      return NextResponse.json({ error: "chatId is required" }, { status: 400 });
    }

    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
    if (_chats.length !== 1) {
      console.error("❌ Chat not found for chatId:", chatId);
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const fileKey = _chats[0].fileKey;
    console.log("📄 Retrieved fileKey:", fileKey);

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.content?.trim()) {
      console.error("❌ Empty message content!");
      return NextResponse.json({ error: "Message content is empty" }, { status: 400 });
    }

    console.log("📨 Fetching PDF context...");
    const context = await getContext(lastMessage.content, fileKey);

    console.log("📄 Extracted Context:", context);

    const prompt = `
You are a helpful assistant. Use the following PDF context to answer the user's question.

--- START CONTEXT ---
${context}
--- END CONTEXT ---

If the answer is not in the context, say: "I couldn't find this information in the provided document."
User's question: ${lastMessage.content}
`;

    const API_KEY = process.env.GEMINI_API_KEY;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
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



