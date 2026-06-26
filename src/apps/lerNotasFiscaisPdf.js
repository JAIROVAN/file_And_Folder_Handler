import path from "path";
import {
  DEFAULT_NOTAS_FOLDER,
  DEFAULT_REPORT_FOLDER
} from "../config/paths.js";
import { logError, logInfo, logTabela } from "../lib/logger.js";
import { extrairDadosNotaFiscal } from "../lib/nfeExtractor.js";
import { lerPdfsDaPasta } from "../lib/pdfUtils.js";
import { salvarCsv, salvarJson } from "../lib/reportUtils.js";
import { isMain } from "../lib/runApp.js";

const CONFIG = {
  pdfFolder: DEFAULT_NOTAS_FOLDER,
  recursive: false,
  outputFolder: DEFAULT_REPORT_FOLDER,
  outputBaseName: "resumo_notas"
};

async function main() {
  try {
    const pdfReport = await lerPdfsDaPasta(CONFIG.pdfFolder, {
      recursive: CONFIG.recursive
    });

    const resumo = pdfReport.success.map((item) => {
      return extrairDadosNotaFiscal(item.text, item.source);
    });

    const erros = pdfReport.errors.map((item) => ({
      ARQUIVO: path.basename(item.source),
      CAMINHO: item.source,
      ERRO: item.message
    }));

    const resultadoFinal = [...resumo, ...erros];

    logInfo(`PDFs encontrados: ${pdfReport.total}`);
    logInfo(`PDFs lidos com sucesso: ${pdfReport.success.length}`);
    logInfo(`PDFs com erro: ${pdfReport.errors.length}`);
    logTabela(
      resultadoFinal.map((item) => ({
        NUMERO_NOTA: item.NUMERO_NOTA || "",
        SERIE: item.SERIE || "",
        DATA_EMISSAO: item.DATA_EMISSAO || "",
        CNPJ_EMITENTE: item.CNPJ_EMITENTE || "",
        NOME_EMITENTE: item.NOME_EMITENTE || "",
        VALOR_TOTAL_NOTA: item.VALOR_TOTAL_NOTA ?? "",
        SOLICITACAO: item.SOLICITACAO || "",
        CONTRATO: item.CONTRATO || "",
        PATRIMONIO: item.PATRIMONIO || "",
        ORCAMENTO: item.ORCAMENTO || "",
        ERRO: item.ERRO || ""
      }))
    );

    await salvarJson(
      path.join(CONFIG.outputFolder, `${CONFIG.outputBaseName}.json`),
      resultadoFinal
    );

    await salvarCsv(
      path.join(CONFIG.outputFolder, `${CONFIG.outputBaseName}.csv`),
      resultadoFinal
    );

    logInfo(`Relatorios salvos em: ${CONFIG.outputFolder}`);
  } catch (error) {
    logError("Erro ao ler notas fiscais em PDF:", error);
    process.exitCode = 1;
  }
}

if (isMain(import.meta.url)) {
  main();
}
