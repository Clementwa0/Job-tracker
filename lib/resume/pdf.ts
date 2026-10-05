import { PAGE_GAP, PAGE_H, PAGE_W } from "@/features/jobseeker/resumes/components/templates";

interface Word { text: string; x: number; y: number; height: number; fontSize: number }

function collectWords(root: HTMLElement): Word[] {
  const base = root.getBoundingClientRect();
  const words: Word[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? "";
    if (!text.trim()) continue;
    const fontSize = parseFloat(getComputedStyle(node.parentElement!).fontSize) || 12;
    const expression = /\S+/g;
    let match: RegExpExecArray | null;
    while ((match = expression.exec(text))) {
      range.setStart(node, match.index);
      range.setEnd(node, match.index + match[0].length);
      const rect = range.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;
      words.push({ text: match[0], x: rect.left - base.left, y: rect.top - base.top, height: rect.height, fontSize });
    }
  }
  return words;
}

export async function downloadPdf(element: HTMLElement, filename: string, pageCount: number) {
  const [{ toCanvas }, { jsPDF }] = await Promise.all([import("html-to-image"), import("jspdf")]);
  await document.fonts?.ready;
  const words = collectWords(element);
  const cssWidth = element.scrollWidth;
  const canvas = await toCanvas(element, {
    width: cssWidth,
    height: PAGE_H,
    pixelRatio: 2,
    backgroundColor: "#ffffff",
    skipAutoScale: true,
    style: { width: `${cssWidth}px`, height: `${PAGE_H}px`, overflow: "visible" },
  });
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const scaleX = canvas.width / cssWidth;
  const scaleY = canvas.height / PAGE_H;
  const pageWidthPixels = Math.round(PAGE_W * scaleX);
  const pageHeightPixels = Math.round(PAGE_H * scaleY);
  const pageStridePixels = Math.round((PAGE_W + PAGE_GAP) * scaleX);
  const pointsPerCssPixel = pageWidth / PAGE_W;
  pdf.setFont("helvetica", "normal");

  for (let page = 0; page < pageCount; page++) {
    const slice = document.createElement("canvas");
    slice.width = pageWidthPixels;
    slice.height = pageHeightPixels;
    const sourceX = page * pageStridePixels;
    slice.getContext("2d")!.drawImage(canvas, sourceX, 0, pageWidthPixels, pageHeightPixels, 0, 0, pageWidthPixels, pageHeightPixels);
    if (page > 0) pdf.addPage();
    pdf.addImage(slice.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, pageWidth, pageHeight);
    for (const word of words) {
      const wordPage = Math.floor(word.x / (PAGE_W + PAGE_GAP));
      if (wordPage !== page || word.y < 0 || word.y > PAGE_H) continue;
      pdf.setFontSize(Math.max(4, word.fontSize * pointsPerCssPixel));
      const localX = word.x - page * (PAGE_W + PAGE_GAP);
      pdf.text(word.text, localX * pointsPerCssPixel, word.y * pointsPerCssPixel, { baseline: "top", renderingMode: "invisible" } as never);
    }
  }
  pdf.save(`${filename.replace(/[^\w\- ]+/g, "").trim() || "resume"}.pdf`);
}
