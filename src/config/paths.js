import path from "path";
import { fileURLToPath } from "url";

const currentFile = fileURLToPath(import.meta.url);
const currentFolder = path.dirname(currentFile);

export const PROJECT_ROOT = path.resolve(currentFolder, "..", "..");

export const DEFAULT_REPORT_FOLDER = path.join(PROJECT_ROOT, "reports");

// Locais onde o projeto xlsx_Handler e procurado (usa o primeiro que tiver myExcel.js).
// Se ele estiver em outro lugar, defina a variavel de ambiente XLSX_HANDLER_FOLDER
// (PowerShell: $env:XLSX_HANDLER_FOLDER = "C:\caminho\xlsx_Handler") ou adicione o caminho aqui.
export const XLSX_HANDLER_CANDIDATES = [
  process.env.XLSX_HANDLER_FOLDER,
  path.resolve(PROJECT_ROOT, "..", "xlsx_Handler"),
  path.resolve(PROJECT_ROOT, "..", "..", "xlsx_Handler")
].filter(Boolean);

export const DEFAULT_IGNORED_FOLDERS = [
  "node_modules",
  "docsTxt",
  ".git"
];

export const DEFAULT_NOTAS_FOLDER = String.raw`C:\Users\m169161\Desktop\CONTRATOS\PGF\HEXIS\NOTAS`;

export const DEFAULT_COPY_DESTINATION_FOLDER = DEFAULT_NOTAS_FOLDER;

