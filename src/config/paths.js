import path from "path";
import { fileURLToPath } from "url";

const currentFile = fileURLToPath(import.meta.url);
const currentFolder = path.dirname(currentFile);

export const PROJECT_ROOT = path.resolve(currentFolder, "..", "..");

export const DEFAULT_REPORT_FOLDER = path.join(PROJECT_ROOT, "reports");

export const XLSX_HANDLER_FOLDER = path.resolve(PROJECT_ROOT, "..", "..", "xlsx_Handler");

export const DEFAULT_IGNORED_FOLDERS = [
  "node_modules",
  "docsTxt",
  ".git"
];

export const DEFAULT_NOTAS_FOLDER = String.raw`C:\Users\m169161\Desktop\CONTRATOS\PGF\HEXIS\NOTAS`;

export const DEFAULT_COPY_DESTINATION_FOLDER = DEFAULT_NOTAS_FOLDER;

