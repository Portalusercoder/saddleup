import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { fetchHorseHeadlines } from "@/lib/news/fetchHorseHeadlines";

const getCachedHeadlines = unstable_cache(
  () => fetchHorseHeadlines(),
  ["horse-news-headlines-v1"],
  { revalidate: 600 }
);

export async function GET() {
  try {
    const { headlines, source } = await getCachedHeadlines();
    return NextResponse.json({ headlines, source });
  } catch {
    return NextResponse.json({ headlines: [], source: "none" as const });
  }
}
