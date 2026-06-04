import { load } from "cheerio";

type JobListing = {
  id: string;
  company: string;
  title: string;
  sourceUrl?: string;
  source: "gulf-search";
};

const TIMEOUT_MS = 8000;
const USER_AGENT = "Mozilla/5.0 (Graduate.dev Job Scraper)";

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "User-Agent": USER_AGENT,
        ...options.headers,
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function fetchBaytJobs(
  searchQuery: string
): Promise<JobListing[]> {
  try {
    const searchUrl = `https://www.bayt.com/en/jobs?c=${encodeURIComponent(searchQuery)}&v=1`;

    const response = await fetchWithTimeout(searchUrl);

    if (!response.ok) {
      console.error(`Bayt.com responded with status ${response.status}`);
      return [];
    }

    const html = await response.text();
    const $ = load(html);

    const listings: JobListing[] = [];

    // Bayt.com job listings - try multiple selector patterns
    const selectors = [
      ".job-item", // Primary selector
      "article.job-preview", // Alternative
      "[data-job-id]", // Data attribute
      "li.job", // Fallback
    ];

    for (const selector of selectors) {
      const items = $(selector);
      if (items.length > 0) {
        items.each((_index, element) => {
          const $item = $(element);

          // Extract job title - try multiple selectors
          const titleSelectors = [
            "h2 a",
            "h3 a",
            ".job-title",
            "[data-job-title]",
            "a[href*='/job/']",
          ];
          let title = "";
          for (const titleSel of titleSelectors) {
            const titleText = $item.find(titleSel).first().text().trim();
            if (titleText) {
              title = titleText;
              break;
            }
          }

          // Extract company name
          const companySelectors = [
            ".company-name",
            ".employer-name",
            "[data-company-name]",
            "span.company",
          ];
          let company = "";
          for (const companySel of companySelectors) {
            const companyText = $item.find(companySel).text().trim();
            if (companyText) {
              company = companyText;
              break;
            }
          }

          // Extract job URL
          let jobUrl = "";
          const linkElement = $item.find("a[href*='/job/']").first();
          if (linkElement.length > 0) {
            jobUrl = linkElement.attr("href") || "";
          }

          // Normalize URL
          if (jobUrl && !jobUrl.startsWith("http")) {
            jobUrl = `https://www.bayt.com${jobUrl}`;
          }

          if (title && company && jobUrl) {
            listings.push({
              id: `gulf-bayt-${title.toLowerCase().replace(/\s+/g, "-")}-${company.toLowerCase().replace(/\s+/g, "-")}`,
              company,
              title,
              sourceUrl: jobUrl,
              source: "gulf-search",
            });
          }
        });

        if (listings.length > 0) break;
      }
    }

    return listings.slice(0, 50);
  } catch (error) {
    console.error("Bayt.com scraping failed:", error);
    return [];
  }
}

export async function fetchGulfTalentJobs(
  searchQuery: string
): Promise<JobListing[]> {
  try {
    const searchUrl = `https://www.gulftalent.com/jobs?q=${encodeURIComponent(searchQuery)}`;

    const response = await fetchWithTimeout(searchUrl);

    if (!response.ok) {
      console.error(
        `GulfTalent.com responded with status ${response.status}`
      );
      return [];
    }

    const html = await response.text();
    const $ = load(html);

    const listings: JobListing[] = [];

    // GulfTalent.com typically uses job cards with specific classes
    const selectors = [
      ".job-card",
      ".job-item",
      "[data-testid='job-card']",
      ".vacancy",
      "article.job",
    ];

    for (const selector of selectors) {
      const items = $(selector);
      if (items.length > 0) {
        items.each((_index, element) => {
          const $item = $(element);

          // Extract job title
          const titleSelectors = [
            ".job-title",
            "h2 a",
            "h3 a",
            "[data-job-title]",
            "a.job-link",
          ];
          let title = "";
          for (const titleSel of titleSelectors) {
            const titleText = $item.find(titleSel).first().text().trim();
            if (titleText && titleText.length > 0) {
              title = titleText;
              break;
            }
          }

          // Extract company
          const companySelectors = [
            ".company",
            ".employer",
            "[data-company]",
            ".company-name",
          ];
          let company = "";
          for (const companySel of companySelectors) {
            const companyText = $item.find(companySel).text().trim();
            if (companyText) {
              company = companyText;
              break;
            }
          }

          // Extract URL
          let jobUrl = "";
          const linkElement = $item.find("a[href*='job']").first();
          if (linkElement.length > 0) {
            jobUrl = linkElement.attr("href") || "";
          }

          // Normalize URL
          if (jobUrl && !jobUrl.startsWith("http")) {
            jobUrl = `https://www.gulftalent.com${jobUrl}`;
          }

          if (title && company && jobUrl) {
            listings.push({
              id: `gulf-gulftalent-${title.toLowerCase().replace(/\s+/g, "-")}-${company.toLowerCase().replace(/\s+/g, "-")}`,
              company,
              title,
              sourceUrl: jobUrl,
              source: "gulf-search",
            });
          }
        });

        if (listings.length > 0) break;
      }
    }

    return listings.slice(0, 50);
  } catch (error) {
    console.error("GulfTalent.com scraping failed:", error);
    return [];
  }
}

export async function fetchArabJobsJobs(
  searchQuery: string
): Promise<JobListing[]> {
  try {
    const searchUrl = `https://www.arabjobs.com/jobs?search=${encodeURIComponent(searchQuery)}`;

    const response = await fetchWithTimeout(searchUrl);

    if (!response.ok) {
      console.error(`ArabJobs.com responded with status ${response.status}`);
      return [];
    }

    const html = await response.text();
    const $ = load(html);

    const listings: JobListing[] = [];

    // ArabJobs.com job listing selectors
    const selectors = [
      ".job-card",
      ".job-item",
      ".vacancy",
      "[data-job-id]",
      "article.job",
      ".listing",
    ];

    for (const selector of selectors) {
      const items = $(selector);
      if (items.length > 0) {
        items.each((_index, element) => {
          const $item = $(element);

          // Extract title
          const titleSelectors = [
            ".job-title",
            "h2",
            "h3",
            "a.job-link",
            "[data-job-title]",
          ];
          let title = "";
          for (const titleSel of titleSelectors) {
            const titleText = $item.find(titleSel).first().text().trim();
            if (titleText && titleText.length > 0) {
              title = titleText;
              break;
            }
          }

          // Extract company
          const companySelectors = [
            ".company-name",
            ".company",
            "[data-company]",
            ".employer",
          ];
          let company = "";
          for (const companySel of companySelectors) {
            const companyText = $item.find(companySel).text().trim();
            if (companyText) {
              company = companyText;
              break;
            }
          }

          // Extract URL - ArabJobs typically uses direct job links
          let jobUrl = "";
          const linkElement = $item.find("a").first();
          if (linkElement.length > 0) {
            const href = linkElement.attr("href");
            if (href && href.includes("job")) {
              jobUrl = href;
            }
          }

          // Normalize URL
          if (jobUrl && !jobUrl.startsWith("http")) {
            jobUrl = `https://www.arabjobs.com${jobUrl}`;
          }

          if (title && company && jobUrl) {
            listings.push({
              id: `gulf-arabjobs-${title.toLowerCase().replace(/\s+/g, "-")}-${company.toLowerCase().replace(/\s+/g, "-")}`,
              company,
              title,
              sourceUrl: jobUrl,
              source: "gulf-search",
            });
          }
        });

        if (listings.length > 0) break;
      }
    }

    return listings.slice(0, 50);
  } catch (error) {
    console.error("ArabJobs.com scraping failed:", error);
    return [];
  }
}

export async function fetchAllGulfJobs(
  searchQuery: string
): Promise<{ listings: JobListing[]; companies: string[] }> {
  // Respect rate limiting - stagger requests
  const [baytJobs, gulfTalentJobs, arabJobsJobs] = await Promise.allSettled([
    (async () => {
      const jobs = await fetchBaytJobs(searchQuery);
      await delay(1000 + Math.random() * 1000); // 1-2 second delay
      return jobs;
    })(),
    (async () => {
      const jobs = await fetchGulfTalentJobs(searchQuery);
      await delay(1000 + Math.random() * 1000); // 1-2 second delay
      return jobs;
    })(),
    (async () => {
      const jobs = await fetchArabJobsJobs(searchQuery);
      return jobs;
    })(),
  ]);

  const allListings: JobListing[] = [];

  if (baytJobs.status === "fulfilled") {
    allListings.push(...baytJobs.value);
  }
  if (gulfTalentJobs.status === "fulfilled") {
    allListings.push(...gulfTalentJobs.value);
  }
  if (arabJobsJobs.status === "fulfilled") {
    allListings.push(...arabJobsJobs.value);
  }

  // Extract unique companies
  const companies = Array.from(
    new Set(allListings.map((job) => job.company.toLowerCase()))
  )
    .slice(0, 15)
    .map(
      (company) =>
        allListings.find((j) => j.company.toLowerCase() === company)?.company ||
        company
    );

  return {
    listings: allListings,
    companies,
  };
}
