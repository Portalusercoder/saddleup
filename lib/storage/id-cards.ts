import type { SupabaseClient } from "@supabase/supabase-js";
import { STORAGE_BUCKETS } from "@/lib/constants";

const BUCKET = STORAGE_BUCKETS.ID_CARDS;
const SIGNED_TTL_SEC = 60 * 15; // 15 minutes

/** Extract object path from a stored public URL or bare path. */
export function idCardStoragePath(stored: string | null | undefined): string | null {
  if (!stored?.trim()) return null;
  const raw = stored.trim().split("?")[0]!;

  if (!raw.startsWith("http://") && !raw.startsWith("https://")) {
    return raw.replace(/^\/+/, "");
  }

  const markers = [
    `/object/public/${BUCKET}/`,
    `/object/sign/${BUCKET}/`,
    `/object/authenticated/${BUCKET}/`,
    `/${BUCKET}/`,
  ];
  for (const marker of markers) {
    const idx = raw.indexOf(marker);
    if (idx !== -1) {
      return decodeURIComponent(raw.slice(idx + marker.length));
    }
  }
  return null;
}

export async function createIdCardSignedUrl(
  supabase: SupabaseClient,
  storedOrPath: string,
  expiresIn = SIGNED_TTL_SEC
): Promise<string | null> {
  const path = idCardStoragePath(storedOrPath);
  if (!path) return null;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error || !data?.signedUrl) {
    console.error("createIdCardSignedUrl:", error?.message);
    return null;
  }
  return data.signedUrl;
}

export function idCardViewHref(
  kind: "rider" | "member",
  id: string
): string {
  return kind === "rider"
    ? `/api/riders/${id}/id-card`
    : `/api/members/${id}/id-card`;
}
