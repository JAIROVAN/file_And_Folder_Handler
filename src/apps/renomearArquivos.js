import path from "path";
import { DEFAULT_REPORT_FOLDER } from "../config/paths.js";
import { arquivosParaRenomear } from "../data/arquivosParaRenomear.js";
import { renomearArquivos } from "../lib/fileOps.js";
import { logError, logResumoOperacao, logTabela } from "../lib/logger.js";
import {
  formatarRelatorioOperacao,
  montarLinhasOperacao,
  salvarJson,
  salvarTxt
} from "../lib/reportUtils.js";
import { isMain } from "../lib/runApp.js";

const CONFIG = {
  dryRun: true,
  overwrite: false,
  outputFolder: DEFAULT_REPORT_FOLDER,
  outputBaseName: "relatorio_renomeacao"
};

async function main() {
  try {
    const report = await renomearArquivos(arquivosParaRenomear, {
      dryRun: CONFIG.dryRun,
      overwrite: CONFIG.overwrite
    });

    logResumoOperacao("Relatorio de renomeacao", report);
    logTabela(montarLinhasOperacao(report));

    await salvarJson(
      path.join(CONFIG.outputFolder, `${CONFIG.outputBaseName}.json`),
      report
    );

    await salvarTxt(
      path.join(CONFIG.outputFolder, `${CONFIG.outputBaseName}.txt`),
      formatarRelatorioOperacao("RELATORIO DE RENOMEACAO DE ARQUIVOS", report)
    );
  } catch (error) {
    logError("Erro ao renomear arquivos:", error);
    process.exitCode = 1;
  }
}

if (isMain(import.meta.url)) {
  main();
}
