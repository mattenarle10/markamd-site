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
  name?: string;
  published_at?: string;
  body?: string;
  html_url?: string;
  prerelease?: boolean;
  assets?: Array<{ name?: string; browser_download_url?: string }>;
};

export type ReleaseEntry = {
  tag: string;
  name: string;
  publishedAt: string;
  body: string;
  htmlUrl: string;
  isPrerelease: boolean;
};

let releasesCached: ReleaseEntry[] | null = null;

/**
 * Fetched at build time by /changelog. Returns up to `limit` most recent
 * releases (newest first). On API failure returns an empty array — the page
 * gracefully degrades to a link to the GitHub releases listing.
 */
export async function getReleases(limit = 20): Promise<ReleaseEntry[]> {
  if (releasesCached) return releasesCached;
  try {
    const res = await fetch(
      `https://api.github.com/repos/mattenarle10/markamd/releases?per_page=${limit}`,
      { headers: { Accept: "application/vnd.github+json" } },
    );
    if (!res.ok) throw new Error(`gh api ${res.status}`);
    const arr = (await res.json()) as ApiRelease[];
    releasesCached = arr.map((r): ReleaseEntry => ({
      tag: r.tag_name ?? "",
      name: r.name ?? r.tag_name ?? "",
      publishedAt: r.published_at ?? "",
      body: r.body ?? "",
      htmlUrl: r.html_url ?? RELEASES_PAGE,
      isPrerelease: r.prerelease ?? false,
    }));
    return releasesCached;
  } catch (err) {
    console.warn("[markamd-site] releases fetch failed, returning empty:", err);
    releasesCached = [];
    return releasesCached;
  }
}

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
