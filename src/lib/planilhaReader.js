import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";
import * as XLSX from "xlsx";
import { XLSX_HANDLER_FOLDER } from "../config/paths.js";

export const EXTENSOES_PLANILHA = [".xls", ".xlsx"];

const EXCEL_TEMP_PREFIX = "~$";

let myExcelPromise = null;

function carregarMyExcel() {
  if (!myExcelPromise) {
    const myExcelPath = path.join(XLSX_HANDLER_FOLDER, "myExcel.js");
    myExcelPromise = import(pathToFileURL(myExcelPath).href);
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
