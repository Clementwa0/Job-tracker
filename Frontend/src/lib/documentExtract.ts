/** Lazy-loaded PDF/DOCX text extraction (keeps heavy deps out of the main bundle). */

export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist").catch(() => {
    throw new Error("pdfjs-dist is not installed. Run: pnpm add pdfjs-dist");
  });

  try {
    const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  } catch {
    try {
      const workerUrl = (await import("pdfjs-dist/build/pdf.worker?url")).default;
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    } catch {
      /* use pdfjs default worker resolution */
    }
  }

  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  let text = "";

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    text += content.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n\n";
  }

  return text.trim();
}

export async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import("mammoth").catch(() => {
    throw new Error("mammoth is not installed. Run: pnpm add mammoth");
  });
  const buf = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
  return value.trim();
}

export async function extractDocumentText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".txt")) return file.text();
  if (name.endsWith(".pdf")) return extractPdfText(file);
  if (name.endsWith(".docx")) return extractDocxText(file);
  throw new Error("Unsupported file type. Use PDF, DOCX or TXT.");
}
