import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";
import * as XLSX from "../vendor/sheetjs/xlsx.mjs";
import * as cptable from "../vendor/sheetjs/cpexcel.full.mjs";
import { XLSX_HANDLER_CANDIDATES } from "../config/paths.js";
import { caminhoExiste } from "./pathUtils.js";

export const EXTENSOES_PLANILHA = [".xls", ".xlsx", ".ods"];

// Formatos lidos pelo SheetJS; o .xlsx vai para o myExcel.js do xlsx_Handler.
const EXTENSOES_SHEETJS = [".xls", ".ods"];

const EXCEL_TEMP_PREFIX = "~$";

// Codepages para .xls antigos (BIFF5 e anteriores) com acentos.
XLSX.set_cptable(cptable);

let myExcelPromise = null;

async function localizarMyExcel() {
  for (const folder of XLSX_HANDLER_CANDIDATES) {
    const myExcelPath = path.join(folder, "myExcel.js");

    if (await caminhoExiste(myExcelPath)) {
      return myExcelPath;
    }
  }

  const procurados = XLSX_HANDLER_CANDIDATES.map((folder) => `  - ${folder}`).join("\n");
  throw new Error(
    `Projeto xlsx_Handler nao encontrado (necessario para ler .xlsx). Procurado em:\n${procurados}\n` +
    "Coloque a pasta xlsx_Handler em um desses locais ou defina a variavel de ambiente XLSX_HANDLER_FOLDER."
  );
}

async function importarMyExcel() {
  const myExcelPath = await localizarMyExcel();

  try {
    return await import(pathToFileURL(myExcelPath).href);
  } catch (error) {
    if (error.code === "ERR_MODULE_NOT_FOUND" && error.message.includes("exceljs")) {
      throw new Error(`O xlsx_Handler (${path.dirname(myExcelPath)}) esta sem o exceljs. Rode "npm install" nessa pasta.`);
    }

    throw error;
  }
}

export function carregarMyExcel() {
  if (!myExcelPromise) {
    myExcelPromise = importarMyExcel();
  }

  return myExcelPromise;
}

function doisDigitos(value) {
  return String(value).padStart(2, "0");
}

function formatarPartesData({ y, m, d, H = 0, M = 0, S = 0 }) {
  const data = `${doisDigitos(d)}/${doisDigitos(m)}/${y}`;

  if (!H && !M && !S) {
    return data;
  }

  const hora = `${doisDigitos(H)}:${doisDigitos(M)}`;
  return S ? `${data} ${hora}:${doisDigitos(S)}` : `${data} ${hora}`;
}

// O exceljs devolve as datas como UTC, entao os getters UTC preservam o valor da celula.
function formatarDataExcelJs(date) {
  return formatarPartesData({
    y: date.getUTCFullYear(),
    m: date.getUTCMonth() + 1,
    d: date.getUTCDate(),
    H: date.getUTCHours(),
    M: date.getUTCMinutes(),
    S: date.getUTCSeconds()
  });
}

function normalizarValorXlsx(value) {
  return value instanceof Date ? formatarDataExcelJs(value) : value;
}

function lerValorCelulaSheetJs(cell) {
  if (!cell || cell.v === undefined || cell.v === null) {
    return "";
  }

  if (cell.t === "e") {
    return cell.w ?? "";
  }

  if (cell.t === "n" && cell.z && XLSX.SSF.is_date(cell.z)) {
    return formatarPartesData(XLSX.SSF.parse_date_code(cell.v));
  }

  if (typeof cell.v === "string") {
    return cell.v.trim();
  }

  return cell.v;
}

function temConteudo(value) {
  return value !== "" && value !== null && value !== undefined;
}

// Percorre so as celulas existentes e monta a grade ate a ultima linha/coluna com dados,
// para nao estourar memoria quando o "!ref" da aba cobre linhas/colunas inteiras formatadas.
function lerAbaSheetJs(sheet) {
  const celulasPorLinha = new Map();
  let ultimaLinha = -1;
  let ultimaColuna = -1;

  for (const address of Object.keys(sheet)) {
    if (address.startsWith("!")) {
      continue;
    }

    const value = lerValorCelulaSheetJs(sheet[address]);

    if (!temConteudo(value)) {
      continue;
    }

    const { r, c } = XLSX.utils.decode_cell(address);

    if (!celulasPorLinha.has(r)) {
      celulasPorLinha.set(r, []);
    }

    celulasPorLinha.get(r).push([c, value]);
    ultimaLinha = Math.max(ultimaLinha, r);
    ultimaColuna = Math.max(ultimaColuna, c);
  }

  const rows = [];

  for (let rowIndex = 0; rowIndex <= ultimaLinha; rowIndex += 1) {
    const values = new Array(ultimaColuna + 1).fill("");

    for (const [columnIndex, value] of celulasPorLinha.get(rowIndex) ?? []) {
      values[columnIndex] = value;
    }

    rows.push(values);
  }

  return rows;
}

// O SheetJS emite este aviso via console.error para formatos condicionais do LibreOffice.
// Ele so afeta o texto formatado (usamos o valor bruto), entao e descartado para nao poluir o log.
const AVISO_SHEETJS_IGNORADO = "ODS number format may be incorrect";

function lerWorkbookSheetJs(buffer) {
  const consoleError = console.error;

  console.error = (...args) => {
    if (!String(args[0]).startsWith(AVISO_SHEETJS_IGNORADO)) {
      consoleError(...args);
    }
  };

  try {
    return XLSX.read(buffer, { cellNF: true });
  } finally {
    console.error = consoleError;
  }
}

async function lerPlanilhaSheetJs(filePath) {
  const buffer = await fs.readFile(filePath);
  const workbook = lerWorkbookSheetJs(buffer);

  return workbook.SheetNames.map((sheetName) => ({
    sheetName,
    rows: lerAbaSheetJs(workbook.Sheets[sheetName])
  }));
}

async function lerPlanilhaXlsx(filePath) {
  const { readExcelAsRows } = await carregarMyExcel();
  const sheets = await readExcelAsRows(filePath, { skipEmptyRows: false, emptyValue: "" });

  return sheets.map(({ sheetName, rows }) => ({
    sheetName,
    rows: rows.map((row) => row.map(normalizarValorXlsx))
  }));
}

export function ehArquivoTemporarioExcel(fileName) {
  return fileName.startsWith(EXCEL_TEMP_PREFIX);
}

/**
 * Le todas as abas de um .xls, .xlsx ou .ods.
 * Retorna [{ sheetName, rows: [[...valores]] }], com linhas vazias preservadas,
 * datas como "dd/mm/aaaa" e formulas pelo valor calculado.
 */
export async function lerPlanilha(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".xlsx") {
    return lerPlanilhaXlsx(filePath);
  }

  if (EXTENSOES_SHEETJS.includes(extension)) {
    return lerPlanilhaSheetJs(filePath);
  }

  throw new Error(`Extensao nao suportada: "${extension}".`);
}
