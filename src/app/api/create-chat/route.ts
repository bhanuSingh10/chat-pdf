import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { loadS3IntoPinecone } from "@/lib/pinecone";
import { getSupabaseUrl } from "@/lib/s3";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request, res: Response) {
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

    console.log(file_key, file_name); // Fix: Log correct variables
    const pages = await loadS3IntoPinecone(file_key);
    const chat_Id = await db
      .insert(chats)
      .values({
        fileKey: file_key,
        pdfName: file_name,
        pdfUrl: getSupabaseUrl(file_key),
        userId
      })
      .returning({ insertedId: chats.id });
    return NextResponse.json(
      {
        chat_Id: chat_Id[0].insertedId
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in API:", error); // Improved error logging

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
