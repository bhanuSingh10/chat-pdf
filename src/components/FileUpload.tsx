// "use client";
// import { Inbox, Loader2 } from "lucide-react";
// import React, { useState } from "react";
// import { useDropzone } from "react-dropzone";
// type Props = {};
// import { uploadToSupabase } from "@/lib/s3";
// import { useMutation } from "@tanstack/react-query";
// import axios from "axios";
// import { log } from "node:console";
// import toast from "react-hot-toast";

// const FileUpload = () => {
//   const [uploading, setUploading] = useState(false);
//   const { mutate, isPending } = useMutation({
//     mutationFn: async ({
//       file_key,
//       file_name
//     }: {
//       file_key: string;
//       file_name: string;
//     }) => {
//       toast.error("File too large");
//       const response = await axios.post("/api/create-chat", {
//         file_key,
//         file_name
//       });
//       return response.data;
//     }
//   });

//   const { getRootProps, getInputProps } = useDropzone({
//     accept: { "application/pdf": [".pdf"] },
//     maxFiles: 1,
//     onDrop: async (acceptedFiles) => {
//       console.log(acceptedFiles);
//       const file = acceptedFiles[0];
//       if (file.size > 10 * 1024 * 1024) {
//         alert("Please upload a file smaller than 10MB");
//         return;
//       }

//       try {
//         setUploading(true);
//         const data = await uploadToSupabase(file);
//         if (!data.file_key || !data.file_name) {
//           toast.error("Something went wrong");
//         }
//         mutate(data, {
//           onSuccess: (data) => {
//             console.log(data);
//             toast.success(data.message)
//           },
//           onError: (err) => {
//             toast.error("Error creating chat");
//           }
//         });
//         // console.log("Uploaded sucessfully:", data);
//       } catch (error) {
//         console.error("Upload error:", error);
//       } finally {
//         setUploading(false);
//       }
//     }
//   });

//   return (
//     <div className="p-2 bg-white rounded-xl">
//       <div
//         {...getRootProps({
//           className:
//             "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 flex justify-center flex-col items-center  py-8"
//         })}
//       >
//         <input {...getInputProps()} />
//         {uploading || isPending} && (
//         <>
//           <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
//           <p className="mt-2 text-sm text-slate-400">
//             Spilling tea to GPT...
//           </p>
//         </>
//         ):(
//         <>
//           <Inbox className="w-10 h-10 text-blue-500" />
//           <p className="mt-2 text-sm text-slate-400">Drop PDF Here</p>
//         </>
//         )
//       </div>
//     </div>
//   );
// };

// export default FileUpload;
'use client';
import { Inbox, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
type Props = {};
import { uploadToSupabase } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const FileUpload = () => {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      file_key,
      file_name
    }: {
      file_key: string;
      file_name: string;
    }) => {
     
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name
      });
      return response.data;
    }
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      console.log(acceptedFiles);
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large");
        return;
      }

      try {
        setUploading(true);
        const data = await uploadToSupabase(file);
        if (!data.file_key || !data.file_name) {
          toast.error("Something went wrong");
          return;
        }
        mutate(data, {
          onSuccess: ({chat_id}) => {
            toast.success("Chat created!");
            router.push(`chat/${chat_id}`)
            // toast.success(data.message);
          },
          onError: () => {
            toast.error("Error creating chat");
            return;
          }
        });
      } catch (error) {
        console.error("Upload error:", error);
      } finally {
        setUploading(false);
      }
    }
  });

  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 flex justify-center flex-col items-center py-8"
        })}
      >
        <input {...getInputProps()} />
        {uploading || isPending ? (
          <>
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">Spilling tea to GPT...</p>
          </>
        ) : (
          <>
            <Inbox className="w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm text-slate-400">Drop PDF Here</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;

