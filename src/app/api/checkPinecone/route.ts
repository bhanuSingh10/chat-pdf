import { NextResponse } from "next/server";

export async function GET() {
  const PINECONE_API_KEY = process.env.PINECONE_API!;
  const PINECONE_INDEX_HOST = process.env.PINECONE_INDEX_HOST;

  try {
    const response = await fetch(
      `${PINECONE_INDEX_HOST}/describe_index_stats`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Api-Key": PINECONE_API_KEY
        }
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Pinecone stats" },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log("Pinecone Index Stats:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error(" Error fetching Pinecone stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
