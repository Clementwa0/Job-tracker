import mammoth from "mammoth";

export const extractTextFromDOCX = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
};