/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
	serverActions: {
	  bodySizeLimit: "6mb",
	},
  },
  // Lesson .md files are read by seedCurriculumLessons() at request time via
  // process.cwd() join — include them in the serverless bundle so readFileSync
  // succeeds on Vercel.
  outputFileTracingIncludes: {
	"/**/*": ["./lib/seed/lesson-content/**/*.md"],
  },
  async redirects() {
	return [
	  {
		source: "/learn/how-language-models-work-no-phd-required",
		destination: "/learn/how-language-models-work",
		permanent: true,
	  },
	  {
		source: "/learn/calling-llm-apis-without-surprises",
		destination: "/learn/calling-llm-apis",
		permanent: true,
	  },
	];
  },
};

export default nextConfig;
