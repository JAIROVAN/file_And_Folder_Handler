import path from "path";
import { DEFAULT_IGNORED_FOLDERS, DEFAULT_REPORT_FOLDER } from "../config/paths.js";
import { listarArquivos } from "../lib/fileScanner.js";
import { logError, logInfo, logTabela } from "../lib/logger.js";
import { ehPasta } from "../lib/pathUtils.js";
import {
  EXTENSOES_PLANILHA,
  ehArquivoTemporarioExcel,
  lerPlanilha
} from "../lib/planilhaReader.js";
import { salvarTxt } from "../lib/reportUtils.js";
import { isMain } from "../lib/runApp.js";

// No cmd do Windows, "C:\pasta\" (barra final antes da aspa) chega como C:\pasta" -> remove a aspa sobrando.
function lerArgumentoCaminho(value) {
  return value ? value.replace(/"+$/, "").trim() : value;
}

// Uso: npm run ler-planilhas -- "C:\pasta\com\planilhas" ["C:\saida\result.js"]
const CONFIG = {
  rootFolder: lerArgumentoCaminho(process.argv[2]),
  outputPath: lerArgumentoCaminho(process.argv[3]) || path.join(DEFAULT_REPORT_FOLDER, "result.js"),
  ignoredFolders: DEFAULT_IGNORED_FOLDERS,
  variableName: "dados"
};

function montarConteudoJs(variableName, rows) {
  const body = rows.map((row) => `  ${JSON.stringify(row)}`).join(",\n");
  return `const ${variableName} = [\n${body}\n];\n`;
}

async function main() {
  try {
    if (!CONFIG.rootFolder) {
      throw new Error('Informe a pasta: npm run ler-planilhas -- "C:\\pasta"');
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

    const dados = [];
    const resumo = [];

    for (const file of files) {
      try {
        const sheets = await lerPlanilha(file.fullPath);
        let linhas = 0;

        for (const { sheetName, rows } of sheets) {
          for (const row of rows) {
            dados.push([file.fullPath, file.name, sheetName, ...row]);
          }

          linhas += rows.length;
        }

        resumo.push({ Arquivo: file.fullPath, Abas: sheets.length, Linhas: linhas, Status: "OK" });
      } catch (error) {
        logError(`Erro ao ler ${file.fullPath}:`, error);
        resumo.push({ Arquivo: file.fullPath, Abas: 0, Linhas: 0, Status: "ERRO" });
      }
    }

    logTabela(resumo);

    await salvarTxt(CONFIG.outputPath, montarConteudoJs(CONFIG.variableName, dados));

    const erros = resumo.filter((item) => item.Status === "ERRO").length;
    logInfo(`Linhas geradas: ${dados.length}`);
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
