import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromSupabase } from "./s3-server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import md5 from "md5";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getEmbeddings } from "./embeddings"; // 🔹 Now uses Hugging Face API
import { convertToAscii } from "./utils";

export const getPineconeClient = () => {
  return new Pinecone({
    apiKey: process.env.PINECONE_API!,
    
  });
};

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};


export async function loadS3IntoPinecone(fileKey: string) {
  console.log("📥 Downloading from Supabase...");
  const file_name = await downloadFromSupabase(fileKey);
  if (!file_name) {
    throw new Error("❌ Could not download from Supabase");
  }

  console.log("📄 Loading PDF into memory:", file_name);
  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];

  console.log(`📑 Processing ${pages.length} pages...`);
  const documents = (await Promise.all(pages.map(prepareDocument))).flat();

  console.log("🔎 Generating embeddings...");
  // const vectors = await Promise.all(documents.map(embedDocument));
  const vectors = await Promise.all(documents.map(embedDocument));

  console.log("📤 Uploading vectors to Pinecone...");
  const client = await getPineconeClient();
  const pineconeIndex = await client.index("chatpdf1");
  const namespace = pineconeIndex.namespace(convertToAscii(fileKey));

  console.log("✅ Pinecone connected. Uploading vectors...");
  console.log("📌 First vector:", vectors[0]); // Logs first vector

  await namespace.upsert(vectors);
  console.log("✅ Vectors inserted into Pinecone!");

  return documents[0];
}

function truncateText(text: string, maxLength: number = 500): string {
  return text.length > maxLength ? text.substring(0, maxLength) : text;
}


// export async function loadS3IntoPinecone(fileKey: string) {
//   console.log("📥 Downloading from Supabase...");
//   const file_name = await downloadFromSupabase(fileKey);
//   if (!file_name) {
//     throw new Error("❌ Could not download from Supabase");
//   }

//   console.log("📄 Loading PDF into memory:", file_name);
//   const loader = new PDFLoader(file_name);
//   const pages = (await loader.load()) as PDFPage[];

//   console.log(`📑 Processing ${pages.length} pages...`);
//   const documents = (await Promise.all(pages.map(prepareDocument))).flat(); // ✅ Flatten once

//   console.log("🔎 Generating embeddings...");
//   const vectors = await Promise.all(documents.map(embedDocument));

//   console.log("📤 Uploading vectors to Pinecone...");
//   const client = await getPineconeClient();
//   const pineconeIndex = await client.index("chatpdf");
//   const namespace = pineconeIndex.namespace(convertToAscii(fileKey));
//   console.log("inserting vectors into pinecone");
//   await namespace.upsert(vectors);
//   console.log("✅ Vectors inserted into Pinecone!");

//   return documents[0]; // Return first document for debugging
// }

async function embedDocument(doc: Document) {
  try {
    const text = truncateText(doc.pageContent); // Extract and truncate text
    const embeddings = await getEmbeddings(text);
    console.log("✅ Generated Embeddings:", embeddings.length);

    if (!embeddings || !Array.isArray(embeddings) || embeddings.length === 0) {
      throw new Error("❌ Empty embeddings array received!");
    }

    return {
      id: md5(text),
      values: embeddings,
      metadata: {
        text,
        pageNumber: doc.metadata?.pageNumber || 0, // Ensure page number exists
      },
    } as PineconeRecord;
  } catch (error) {
    console.error("❌ Error embedding document:", error);
    throw error;
  }
}



// async function embedDocument(doc: Document) {
//   try {
//     const embeddings = await getEmbeddings(doc.pageContent); // 🔹 Now using Hugging Face API
//     const hash = md5(doc.pageContent);

//     return {
//       id: hash,
//       values: embeddings,
//       metadata: {
//         text: doc.metadata?.text || "", // ✅ Prevent undefined errors
//         pageNumber: doc.metadata?.pageNumber || 0,
//       },
//     } as PineconeRecord;
//   } catch (error) {
//     console.error("❌ Error embedding document:", error);
//     throw error;
//   }
// }

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage) {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/\n/g, ""); // 🔹 Removes unnecessary newlines

  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber || 0, // ✅ Prevents undefined page numbers
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);

  return docs;
}



// import { Pinecone, PineconeRecord, } from "@pinecone-database/pinecone";
// import { downloadFromSupabase } from "./s3-server";
// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"; // ✅ Corrected import
// import md5 from "md5";
// import { Document } from "@langchain/core/documents";

// import {
  
//   RecursiveCharacterTextSplitter,
// } from "@langchain/textsplitters";
 
// import { getEmbeddings } from "./embeddings";
// import { convertToAscii } from "./utils";

// export const getPineconeClient = () => {
//   return new Pinecone({
//     // environment: process.env.PINECONE_ENVIRONMENT!,
//     apiKey: process.env.PINECONE_API_KEY!,
//   });
// };

// type PDFPage = {
//   pageContent: string;
//   metadata: {
//     loc: { pageNumber: number };
//   };
// };

// export async function loadS3IntoPinecone(fileKey: string) {
//   console.log("Downloading from S3...");
//   const file_name = await downloadFromSupabase(fileKey);
//   if (!file_name) {
//     throw new Error("Could not download from S3");
//   }

//   console.log("Loading PDF into memory: " + file_name);
//   const loader = new PDFLoader(file_name);
//   const pages = (await loader.load()) as PDFPage[];
// //   const pages = await loader.load();
// //   return pages;
//   const documents = await Promise.all(pages.map(prepareDocument));

//   const vectors = await Promise.all(documents.flat().map(embedDocument));

//   const client = await getPineconeClient();
//   const pineconeIndex = await client.index("chatpdf");
//   const namespace = pineconeIndex.namespace(convertToAscii(fileKey));

//   console.log("Inserting vectors into Pinecone...");
  
//   await namespace.upsert(vectors);

//   return documents[0];
// }

// async function embedDocument(doc: Document) {
//   try {
//     const embeddings = await getEmbeddings(doc.pageContent);
//     const hash = md5(doc.pageContent);

//     return {
//       id: hash,
//       values: embeddings,
//       metadata: {
//         text: doc.metadata.text,
//         pageNumber: doc.metadata.pageNumber,
//       },
//     } as PineconeRecord;
//   } catch (error) {
//     console.error("Error embedding document:", error);
//     throw error;
//   }
// }

// export const truncateStringByBytes = (str: string, bytes: number) => {
//   const enc = new TextEncoder();
//   return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
// };

// async function prepareDocument(page: PDFPage) {
//   let { pageContent, metadata } = page;
//   pageContent = pageContent.replace(/\n/g, ""); 

//   const splitter = new RecursiveCharacterTextSplitter(); 
//   const docs = await splitter.splitDocuments([
//     new Document({
//       pageContent,
//       metadata: {
//         pageNumber: metadata.loc.pageNumber,
//         text: truncateStringByBytes(pageContent, 36000),
//       },
//     }),
//   ]);
//   return docs;
// }


// import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
// import { downloadFromSupabase } from "./s3-server";
// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import md5 from "md5";
// import { Document } from "@langchain/core/documents";
// import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
// import { getEmbeddings } from "./embeddings";
// import { convertToAscii } from "./utils";

// export const getPineconeClient = () => {
//   return new Pinecone({
//     apiKey: process.env.PINECONE_API_KEY!,
//   });
// };

// type PDFPage = {
//   pageContent: string;
//   metadata: {
//     loc: { pageNumber: number };
//   };
// };

// export async function loadS3IntoPinecone(fileKey: string) {
//   console.log("📥 Downloading from Supabase...");
//   const file_name = await downloadFromSupabase(fileKey);
//   if (!file_name) {
//     throw new Error("❌ Could not download from Supabase");
//   }

//   console.log("📄 Loading PDF into memory: " + file_name);
//   const loader = new PDFLoader(file_name);
//   const pages = (await loader.load()) as PDFPage[];

//   console.log(`📑 Processing ${pages.length} pages...`);
//   const documents = (await Promise.all(pages.map(prepareDocument))).flat(); // ✅ Flatten once

//   console.log("🔎 Generating embeddings...");
//   const vectors = await Promise.all(documents.map(embedDocument));

//   console.log("📤 Uploading vectors to Pinecone...");
//   const client = await getPineconeClient();
//   const pineconeIndex = await client.index("chatpdf");
//   const namespace = pineconeIndex.namespace(convertToAscii(fileKey));

//   await namespace.upsert(vectors);
//   console.log("✅ Vectors inserted into Pinecone!");

//   return documents[0]; // Return first document for debugging
// }

// async function embedDocument(doc: Document) {
//   try {
//     const embeddings = await getEmbeddings(doc.pageContent);
//     const hash = md5(doc.pageContent);

//     return {
//       id: hash,
//       values: embeddings,
//       metadata: {
//         text: doc.metadata?.text || "", // ✅ Prevent undefined errors
//         pageNumber: doc.metadata?.pageNumber || 0,
//       },
//     } as PineconeRecord;
//   } catch (error) {
//     console.error("❌ Error embedding document:", error);
//     throw error;
//   }
// }

// export const truncateStringByBytes = (str: string, bytes: number) => {
//   const enc = new TextEncoder();
//   return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
// };

// async function prepareDocument(page: PDFPage) {
//   let { pageContent, metadata } = page;
//   pageContent = pageContent.replace(/\n/g, "");

//   const splitter = new RecursiveCharacterTextSplitter();
//   const docs = await splitter.splitDocuments([
//     new Document({
//       pageContent,
//       metadata: {
//         pageNumber: metadata.loc.pageNumber,
//         text: truncateStringByBytes(pageContent, 36000),
//       },
//     }),
//   ]);

//   return docs;
// }
