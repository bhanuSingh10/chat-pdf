
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { loadS3IntoPinecone } from "@/lib/pinecone";
import { getSupabaseUrl } from "@/lib/s3";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      {
        error: "unauthorised"
      },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { file_key, file_name } = body;

    console.log("Received file:", file_key, file_name);

    // 🧠 Load file into Pinecone
    const pages = await loadS3IntoPinecone(file_key);

    // 💾 Insert chat into DB
    const chatInsertResult = await db
      .insert(chats)
      .values({
        fileKey: file_key,
        pdfName: file_name,
        pdfUrl: getSupabaseUrl(file_key),
        userId
      })
      .returning({ insertedId: chats.id });

    // ✅ Return correct lowercase key expected by frontend
    return NextResponse.json(
      {
        chat_id: chatInsertResult[0].insertedId
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/create-chat:", error);

    return NextResponse.json(
      {
        error: "Internal server error"
      },
      { status: 500 }
    );
  }
}
