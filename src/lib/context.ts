import { Pinecone } from "@pinecone-database/pinecone";
import { convertToAscii } from "@/lib/utils";
import { getEmbeddings } from "@/lib/embeddings";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // ✅ Use Node.js runtime instead of Edge

export async function getMatchesFromEmbeddings(
  embeddings: number[],
  fileKey: string
) {
  try {
    console.log(
      "🟢 Querying Pinecone with namespace:",
      convertToAscii(fileKey)
    );

    const PINECONE_API_KEY = process.env.PINECONE_API!;
    const PINECONE_INDEX_HOST =
      "https://chatpdf1-jrcnwuf.svc.aped-4627-b74a.pinecone.io"; // Your Pinecone index URL

    const response = await fetch(`${PINECONE_INDEX_HOST}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": PINECONE_API_KEY
      },
      body: JSON.stringify({
        vector: embeddings,
        topK: 10,
        includeMetadata: true,
        namespace: convertToAscii(fileKey) // Keep namespace logic
      })
    });

    if (!response.ok) {
      console.error("❌ Pinecone API Error:", await response.text());
      return [];
    }

    const data = await response.json();
    return data.matches || [];
  } catch (error) {
    console.error("❌ Error querying Pinecone:", error);
    return [];
  }
}

export async function getContext(query: string, fileKey: string) {
  try {
    // Log extracted text to debug

    const queryEmbeddings = await getEmbeddings(query); // Generate embeddings
    //
    const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);
    console.log("📄 Pinecone Matches:", JSON.stringify(matches, null, 2));

    // Filter the results to ensure good matches
    const qualifyingDocs = matches.filter(
      (match: { score: number }) => match.score > 0.3
    );
    console.log("📜 Qualifying Docs:", JSON.stringify(qualifyingDocs, null, 2));

    // const queryEmbeddings = await getEmbeddings(query); // Generate embeddings
    // const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

    // // ✅ Filter relevant matches
    // const qualifyingDocs = matches.filter((match:{score: number}) => match.score && match.score > 0.5);

    type Metadata = {
      text: string;
      pageNumber: number;
    };

    let docs = qualifyingDocs.map(
      (match: { metadata: Metadata }) => (match.metadata as Metadata).text
    );
    console.log("📜 Extracted PDF Text:", docs);
    // ✅ Return top 3000 characters of context
    return docs.join("\n").substring(0, 3000);
  } catch (error) {
    console.error("❌ Error getting context:", error);
    return "";
  }
}
