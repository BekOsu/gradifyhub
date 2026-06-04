import type { JobListing } from "./fetch-job-feed";

interface ArbeitnowJob {
  slug: string;
  company_name: string;
  title: string;
  url: string;
  remote?: boolean;
}

interface ArbeitnowResponse {
  data?: ArbeitnowJob[];
}

export async function fetchArbeitnowJobs(query: string): Promise<JobListing[]> {
  try {
    const searchParam = encodeURIComponent(query);
    const url = `https://www.arbeitnow.com/api/job-board-api?search=${searchParam}&page=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      console.warn(`Arbeitnow API responded with ${response.status}`);
      return [];
    }

    const data: ArbeitnowResponse = await response.json();
    if (!Array.isArray(data?.data)) {
      return [];
    }

    const keywords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length >= 2);

    const listings = data.data
      .filter((job) => {
        if (job.remote === false) return false;
        const jobTitle = (job.title || "").toLowerCase();
        return keywords.length === 0 || keywords.some((kw) => jobTitle.includes(kw));
      })
      .map((job) => ({
        id: `arbeitnow-${job.slug}`,
        company: job.company_name || "Unknown",
        title: job.title || "Job Title",
        sourceUrl: job.url,
        source: "arbeitnow" as const,
      }));

    return listings;
  } catch (error) {
    console.error("Error fetching Arbeitnow jobs:", error);
    return [];
  }
}
