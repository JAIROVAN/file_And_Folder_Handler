/*
 * Junta todos os .json gerados pelo lerPlanilhas.js de uma pasta e cria uma planilha .xlsx
 * com todas as linhas, numa unica aba (sem cabecalho).
 *
 * COMO RODAR (terminal do VS Code aberto na pasta src\apps):
 *
 *   node gerarPlanilhaAtravesDeArraysJsons.js "C:\pasta\com\os\jsons"
 *
 *   - Le apenas os .json diretamente dentro da pasta (nao entra em subpastas).
 *   - Junta as linhas de todos os JSON, na ordem alfabetica dos arquivos (repetidas sao mantidas).
 *   - A planilha e criada na mesma pasta dos JSON, com o nome "planilha_" + nome da pasta:
 *       node gerarPlanilhaAtravesDeArraysJsons.js "...\reports"  ->  reports\planilha_reports.xlsx
 *   - Nunca sobrescreve: se o arquivo ja existir, cria "planilha_reports (1).xlsx", "(2)"...
 *   - Se passar de 1.048.576 linhas (limite do Excel), continua na aba "Dados 2", "Dados 3"...
 *
 * Para salvar a planilha em outra pasta, informe a pasta de saida como 2o argumento:
 *
 *   node gerarPlanilhaAtravesDeArraysJsons.js "C:\pasta\com\os\jsons" "C:\Users\m169161\Desktop"
 *
 * Requisito: o projeto xlsx_Handler (com node_modules\exceljs instalado), igual ao lerPlanilhas.js.
 */

import path from "path";
import { listarArquivos } from "../lib/fileScanner.js";
import { logError, logInfo, logTabela } from "../lib/logger.js";
import { criarNomeSeguroWindows, ehPasta } from "../lib/pathUtils.js";
import { carregarMyExcel } from "../lib/planilhaReader.js";
import { lerLinhasResultadoJson } from "../lib/resultadoJsonReader.js";
import { isMain } from "../lib/runApp.js";

// No cmd do Windows, "C:\pasta\" (barra final antes da aspa) chega como C:\pasta" -> remove a aspa sobrando.
function lerArgumentoCaminho(value) {
  return value ? value.replace(/"+$/, "").trim() : value;
}

const CONFIG = {
  jsonFolder: lerArgumentoCaminho(process.argv[2]),
  outputFolder: lerArgumentoCaminho(process.argv[3]),
  outputPrefix: "planilha",
  sheetName: "Dados"
};

// Gera as linhas de todos os JSON em sequencia; um JSON com erro e registrado e pulado.
async function* linhasDeTodosOsJsons(jsonFiles, resumo) {
  for (const [index, file] of jsonFiles.entries()) {
    logInfo(`(${index + 1}/${jsonFiles.length}) Lendo: ${file.fullPath}`);

    const item = { Arquivo: file.name, Linhas: 0, Status: "OK" };
    resumo.push(item);

    try {
      for await (const row of lerLinhasResultadoJson(file.fullPath)) {
        item.Linhas += 1;
        yield row;
      }
    } catch (error) {
      item.Status = item.Linhas ? "ERRO (parcial)" : "ERRO";
      logError(`Erro ao ler ${file.fullPath}: ${error.message}`);
    }
  }
}

async function main() {
  try {
    if (!CONFIG.jsonFolder) {
      throw new Error('Informe a pasta: node gerarPlanilhaAtravesDeArraysJsons.js "C:\\pasta" (veja o comentario no topo do arquivo)');
    }

    const jsonFolder = path.resolve(CONFIG.jsonFolder);

    if (!(await ehPasta(jsonFolder))) {
      throw new Error(`Pasta nao encontrada: ${jsonFolder}`);
    }

    const jsonFiles = (await listarArquivos(jsonFolder, { recursive: false, extensions: [".json"] }))
      .sort((a, b) => a.name.localeCompare(b.name));

    if (!jsonFiles.length) {
      throw new Error(`Nenhum arquivo .json encontrado em: ${jsonFolder}`);
    }

    logInfo(`Arquivos JSON encontrados: ${jsonFiles.length}`);

    const { createExcelFromRows } = await carregarMyExcel();
    const outputFolder = path.resolve(CONFIG.outputFolder || jsonFolder);
    const nomePasta = criarNomeSeguroWindows(path.basename(jsonFolder), "pasta");
    const outputPath = path.join(outputFolder, `${CONFIG.outputPrefix}_${nomePasta}.xlsx`);
    const resumo = [];

    const resultado = await createExcelFromRows(outputPath, linhasDeTodosOsJsons(jsonFiles, resumo), {
      sheetName: CONFIG.sheetName
    });

    logTabela(resumo);

    const erros = resumo.filter((item) => item.Status !== "OK").length;
    logInfo(`Linhas na planilha: ${resultado.totalRows}`);
    logInfo(`Abas: ${resultado.sheetCount}`);
    logInfo(`JSON com erro: ${erros}`);
    logInfo(`Planilha criada: ${resultado.filePath}`);

    if (erros) {
      process.exitCode = 1;
    }
  } catch (error) {
    logError("Erro ao gerar a planilha:", error);
    process.exitCode = 1;
  }
}

if (isMain(import.meta.url)) {
  main();
}
