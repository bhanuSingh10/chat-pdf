// import { createClient } from "@supabase/supabase-js";
// import fs from "fs";
// import path from "path";

// // Initialize Supabase client
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );

// export async function downloadFromSupabase(file_key: string): Promise<string> {
//   return new Promise(async (resolve, reject) => {
//     try {
//       // 1️⃣ Get file from Supabase Storage
//       const { data, error } = await supabase.storage
//         .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET!)
//         .download(file_key);

//       if (error || !data) {
//         console.error("Supabase download error:", error);
//         reject(error || new Error("File not found in Supabase"));
//         return;
//       }

//       // 2️⃣ Define local file path
//       const file_name = path.join("/tmp", `downloaded_${Date.now()}.pdf`);
//       const fileStream = fs.createWriteStream(file_name);

//       // 3️⃣ Write to local file
//       const buffer = await data.arrayBuffer();
//       fs.writeFileSync(file_name, Buffer.from(buffer));

//       console.log("File downloaded successfully:", file_name);
//       resolve(file_name);
//     } catch (error) {
//       console.error("Error downloading from Supabase:", error);
//       reject(error);
//     }
//   });
// }

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function downloadFromSupabase(file_key: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`🔍 Attempting to download: ${file_key}`);

      // 1️⃣ Get file from Supabase Storage
      const { data, error } = await supabase.storage
        .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET!)
        .download(file_key);

      if (error || !data) {
        console.error("❌ Supabase download error:", error);
        reject(error || new Error("File not found in Supabase"));
        return;
      }

      // 2️⃣ Define the folder path inside your project
      const folderPath = path.join(process.cwd(), "tmp");

      // ✅ Ensure the folder exists
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        console.log("📁 Created folder:", folderPath);
      }

      // 3️⃣ Define the file path inside the folder
      const file_name = path.join(folderPath, `downloaded_${Date.now()}.pdf`);

      // 4️⃣ Write file to the `chatpdf/tmp` directory
      const buffer = await data.arrayBuffer();
      fs.writeFileSync(file_name, Buffer.from(buffer));

      console.log("✅ File downloaded successfully:", file_name);
      resolve(file_name);
    } catch (error) {
      console.error("❌ Error downloading from Supabase:", error);
      reject(error);
    }
  });
}
