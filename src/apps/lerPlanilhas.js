/*
 * Le todos os .xls/.xlsx/.ods de uma pasta (e subpastas) e gera um result.js com:
 *   const dados = [[caminhoCompleto, nomeArquivo, nomeAba, ...celulasDaLinha], ...];
 *
 * COMO RODAR (terminal do VS Code aberto na pasta src\apps):
 *
 *   node lerPlanilhas.js "C:\caminho\da\pasta\com\planilhas"
 *
 *   - Use aspas no caminho (obrigatorio se tiver espacos ou acentos).
 *   - Dica: arraste a pasta do Windows Explorer para o terminal para colar o caminho.
 *   - O resultado sai em <raiz do projeto>\reports\result.js (qualquer que seja a pasta do terminal).
 *
 * Para salvar o resultado em outro lugar, informe o arquivo de saida como 2o argumento:
 *
 *   node lerPlanilhas.js "C:\pasta\com\planilhas" "C:\Users\m169161\Desktop\result.js"
 *
 * Da raiz do projeto tambem funciona: node src\apps\lerPlanilhas.js "C:\pasta"
 *
 * Requisito (para .xlsx): o projeto xlsx_Handler, com node_modules\exceljs instalado, deve estar
 * ao lado desta pasta do projeto (ou um nivel acima). Outros locais: veja XLSX_HANDLER_CANDIDATES
 * em src\config\paths.js.
 */

import fs from "fs";
import { once } from "events";
import path from "path";
import { DEFAULT_IGNORED_FOLDERS, DEFAULT_REPORT_FOLDER } from "../config/paths.js";
import { listarArquivos } from "../lib/fileScanner.js";
import { logError, logInfo, logTabela } from "../lib/logger.js";
import { ehPasta } from "../lib/pathUtils.js";
import {
  EXTENSOES_PLANILHA,
  carregarMyExcel,
  ehArquivoTemporarioExcel,
  lerPlanilha
} from "../lib/planilhaReader.js";
import { isMain } from "../lib/runApp.js";

// No cmd do Windows, "C:\pasta\" (barra final antes da aspa) chega como C:\pasta" -> remove a aspa sobrando.
function lerArgumentoCaminho(value) {
  return value ? value.replace(/"+$/, "").trim() : value;
}

const CONFIG = {
  rootFolder: lerArgumentoCaminho(process.argv[2]),
  outputPath: lerArgumentoCaminho(process.argv[3]) || path.join(DEFAULT_REPORT_FOLDER, "result.js"),
  ignoredFolders: DEFAULT_IGNORED_FOLDERS,
  variableName: "dados"
};

// Grava o result.js linha a linha, sem montar todo o conteudo na memoria.
async function abrirSaidaJs(outputPath, variableName) {
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });

  const stream = fs.createWriteStream(outputPath, { encoding: "utf8" });
  let total = 0;

  async function escrever(text) {
    if (!stream.write(text)) {
      await once(stream, "drain");
    }
  }

  await escrever(`const ${variableName} = [\n`);

  return {
    get total() {
      return total;
    },
    async adicionarLinha(row) {
      await escrever(`${total ? ",\n" : ""}  ${JSON.stringify(row)}`);
      total += 1;
    },
    async fechar() {
      await escrever("\n];\n");
      stream.end();
      await once(stream, "finish");
    }
  };
}

async function main() {
  try {
    if (!CONFIG.rootFolder) {
      throw new Error('Informe a pasta: node lerPlanilhas.js "C:\\pasta" (veja o comentario no topo de lerPlanilhas.js)');
    }

    const rootFolder = path.resolve(CONFIG.rootFolder);

    if (!(await ehPasta(rootFolder))) {
      throw new Error(`Pasta nao encontrada: ${rootFolder}`);
    }

    const files = (await listarArquivos(rootFolder, {
      recursive: true,
      extensions: EXTENSOES_PLANILHA,
      ignoredFolders: CONFIG.ignoredFolders,
      onAccessError: (targetPath, error) => {
        logError(`Sem acesso, ignorado: ${targetPath} (${error.code || error.message})`);
      }
    }))
      .filter((file) => !ehArquivoTemporarioExcel(file.name))
      .sort((a, b) => a.fullPath.localeCompare(b.fullPath));

    logInfo(`Planilhas encontradas: ${files.length}`);

    // Falha logo no inicio (e uma vez so) se o xlsx_Handler nao estiver disponivel.
    if (files.some((file) => file.extension.toLowerCase() === ".xlsx")) {
      await carregarMyExcel();
    }

    const saida = await abrirSaidaJs(CONFIG.outputPath, CONFIG.variableName);
    const resumo = [];

    for (const [index, file] of files.entries()) {
      logInfo(`(${index + 1}/${files.length}) Lendo: ${file.fullPath}`);

      try {
        const sheets = await lerPlanilha(file.fullPath);
        let linhas = 0;

        for (const { sheetName, rows } of sheets) {
          for (const row of rows) {
            await saida.adicionarLinha([file.fullPath, file.name, sheetName, ...row]);
          }

          linhas += rows.length;
        }

        resumo.push({ Arquivo: file.fullPath, Abas: sheets.length, Linhas: linhas, Status: "OK" });
      } catch (error) {
        logError(`Erro ao ler ${file.fullPath}:`, error);
        resumo.push({ Arquivo: file.fullPath, Abas: 0, Linhas: 0, Status: "ERRO" });
      }
    }

    await saida.fechar();
    logTabela(resumo);

    const erros = resumo.filter((item) => item.Status === "ERRO").length;
    logInfo(`Linhas geradas: ${saida.total}`);
    logInfo(`Arquivos com erro: ${erros}`);
    logInfo(`Arquivo criado: ${CONFIG.outputPath}`);

    if (erros) {
      process.exitCode = 1;
    }
  } catch (error) {
    logError("Erro ao ler planilhas:", error);
    process.exitCode = 1;
  }
}

if (isMain(import.meta.url)) {
  main();
}
