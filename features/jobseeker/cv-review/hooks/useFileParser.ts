"use client";

import { useState } from "react";
import { extractTextFromPDF } from "@/features/jobseeker/resumes/utils/pdfParser";
import { extractTextFromDOCX } from "@/features/jobseeker/resumes/utils/docxParser";
import { cleanText } from "@/features/jobseeker/resumes/utils/textCleaner";

export const useFileParser = () => {
  const [parsing, setParsing] = useState(false);

  const parseFile = async (file: File) => {
    setParsing(true);

    try {
      let text = "";

      if (file.name.endsWith(".pdf")) {
        text = await extractTextFromPDF(file);
      } else if (file.name.endsWith(".docx")) {
        text = await extractTextFromDOCX(file);
      } else {
        text = await file.text();
      }

      return cleanText(text);
    } finally {
      setParsing(false);
    }
  };

  return { parseFile, parsing };
};