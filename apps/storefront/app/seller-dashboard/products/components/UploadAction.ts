import { authApiFetch } from "@/lib/authApiFetch";

const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL;

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const data = await authApiFetch<{ data: { url: string } }>(
    `/media/upload`, 
    {
      method: "POST",
      body: formData,
    },
  );

  return data.data.url;
};

export const deleteImage = async (fileUrl: string): Promise<void> => {
  const key = fileUrl.startsWith("http")
    ? fileUrl.replace(`${MEDIA_URL}/`, "")
    : fileUrl;

  await authApiFetch(
    `/media/delete?key=${encodeURIComponent(key)}`,
    { method: "DELETE" },
  );
};