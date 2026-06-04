import type { LiveJobData } from "@repo/db/queries/tracks";
import { detectRegion } from "../salary-data";
import { fetchAllGulfJobs } from "./fetch-gulf-jobs";
import { fetchArbeitnowJobs } from "./fetch-arbeitnow-jobs";

export type JobListing = {
  id: string;
  company: string;
  title: string;
  sourceUrl?: string;
  source: "remotive" | "remoteok" | "gulf-search" | "arbeitnow";
};


const TRACK_JOB_KEYWORDS: Record<string, { remotiveSearch: string; remoteOkTag: string }> = {
  ai_ml_engineer:      { remotiveSearch: "AI Engineer",           remoteOkTag: "ai" },
  ml_engineer:         { remotiveSearch: "ML Engineer",           remoteOkTag: "machine-learning" },
  backend_engineer:    { remotiveSearch: "Backend Engineer",      remoteOkTag: "backend" },
  frontend_engineer:   { remotiveSearch: "Frontend Engineer",     remoteOkTag: "frontend" },
  full_stack_engineer: { remotiveSearch: "Full Stack Engineer",   remoteOkTag: "full-stack" },
  devops_engineer:     { remotiveSearch: "DevOps Engineer",       remoteOkTag: "devops" },
  data_analyst:        { remotiveSearch: "Data Analyst",          remoteOkTag: "data" },
  qa_engineer:         { remotiveSearch: "QA Engineer",           remoteOkTag: "qa" },
};

type RemotiveJob = {
  id: number;
  company_name: string;
  title: string;
  publication_date: string;
  url?: string;
};

type RemotiveResponse = {
  "job-count": number;
  jobs: RemotiveJob[];
};

type RemoteOkJob = {
  id?: string;
  company?: string;
  position?: string;
  url?: string;
  date?: string;
};

async function fetchRemotive(search: string): Promise<{ listings: JobListing[]; companies: string[]; count: number }> {
  const url = `https://remotive.com/api/remote-jobs?category=software-dev&search=${encodeURIComponent(search)}&limit=50`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Remotive responded ${res.status}`);
  const data = (await res.json()) as RemotiveResponse;
  const jobs = data.jobs ?? [];
  const listings: JobListing[] = jobs
    .filter((j) => j.company_name && j.title)
    .map((j) => ({
      id: `remotive-${j.id}`,
      company: j.company_name,
      title: j.title,
      sourceUrl: j.url || `https://remotive.com/jobs?search=${encodeURIComponent(j.title)}`,
      source: "remotive" as const,
    }));
  return {
    listings,
    companies: jobs.map((j) => j.company_name).filter(Boolean),
    count: data["job-count"] ?? jobs.length,
  };
}

async function fetchRemoteOk(tag: string): Promise<{ listings: JobListing[]; companies: string[]; count: number }> {
  const url = `https://remoteok.com/api?tag=${encodeURIComponent(tag)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; graduate.dev/1.0)" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`RemoteOK responded ${res.status}`);
  const data = (await res.json()) as RemoteOkJob[];
  const jobs = data.filter((j) => j.company && j.position);
  const listings: JobListing[] = jobs.map((j) => ({
    id: `remoteok-${j.id || j.company}`,
    company: j.company!,
    title: j.position!,
    sourceUrl: j.url || `https://remoteok.com/?search=${encodeURIComponent(j.position!)}`,
    source: "remoteok" as const,
  }));
  return {
    listings,
    companies: jobs.map((j) => j.company!),
    count: jobs.length,
  };
}

function deduplicateCompanies(raw: string[]): string[] {
  // key by lowercase+trim to deduplicate, keep first-seen original casing
  const seen = new Map<string, string>();
  for (const name of raw) {
    const key = name.trim().toLowerCase();
    if (key && !seen.has(key)) seen.set(key, name.trim());
  }
  return Array.from(seen.values()).slice(0, 15);
}

function deduplicateTitles(raw: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const t of raw) {
    const key = t.trim().toLowerCase();
    if (key && !seen.has(key)) {
      seen.add(key);
      result.push(t.trim());
    }
    if (result.length >= 5) break;
  }
  return result;
}

export { detectRegion };

export async function fetchJobFeedForTrack(trackValue: string): Promise<LiveJobData | null> {
  const keywords = TRACK_JOB_KEYWORDS[trackValue];
  if (!keywords) return null;

  // Fetch from 4 sources in parallel
  const [remotiveResult, remoteOkResult, gulfResult, arbeitnowResult] = await Promise.allSettled([
    fetchRemotive(keywords.remotiveSearch),
    fetchRemoteOk(keywords.remoteOkTag),
    fetchAllGulfJobs(keywords.remotiveSearch),
    fetchArbeitnowJobs(keywords.remotiveSearch),
  ]);

  if (remotiveResult.status === "rejected") {
    console.error("remotive fetch failed:", remotiveResult.reason);
  }
  if (remoteOkResult.status === "rejected") {
    console.error("remoteok fetch failed:", remoteOkResult.reason);
  }
  if (gulfResult.status === "rejected") {
    console.error("gulf job boards fetch failed:", gulfResult.reason);
  }
  if (arbeitnowResult.status === "rejected") {
    console.error("arbeitnow fetch failed:", arbeitnowResult.reason);
  }

  const allListings: JobListing[] = [];
  const allCompanies: string[] = [];
  let totalCount = 0;
  const sources: string[] = [];

  if (remotiveResult.status === "fulfilled") {
    allListings.push(...remotiveResult.value.listings);
    allCompanies.push(...remotiveResult.value.companies);
    totalCount += remotiveResult.value.count;
    sources.push("remotive");
  }
  if (remoteOkResult.status === "fulfilled") {
    allListings.push(...remoteOkResult.value.listings);
    allCompanies.push(...remoteOkResult.value.companies);
    totalCount += remoteOkResult.value.count;
    sources.push("remoteok");
  }
  if (gulfResult.status === "fulfilled") {
    allListings.push(...gulfResult.value.listings);
    allCompanies.push(...gulfResult.value.companies);
    sources.push("gulf-search");
  }
  if (arbeitnowResult.status === "fulfilled") {
    allListings.push(...arbeitnowResult.value);
    allCompanies.push(...arbeitnowResult.value.map((l) => l.company));
    totalCount += arbeitnowResult.value.length;
    sources.push("arbeitnow");
  }

  if (allListings.length === 0) {
    return null;
  }

  // Deduplicate listings by company+title+sourceUrl
  const seenListings = new Set<string>();
  const deduplicatedListings = allListings.filter((job) => {
    const key = `${job.company.toLowerCase()}|${job.title.toLowerCase()}|${job.sourceUrl || ""}`;
    if (seenListings.has(key)) return false;
    seenListings.add(key);
    return true;
  }).slice(0, 12);

  return {
    companies: deduplicateCompanies(allCompanies),
    jobCount: totalCount,
    sampleTitles: deduplicateTitles(allListings.map((l) => l.title)),
    jobListings: deduplicatedListings,
    fetchedAt: new Date().toISOString(),
    sources,
  };
}
