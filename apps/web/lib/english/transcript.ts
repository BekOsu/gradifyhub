import { YoutubeTranscript } from "youtube-transcript";
import { get_encoding } from "tiktoken";

export async function extractYouTubeTranscript(url: string): Promise<string> {
  try {
    const segments = await YoutubeTranscript.fetchTranscript(url);
    if (!segments || segments.length === 0) {
      throw new Error("Could not fetch transcript — video may lack captions");
    }
    return segments.map((s) => s.text).join(" ");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("Could not fetch transcript")) {
      throw error;
    }
    throw new Error("Could not fetch transcript — video may lack captions");
  }
}

export async function extractArticleText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch article: ${response.statusText}`);
  }

  const html = await response.text();

  let cleanedHtml = html;
  cleanedHtml = cleanedHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  cleanedHtml = cleanedHtml.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  cleanedHtml = cleanedHtml.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, "");
  cleanedHtml = cleanedHtml.replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, "");
  cleanedHtml = cleanedHtml.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, "");

  let text = "";
  const articleMatch = cleanedHtml.match(/<article[^>]*>[\s\S]*?<\/article>/i);
  if (articleMatch) {
    text = articleMatch[0];
  } else {
    const bodyMatch = cleanedHtml.match(/<body[^>]*>[\s\S]*?<\/body>/i);
    if (bodyMatch) {
      text = bodyMatch[0];
    } else {
      text = cleanedHtml;
    }
  }

  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

export function chunkTranscript(
  text: string,
  maxTokens: number = 800
): string[] {
  const enc = get_encoding("cl100k_base");

  try {
    const sentences = text.split(/(?<=[.!?])\s+/);

    const chunks: string[] = [];
    let currentChunk = "";
    let currentTokenCount = 0;

    for (const sentence of sentences) {
      const sentenceTokens = enc.encode(sentence);
      const sentenceTokenCount = sentenceTokens.length;

      if (currentTokenCount + sentenceTokenCount > maxTokens) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = sentence;
        currentTokenCount = sentenceTokenCount;
      } else {
        currentChunk += (currentChunk ? " " : "") + sentence;
        currentTokenCount += sentenceTokenCount;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [text];
  } finally {
    enc.free();
  }
}
