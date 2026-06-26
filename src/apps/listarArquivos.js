import path from "path";
import {
  DEFAULT_IGNORED_FOLDERS,
  DEFAULT_NOTAS_FOLDER,
  DEFAULT_REPORT_FOLDER
} from "../config/paths.js";
import { listarArquivos } from "../lib/fileScanner.js";
import { logError, logInfo, logTabela } from "../lib/logger.js";
import { gerarCsv, salvarCsv, salvarJson, salvarTxt } from "../lib/reportUtils.js";
import { isMain } from "../lib/runApp.js";

const CONFIG = {
  rootFolder: DEFAULT_NOTAS_FOLDER,
  recursive: true,
  extensions: [],
  ignoredFolders: DEFAULT_IGNORED_FOLDERS,
  outputFolder: DEFAULT_REPORT_FOLDER,
  outputBaseName: "lista_arquivos"
};

function formatarData(date) {
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function montarLinhaTabela(file) {
  return {
    Nome: file.name,
    Pasta: file.folderPath,
    Extensao: file.extension || "sem extensao",
    TamanhoBytes: file.size,
    CriadoEm: formatarData(file.createdAt),
    ModificadoEm: formatarData(file.modifiedAt)
  };
}

async function main() {
  try {
    const files = await listarArquivos(CONFIG.rootFolder, {
      recursive: CONFIG.recursive,
      extensions: CONFIG.extensions,
      ignoredFolders: CONFIG.ignoredFolders
    });

    const tableRows = files.map(montarLinhaTabela);

    logInfo(`Arquivos encontrados: ${files.length}`);
    logTabela(tableRows);

    await salvarJson(
      path.join(CONFIG.outputFolder, `${CONFIG.outputBaseName}.json`),
      files
    );

    await salvarCsv(
      path.join(CONFIG.outputFolder, `${CONFIG.outputBaseName}.csv`),
      tableRows
    );

    await salvarTxt(
      path.join(CONFIG.outputFolder, `${CONFIG.outputBaseName}.txt`),
      gerarCsv(tableRows, { separator: "\t" })
    );

    logInfo(`Relatorios salvos em: ${CONFIG.outputFolder}`);
  } catch (error) {
    logError("Erro ao listar arquivos:", error);
    process.exitCode = 1;
  }
}

if (isMain(import.meta.url)) {
  main();
}
