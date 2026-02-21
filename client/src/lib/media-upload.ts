import { NDKEvent } from "@nostr-dev-kit/ndk";
import type NDK from "@nostr-dev-kit/ndk";

const NOSTR_BUILD_URL = "https://nostr.build/api/v2/upload/files";

async function createNip98AuthEvent(
  ndk: NDK,
  url: string,
  method: string = "POST"
): Promise<string> {
  const event = new NDKEvent(ndk);
  event.kind = 27235;
  event.created_at = Math.floor(Date.now() / 1000);
  event.tags = [
    ["u", url],
    ["method", method],
  ];
  await event.sign();
  const rawEvent = event.rawEvent();
  return btoa(JSON.stringify(rawEvent));
}

export async function uploadToNostrBuild(
  file: File,
  ndk: NDK | null
): Promise<string> {
  const formData = new FormData();
  formData.append("fileToUpload", file, file.name);

  const headers: Record<string, string> = {};

  if (ndk?.signer) {
    try {
      const authToken = await createNip98AuthEvent(ndk, NOSTR_BUILD_URL, "POST");
      headers["Authorization"] = `Nostr ${authToken}`;
    } catch (err) {
      console.warn("[MediaUpload] Failed to create NIP-98 auth, trying without:", err);
    }
  }

  const response = await fetch(NOSTR_BUILD_URL, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    console.error("[MediaUpload] nostr.build response:", response.status, errorText);
    throw new Error(`Upload failed: ${response.status}`);
  }

  const data = await response.json();

  const uploadedUrl =
    data?.data?.[0]?.url ||
    (data?.data?.[0]?.tags &&
      data.data[0].tags.find((t: string[]) => t[0] === "url")?.[1]);

  if (!uploadedUrl) {
    console.error("[MediaUpload] No URL in nostr.build response:", data);
    throw new Error("No URL returned from upload");
  }

  console.log("[MediaUpload] Successfully uploaded to nostr.build:", uploadedUrl);
  return uploadedUrl;
}

export async function uploadMedia(
  file: File,
  ndk: NDK | null
): Promise<string> {
  try {
    return await uploadToNostrBuild(file, ndk);
  } catch (err) {
    console.warn("[MediaUpload] nostr.build failed, falling back to local upload:", err);

    const formData = new FormData();
    formData.append("image", file);
    const response = await fetch("/api/upload", { method: "POST", body: formData });
    if (!response.ok) throw new Error("Local upload failed");
    const data = await response.json();

    if (data.url.startsWith("/uploads/")) {
      return window.location.origin + data.url;
    }
    return data.url;
  }
}
