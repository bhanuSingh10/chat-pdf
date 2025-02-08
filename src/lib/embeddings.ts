import { spawn } from "child_process";

export async function getEmbeddings(text: string): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python", ["./generate_embeddings.py", text]);

    let output = "";
    pythonProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error("Python error:", data.toString());
      reject(new Error("Error generating embeddings"));
    });

    pythonProcess.on("close", () => {
      try {
        const embeddings = JSON.parse(output);
        resolve(embeddings);
      } catch (error) {
        reject(new Error("Invalid response from embedding script"));
      }
    });
  });
}




// import { OpenAIApi, Configuration } from "openai-edge";

// const config = new Configuration({
//   apiKey: process.env.OPENAI_KEY, // ✅ Ensure this key is set
// });

// const openai = new OpenAIApi(config);

// export async function getEmbeddings(text: string) {
//   try {
//     console.log("🔍 Sending request to OpenAI Embeddings API...");

//     const response = await openai.createEmbedding({
//       model: "text-embedding-ada-002",
//       input: text.replace(/\n/g, " "),
//     });

//     const result = await response.json();
//     console.log("📄 OpenAI API Response:", JSON.stringify(result, null, 2)); // ✅ Log the response

//     if (!result || !result.data || !Array.isArray(result.data) || result.data.length === 0) {
//       throw new Error("Invalid OpenAI response: Missing 'data' field");
//     }

//     return result.data[0].embedding as number[];
//   } catch (error) {
//     console.error("❌ Error calling OpenAI embeddings API:", error);
//     throw error;
//   }
// }
// import fetch from "node-fetch";

// export async function getEmbeddings(text: string) {
//   try {
//     console.log("🔍 Sending request to Hugging Face API...");

//     const response = await fetch(
//       "https://api-inference.huggingface.co/models/sentence-transformers/all-mpnet-base-v2",{
// //  "https://api-inference.huggingface.co/models/sentence-transformers/all-mpnet-base-v2",      {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ inputs: text }), // ✅ Send as a string, NOT an array
//       }
//     );

//     const result = await response.json();
//     console.log("📄 Hugging Face Response:", JSON.stringify(result, null, 2));

//     if (!result || !Array.isArray(result) || result.length === 0) {
//       throw new Error(`Invalid Hugging Face response: ${JSON.stringify(result)}`);
//     }

//     return result[0]; // ✅ Returns the correct embedding
//   } catch (error) {
//     console.error("❌ Error calling Hugging Face API:", error);
//     throw error;
//   }
// }
