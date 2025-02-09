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
