import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";
import * as XLSX from "../vendor/sheetjs/xlsx.mjs";
import * as cptable from "../vendor/sheetjs/cpexcel.full.mjs";
import { XLSX_HANDLER_CANDIDATES } from "../config/paths.js";
import { caminhoExiste } from "./pathUtils.js";

export const EXTENSOES_PLANILHA = [".xls", ".xlsx"];

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

function lerValorCelulaXls(cell) {
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

function lerAbaXls(sheet) {
  if (!sheet["!ref"]) {
    return [];
  }

  const range = XLSX.utils.decode_range(sheet["!ref"]);
  const rows = [];

  for (let rowIndex = 0; rowIndex <= range.e.r; rowIndex += 1) {
    const values = [];

    for (let columnIndex = 0; columnIndex <= range.e.c; columnIndex += 1) {
      const address = XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex });
      values.push(lerValorCelulaXls(sheet[address]));
    }

    rows.push(values);
  }

  return rows;
}

async function lerPlanilhaXls(filePath) {
  const buffer = await fs.readFile(filePath);
  const workbook = XLSX.read(buffer, { cellNF: true });

  return workbook.SheetNames.map((sheetName) => ({
    sheetName,
    rows: lerAbaXls(workbook.Sheets[sheetName])
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
 * Le todas as abas de um .xls ou .xlsx.
 * Retorna [{ sheetName, rows: [[...valores]] }], com linhas vazias preservadas,
 * datas como "dd/mm/aaaa" e formulas pelo valor calculado.
 */
export async function lerPlanilha(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".xlsx") {
    return lerPlanilhaXlsx(filePath);
  }

  if (extension === ".xls") {
    return lerPlanilhaXls(filePath);
  }

  throw new Error(`Extensao nao suportada: "${extension}".`);
}
