import path from "path";
import {
  DEFAULT_NOTAS_FOLDER,
  DEFAULT_REPORT_FOLDER
} from "../config/paths.js";
import { logError, logInfo } from "../lib/logger.js";
import { lerTextoPdf } from "../lib/pdfUtils.js";
import { salvarTxt } from "../lib/reportUtils.js";
import { isMain } from "../lib/runApp.js";

const CONFIG = {
  pdfPath: path.join(DEFAULT_NOTAS_FOLDER, "1030580.PDF"),
  outputFolder: DEFAULT_REPORT_FOLDER,
  outputFileName: "texto_extraido_pdf.txt"
};

async function main() {
  try {
    const result = await lerTextoPdf(CONFIG.pdfPath);

    logInfo(`Paginas: ${result.pages}`);
    logInfo("Texto extraido:");
    logInfo(result.text);

    const outputPath = path.join(CONFIG.outputFolder, CONFIG.outputFileName);
    await salvarTxt(outputPath, result.text);

    logInfo(`Arquivo criado com sucesso: ${outputPath}`);
  } catch (error) {
    logError("Erro ao ler o PDF:", error);
    process.exitCode = 1;
  }
}

if (isMain(import.meta.url)) {
  main();
}
