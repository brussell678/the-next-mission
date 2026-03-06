import pdfParse from "pdf-parse";

export async function extractTextFromPdfBuffer(pdf: Buffer): Promise<string> {
  try {
    const result = await pdfParse(pdf);
    const normalized = result.text.replace(/\r/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    return normalized;
  } catch {
    return "";
  }
}
