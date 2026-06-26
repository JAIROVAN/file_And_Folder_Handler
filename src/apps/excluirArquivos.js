import path from "path";
import { DEFAULT_REPORT_FOLDER } from "../config/paths.js";
import { arquivosParaExcluir } from "../data/arquivosParaExcluir.js";
import { DELETE_CONFIRMATION_TEXT, excluirArquivos } from "../lib/fileOps.js";
import { logError, logResumoOperacao, logTabela } from "../lib/logger.js";
import {
  formatarRelatorioOperacao,
  montarLinhasOperacao,
  salvarJson,
  salvarTxt
} from "../lib/reportUtils.js";
import { isMain } from "../lib/runApp.js";

const CONFIG = {
  dryRun: true, // Padrao seguro: apenas simula e gera relatorio, sem excluir.
  confirmDelete: "", // Sem a confirmacao abaixo, a exclusao real fica bloqueada.

  // Para excluir de verdade, descomente estas duas linhas.
  // Elas aparecem depois do padrao seguro para sobrescrever os valores acima.
  // dryRun: false,
  // confirmDelete: "EXCLUIR_ARQUIVOS",

  outputFolder: DEFAULT_REPORT_FOLDER,
  outputBaseName: "relatorio_exclusao"
};

async function main() {
  try {
    const report = await excluirArquivos(arquivosParaExcluir, {
      dryRun: CONFIG.dryRun,
      confirmDelete: CONFIG.confirmDelete
    });

    logResumoOperacao("Relatorio de exclusao", report);
    logTabela(montarLinhasOperacao(report));

    await salvarJson(
      path.join(CONFIG.outputFolder, `${CONFIG.outputBaseName}.json`),
      report
    );

    await salvarTxt(
      path.join(CONFIG.outputFolder, `${CONFIG.outputBaseName}.txt`),
      formatarRelatorioOperacao("RELATORIO DE EXCLUSAO DE ARQUIVOS", report)
    );

    if (!CONFIG.dryRun && CONFIG.confirmDelete !== DELETE_CONFIRMATION_TEXT) {
      console.log("");
      console.log(`Nenhum arquivo sera excluido sem confirmDelete: "${DELETE_CONFIRMATION_TEXT}".`);
    }
  } catch (error) {
    logError("Erro ao excluir arquivos:", error);
    process.exitCode = 1;
  }
}

if (isMain(import.meta.url)) {
  main();
}
