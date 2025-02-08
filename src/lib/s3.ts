import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function uploadToSupabase(file: File): Promise<{ file_key: string; file_name: string }> {
  const file_key = `uploads/${Date.now()}-${file.name.replace(" ", "-")}`;

  const { data, error } = await supabase.storage
    .from("chatpdf")
    .upload(file_key, file, { cacheControl: "3600", upsert: false });

  if (error) throw error;

  return { file_key, file_name: file.name };
}

export function getSupabaseUrl(file_key: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/chatpdf/${file_key}`;
}
