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
 * ACUMULA RESULTADOS: se o result.js ja existir, os dados novos sao adicionados a ele.
 *   - Rodar varias pastas em sequencia junta tudo no mesmo result.js.
 *   - Se um arquivo ja estava no result.js (mesmo caminho), as linhas antigas dele sao
 *     substituidas pelas novas (rodar a mesma pasta de novo nao duplica dados).
 *   - Arquivos que derem erro na leitura mantem as linhas antigas.
 *
 * Para comecar um result.js do zero (apagando o anterior), use --novo:
 *
 *   node lerPlanilhas.js "C:\pasta\com\planilhas" --novo
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
import readline from "readline";
import { DEFAULT_IGNORED_FOLDERS, DEFAULT_REPORT_FOLDER } from "../config/paths.js";
import { listarArquivos } from "../lib/fileScanner.js";
import { logError, logInfo, logTabela } from "../lib/logger.js";
import { caminhoExiste, ehPasta } from "../lib/pathUtils.js";
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

const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith("--")));
const posicionais = args.filter((arg) => !arg.startsWith("--")).map(lerArgumentoCaminho);

const CONFIG = {
  rootFolder: posicionais[0],
  outputPath: path.resolve(posicionais[1] || path.join(DEFAULT_REPORT_FOLDER, "result.js")),
  novo: flags.has("--novo"),
  ignoredFolders: DEFAULT_IGNORED_FOLDERS,
  variableName: "dados"
};

// No Windows "I:\Pasta" e "i:\pasta" sao o mesmo arquivo.
function chaveArquivo(filePath) {
  return process.platform === "win32" ? filePath.toLowerCase() : filePath;
}

async function criarEscritor(filePath) {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

  const stream = fs.createWriteStream(filePath, { encoding: "utf8" });

  return {
    async escrever(text) {
      if (!stream.write(text)) {
        await once(stream, "drain");
      }
    },
    async fechar() {
      stream.end();
      await once(stream, "finish");
    }
  };
}

function lerLinhasTexto(filePath) {
  return readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: "utf8" }),
    crlfDelay: Infinity
  });
}

function cabecalhoJs(variableName) {
  return `const ${variableName} = [`;
}

async function validarResultadoAnterior(outputPath, variableName) {
  const linhas = lerLinhasTexto(outputPath);

  try {
    for await (const linha of linhas) {
      if (linha.trim() === cabecalhoJs(variableName)) {
        return;
      }

      break;
    }
  } finally {
    linhas.close();
  }

  throw new Error(
    `O arquivo ${outputPath} existe mas nao foi gerado por este script. ` +
    "Use --novo para substitui-lo ou informe outro arquivo de saida."
  );
}

// Cada linha de dados do result.js e "  [ ... ]," -> devolve so o JSON da linha.
async function* lerLinhasResultadoAnterior(outputPath) {
  for await (const linha of lerLinhasTexto(outputPath)) {
    const texto = linha.trim();

    if (texto.startsWith("[")) {
      yield texto.endsWith(",") ? texto.slice(0, -1) : texto;
    }
  }
}

// Monta o result.js final: linhas anteriores (menos as dos arquivos relidos) + linhas novas.
// Grava num .tmp e so no fim substitui o result.js, para nao corrompe-lo se algo falhar.
async function gravarResultado({ outputPath, variableName, usarAnterior, novasPath, arquivosRelidos }) {
  const finalPath = `${outputPath}.tmp`;
  const saida = await criarEscritor(finalPath);
  const contagem = { mantidas: 0, substituidas: 0, novas: 0 };
  let total = 0;

  async function adicionar(json) {
    await saida.escrever(`${total ? ",\n" : ""}  ${json}`);
    total += 1;
  }

  await saida.escrever(`${cabecalhoJs(variableName)}\n`);

  if (usarAnterior) {
    for await (const json of lerLinhasResultadoAnterior(outputPath)) {
      if (arquivosRelidos.has(chaveArquivo(JSON.parse(json)[0]))) {
        contagem.substituidas += 1;
        continue;
      }

      await adicionar(json);
      contagem.mantidas += 1;
    }
  }

  for await (const json of lerLinhasTexto(novasPath)) {
    if (json) {
      await adicionar(json);
      contagem.novas += 1;
    }
  }

  await saida.escrever("\n];\n");
  await saida.fechar();
  await fs.promises.rename(finalPath, outputPath);

  return { ...contagem, total };
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

    const usarAnterior = !CONFIG.novo && (await caminhoExiste(CONFIG.outputPath));

    if (usarAnterior) {
      await validarResultadoAnterior(CONFIG.outputPath, CONFIG.variableName);
      logInfo(`Acumulando no resultado existente: ${CONFIG.outputPath}`);
    }

    // Linhas novas vao para um arquivo temporario (uma linha JSON por linha da planilha).
    const novasPath = `${CONFIG.outputPath}.novas.tmp`;
    const novas = await criarEscritor(novasPath);
    const arquivosRelidos = new Set();
    const resumo = [];

    for (const [index, file] of files.entries()) {
      logInfo(`(${index + 1}/${files.length}) Lendo: ${file.fullPath}`);

      try {
        const sheets = await lerPlanilha(file.fullPath);
        let linhas = 0;

        for (const { sheetName, rows } of sheets) {
          for (const row of rows) {
            await novas.escrever(`${JSON.stringify([file.fullPath, file.name, sheetName, ...row])}\n`);
          }

          linhas += rows.length;
        }

        arquivosRelidos.add(chaveArquivo(file.fullPath));
        resumo.push({ Arquivo: file.fullPath, Abas: sheets.length, Linhas: linhas, Status: "OK" });
      } catch (error) {
        logError(`Erro ao ler ${file.fullPath}:`, error);
        resumo.push({ Arquivo: file.fullPath, Abas: 0, Linhas: 0, Status: "ERRO" });
      }
    }

    await novas.fechar();
    logTabela(resumo);

    const resultado = await gravarResultado({
      outputPath: CONFIG.outputPath,
      variableName: CONFIG.variableName,
      usarAnterior,
      novasPath,
      arquivosRelidos
    });
    await fs.promises.rm(novasPath, { force: true });

    const erros = resumo.filter((item) => item.Status === "ERRO").length;
    logInfo(`Linhas novas: ${resultado.novas}`);

    if (usarAnterior) {
      logInfo(`Linhas mantidas do resultado anterior: ${resultado.mantidas}`);
      logInfo(`Linhas antigas substituidas (arquivos relidos): ${resultado.substituidas}`);
    }

    logInfo(`Total de linhas no resultado: ${resultado.total}`);
    logInfo(`Arquivos com erro: ${erros}`);
    logInfo(`Arquivo salvo: ${CONFIG.outputPath}`);

    if (erros) {
      process.exitCode = 1;
    }
  } catch (error) {
    logError("Erro ao ler planilhas:", error);
    process.exitCode = 1;

    for (const tmp of [`${CONFIG.outputPath}.novas.tmp`, `${CONFIG.outputPath}.tmp`]) {
      await fs.promises.rm(tmp, { force: true });
    }
  }
}

if (isMain(import.meta.url)) {
  main();
}
