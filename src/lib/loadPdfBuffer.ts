import pdfParse from "pdf-parse";
import { Document } from "@langchain/core/documents";

/**
 * Convert a PDF buffer into LangChain Document[]
 */
export async function loadPDFBuffer(buffer: Buffer): Promise<Document[]> {
  const data = await pdfParse(buffer);

  return [
    new Document({
      pageContent: data.text,
      metadata: { source: "buffer-upload" }
    })
  ];
}
