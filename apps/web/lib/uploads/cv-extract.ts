const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const MAX_EXTRACTED_CHARS = 25_000;

function normalizeExtractedText(text: string): string {
  return text.replaceAll("\0", "").replace(/\r\n/g, "\n").trim().slice(0, MAX_EXTRACTED_CHARS);
}

function extensionOf(fileName: string): string {
  const idx = fileName.lastIndexOf(".");
  if (idx < 0) return "";
  return fileName.slice(idx).toLowerCase();
}

export async function extractCvTextFromUpload(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error("No file uploaded.");
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("CV file is too large. Please upload a file under 5MB.");
  }

  const ext = extensionOf(file.name);
  const bytes = Buffer.from(await file.arrayBuffer());

  if (ext === ".txt" || ext === ".md" || ext === ".markdown") {
    return normalizeExtractedText(bytes.toString("utf8"));
  }

  if (ext === ".pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: bytes });
    try {
      const parsed = await parser.getText();
      const text = normalizeExtractedText(parsed.text ?? "");
      if (!text) throw new Error("Could not extract readable text from this PDF.");
      return text;
    } finally {
      await parser.destroy();
    }
  }

  if (ext === ".docx") {
    const mammoth = await import("mammoth");
    const parsed = await mammoth.extractRawText({ buffer: bytes });
    const text = normalizeExtractedText(parsed.value ?? "");
    if (!text) throw new Error("Could not extract readable text from this DOCX file.");
    return text;
  }

  if (ext === ".doc") {
    throw new Error("Legacy .doc files are not supported yet. Please upload .docx or PDF.");
  }

  throw new Error("Unsupported CV format. Please upload PDF, DOCX, TXT, or MD.");
}

