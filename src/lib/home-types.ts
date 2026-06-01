export type Feature = {
  title: string;
  body: string;
};

export type FeaturedLink = {
  name: string;
  meta: string;
  href: string;
};

export type ReleaseHighlight = {
  eyebrow: string;
  title: string;
  body: string;
  items: { label: string; body: string }[];
};

export type RepoStats = {
  stars: number;
  forks: number;
  downloads: number;
};

export type Shortcut = {
  key: string;
  label: string;
};

export type Step = {
  n: string;
  art: string;
  title: string;
  body: string;
};

export type ThemeFamily = {
  name: string;
  sub: string;
  note: string;
  swatches: string[][];
};
