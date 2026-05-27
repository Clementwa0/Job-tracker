export async function extractPdf(
  file: File,
): Promise<string> {
  const pdfjs = await import("pdfjs-dist").catch(() => {
    throw new Error(
      "pdfjs-dist is not installed. Run: pnpm add pdfjs-dist",
    );
  });

  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    try {
      const workerUrl = (
        await import(
          "pdfjs-dist/build/pdf.worker.min.mjs?url"
        )
      ).default;

      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    } catch {
      //
    }
  }

  const buf = await file.arrayBuffer();

  const pdf = await pdfjs.getDocument({
    data: buf,
  }).promise;

  const pages: string[] = [];

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);

    const content = await page.getTextContent();

    pages.push(
      content.items
        .map((it: unknown) =>
          typeof it === "object" &&
          it !== null &&
          "str" in it
            ? String((it as { str: string }).str)
            : "",
        )
        .join(" "),
    );
  }

  return pages.join("\n\n");
}

export async function extractDocx(
  file: File,
): Promise<string> {
  const mammoth = await import("mammoth").catch(() => {
    throw new Error(
      "mammoth is not installed. Run: pnpm add mammoth",
    );
  });

  const buf = await file.arrayBuffer();

  const { value } = await mammoth.extractRawText({
    arrayBuffer: buf,
  });

  return value;
}