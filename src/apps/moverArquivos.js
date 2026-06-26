import path from "path";
import { DEFAULT_REPORT_FOLDER } from "../config/paths.js";
import { arquivosParaMover } from "../data/arquivosParaMover.js";
import { moverArquivos } from "../lib/fileOps.js";
import { logError, logResumoOperacao, logTabela } from "../lib/logger.js";
import {
  formatarRelatorioOperacao,
  montarLinhasOperacao,
  salvarJson,
  salvarTxt
} from "../lib/reportUtils.js";
import { isMain } from "../lib/runApp.js";

const CONFIG = {
  dryRun: true, // Padrao seguro: apenas simula e gera relatorio, sem mover.
  overwrite: false, // Mantem false para nunca sobrescrever arquivo existente no destino.

  // Para mover de verdade, altere somente o dryRun depois de revisar o relatorio.
  // dryRun: false,

  outputFolder: DEFAULT_REPORT_FOLDER,
  outputBaseName: "relatorio_movimentacao"
};

async function main() {
  try {
    const report = await moverArquivos(arquivosParaMover, {
      dryRun: CONFIG.dryRun,
      overwrite: CONFIG.overwrite
    });

    logResumoOperacao("Relatorio de movimentacao", report);
    logTabela(montarLinhasOperacao(report));

    await salvarJson(
      path.join(CONFIG.outputFolder, `${CONFIG.outputBaseName}.json`),
      report
    );

    await salvarTxt(
      path.join(CONFIG.outputFolder, `${CONFIG.outputBaseName}.txt`),
      formatarRelatorioOperacao("RELATORIO DE MOVIMENTACAO DE ARQUIVOS", report)
    );
  } catch (error) {
    logError("Erro ao mover arquivos:", error);
    process.exitCode = 1;
  }
}

if (isMain(import.meta.url)) {
  main();
}
