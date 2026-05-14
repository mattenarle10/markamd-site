// fetched at build time by every page that imports getLatestVersion().
// astro renders the result into static HTML — no client-side fetch.
//
// unauthenticated github api → 60 req/hr per ip. for vercel builds this is
// well within budget. on failure we fall back to FALLBACK so the build
// never breaks because of a flaky network.

const FALLBACK = "v0.1.5";
const API =
  "https://api.github.com/repos/mattenarle10/markamd/releases/latest";

let cached: string | null = null;

export async function getLatestVersion(): Promise<string> {
  if (cached) return cached;
  try {
    const res = await fetch(API, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) throw new Error(`gh api ${res.status}`);
    const data = (await res.json()) as { tag_name?: string };
    cached = data.tag_name ?? FALLBACK;
    return cached;
  } catch (err) {
    console.warn("[markamd-site] version fetch failed, using fallback:", err);
    cached = FALLBACK;
    return cached;
  }
}
