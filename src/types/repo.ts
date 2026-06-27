export type Repo = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  archived: boolean;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  homepage: string | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  /** Derived in the data layer: updated within the recency window. */
  recent?: boolean;
};
