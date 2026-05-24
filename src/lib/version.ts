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
  /** legacy: direct .dmg link or releases page (kept for backwards compat with privacy.astro) */
  downloadUrl: string;
  /** macOS apple-silicon .dmg, or releases page fallback */
  macUrl: string;
  /** macOS intel .dmg (marka.md_intel.dmg). Empty until v1.3.8 ships intel artifacts. */
  macIntelUrl: string;
  /** Windows -setup.exe (NSIS), or releases page fallback. Empty when no Windows asset on the release. */
  windowsUrl: string;
  /** Linux .AppImage (preferred) or .deb. Empty until v1.1.1 ships Linux. */
  linuxUrl: string;
  /** releases listing page — always safe fallback */
  releasesPageUrl: string;
};

const FALLBACK: Release = {
  tag: "v0.1.5",
  downloadUrl: RELEASES_PAGE,
  macUrl: RELEASES_PAGE,
  macIntelUrl: "",
  windowsUrl: "",
  linuxUrl: "",
  releasesPageUrl: RELEASES_PAGE,
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

    // macOS: apple silicon = marka.md.dmg (post-rename) or *_aarch64.dmg (pre-rename).
    // intel = marka.md_intel.dmg (post-rename). Fall back to any .dmg, then releases page.
    const aarch64 = assets.find((a) => a.name === "marka.md.dmg")
      ?? assets.find((a) => a.name?.endsWith("_aarch64.dmg"));
    const intel = assets.find((a) => a.name === "marka.md_intel.dmg")
      ?? assets.find((a) => a.name?.includes("x64") && a.name?.endsWith(".dmg"));
    const anyDmg = assets.find((a) => a.name?.endsWith(".dmg"));
    const macUrl =
      aarch64?.browser_download_url ??
      anyDmg?.browser_download_url ??
      RELEASES_PAGE;
    const macIntelUrl = intel?.browser_download_url ?? "";

    // Windows: prefer the NSIS installer (-setup.exe); MSI as fallback.
    const winSetup = assets.find((a) => a.name?.endsWith("-setup.exe"));
    const winMsi = assets.find((a) => a.name?.endsWith(".msi"));
    const windowsUrl =
      winSetup?.browser_download_url ?? winMsi?.browser_download_url ?? "";

    // Linux: AppImage is the distro-agnostic single-binary; .deb covers Debian/Ubuntu.
    // Empty until v1.1.1 ships Linux artifacts — the landing dropdown greys this row.
    const linuxAppImage = assets.find((a) => a.name?.endsWith(".AppImage"));
    const linuxDeb = assets.find((a) => a.name?.endsWith(".deb"));
    const linuxUrl =
      linuxAppImage?.browser_download_url ?? linuxDeb?.browser_download_url ?? "";

    cached = {
      tag,
      downloadUrl: macUrl,
      macUrl,
      macIntelUrl,
      windowsUrl,
      linuxUrl,
      releasesPageUrl: RELEASES_PAGE,
    };
    return cached;
  } catch (err) {
    console.warn("[markamd-site] release fetch failed, using fallback:", err);
    cached = FALLBACK;
    return cached;
  }
}

// ─── live repo stats (build-time only) ──────────────────────────────────────
// Used by the landing's "in the wild" stats strip. Stars come from the repo
// endpoint, downloads are the sum of recent release-asset download counts, open
// issues come from search API (lets us exclude PRs). All fail-safe to zeros.

export type RepoStats = {
  stars: number;
  forks: number;
  /** sum of all release asset download counts across recent releases */
  downloads: number;
  /** open issues only (PRs excluded via the search API filter) */
  openIssues: number;
};

const STATS_FALLBACK: RepoStats = { stars: 0, forks: 0, downloads: 0, openIssues: 0 };

let statsCached: RepoStats | null = null;

export async function getRepoStats(): Promise<RepoStats> {
  if (statsCached) return statsCached;
  try {
    const headers = { Accept: "application/vnd.github+json" };
    const [repoRes, releasesRes, issuesRes] = await Promise.all([
      fetch("https://api.github.com/repos/mattenarle10/markamd", { headers }),
      fetch("https://api.github.com/repos/mattenarle10/markamd/releases?per_page=20", { headers }),
      fetch(
        "https://api.github.com/search/issues?q=repo:mattenarle10/markamd+is:issue+is:open&per_page=1",
        { headers },
      ),
    ]);
    if (!repoRes.ok || !releasesRes.ok) {
      statsCached = STATS_FALLBACK;
      return statsCached;
    }
    const repo = (await repoRes.json()) as {
      forks_count?: number;
      stargazers_count?: number;
    };
    const releases = (await releasesRes.json()) as Array<{
      assets?: Array<{ download_count?: number }>;
    }>;
    const issues = issuesRes.ok
      ? ((await issuesRes.json()) as { total_count?: number })
      : { total_count: 0 };
    const downloads = releases.reduce(
      (sum, r) =>
        sum + (r.assets ?? []).reduce((s, a) => s + (a.download_count ?? 0), 0),
      0,
    );
    statsCached = {
      stars: repo.stargazers_count ?? 0,
      forks: repo.forks_count ?? 0,
      downloads,
      openIssues: issues.total_count ?? 0,
    };
    return statsCached;
  } catch (err) {
    console.warn("[markamd-site] stats fetch failed, using zeros:", err);
    statsCached = STATS_FALLBACK;
    return statsCached;
  }
}
