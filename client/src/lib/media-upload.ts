import type NDK from "@nostr-dev-kit/ndk";
import NDKBlossom from "@nostr-dev-kit/ndk-blossom";

const BLOSSOM_PRIMARY = "https://blossom.primal.net";
const BLOSSOM_FALLBACK = "https://blossom.nostr.build";

export async function uploadMedia(
  file: File,
  ndk: NDK | null
): Promise<string> {
  if (ndk?.signer) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blossom = new NDKBlossom(ndk as any);
      const imeta = await blossom.upload(file, {
        server: BLOSSOM_PRIMARY,
        fallbackServer: BLOSSOM_FALLBACK,
      });

      const url = imeta?.url;
      if (url) {
        console.log("[MediaUpload] Blossom upload success:", url);
        return url;
      }
      throw new Error("No URL in Blossom response");
    } catch (err) {
      console.warn("[MediaUpload] Blossom upload failed, falling back to local:", err);
    }
  }

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
