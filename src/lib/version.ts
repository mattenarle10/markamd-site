// fetched at build time by every page that imports getLatestRelease().
// astro renders the result into static HTML — no client-side fetch.
//
// unauthenticated github api → 60 req/hr per ip. for vercel builds this is
// well within budget. on failure we fall back to FALLBACK so the build
// never breaks because of a flaky network.
//
// /releases?per_page=1 includes prereleases (vs /releases/latest which
// silently skips them). matches the current ship strategy: unsigned
// prerelease dmgs go live first; signed/notarized stable comes later.

const RELEASES_PAGE = "https://github.com/mattenarle10/markamd/releases/latest";
const API =
  "https://api.github.com/repos/mattenarle10/markamd/releases?per_page=1";

export type Release = {
  tag: string;
  /** direct .dmg link from the latest release's assets, or releases page as fallback */
  downloadUrl: string;
};

const FALLBACK: Release = {
  tag: "v0.1.5",
  downloadUrl: RELEASES_PAGE,
};

let cached: Release | null = null;

type ApiRelease = {
  tag_name?: string;
  assets?: Array<{ name?: string; browser_download_url?: string }>;
};

export async function getLatestRelease(): Promise<Release> {
  if (cached) return cached;
  try {
    const res = await fetch(API, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) throw new Error(`gh api ${res.status}`);
    const arr = (await res.json()) as ApiRelease[];
    const release = arr[0];
    if (!release) throw new Error("no releases found");

    const tag = release.tag_name ?? FALLBACK.tag;
    const assets = release.assets ?? [];
    // prefer apple silicon .dmg (most macs in 2026); fall back to any .dmg;
    // last resort, point at the releases listing page so the user can pick.
    const aarch64 = assets.find((a) => a.name?.endsWith("_aarch64.dmg"));
    const anyDmg = assets.find((a) => a.name?.endsWith(".dmg"));
    const downloadUrl =
      aarch64?.browser_download_url ??
      anyDmg?.browser_download_url ??
      RELEASES_PAGE;

    cached = { tag, downloadUrl };
    return cached;
  } catch (err) {
    console.warn("[markamd-site] release fetch failed, using fallback:", err);
    cached = FALLBACK;
    return cached;
  }
}
