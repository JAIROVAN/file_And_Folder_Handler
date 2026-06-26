import fs from "fs/promises";
import pdf from "pdf-parse/lib/pdf-parse.js";
import { listarPdfs } from "./fileScanner.js";

export async function lerTextoPdf(filePath) {
  const buffer = await fs.readFile(filePath);
  const result = await pdf(buffer);

  return {
    source: filePath,
    pages: result.numpages,
    text: result.text,
    info: result.info || {}
  };
}

export async function lerPdfsDaPasta(rootFolder, options = {}) {
  const { recursive = false } = options;
  const pdfFiles = await listarPdfs(rootFolder, { recursive });

  const report = {
    total: pdfFiles.length,
    success: [],
    skipped: [],
    errors: []
  };

  for (const file of pdfFiles) {
    try {
      const extracted = await lerTextoPdf(file.fullPath);
      report.success.push({
        source: file.fullPath,
        status: "success",
        message: "PDF lido com sucesso.",
        pages: extracted.pages,
        text: extracted.text,
        info: extracted.info
      });
    } catch (error) {
      report.errors.push({
        source: file.fullPath,
        destination: "",
        status: "error",
        message: error.message,
        errorCode: error.code || "SEM_CODIGO"
      });
    }
  }

  return report;
}
