import fs from "fs/promises";
import path from "path";

const WINDOWS_INVALID_FILE_NAME_CHARS = /[<>:"/\\|?*\x00-\x1F]/g;
const WINDOWS_RESERVED_NAMES = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i;

export function normalizarCaminho(filePath) {
  return path.normalize(filePath);
}

export async function caminhoExiste(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function obterEstatisticas(filePath) {
  try {
    return await fs.stat(filePath);
  } catch {
    return null;
  }
}

export async function ehArquivo(filePath) {
  const stats = await obterEstatisticas(filePath);
  return Boolean(stats?.isFile());
}

export async function ehPasta(filePath) {
  const stats = await obterEstatisticas(filePath);
  return Boolean(stats?.isDirectory());
}

export function obterExtensao(filePath) {
  return path.extname(filePath);
}

export function obterNomeBase(filePath) {
  return path.basename(filePath);
}

export function criarNomeSeguroWindows(fileName, fallback = "arquivo") {
  const rawName = String(fileName || "").trim();
  const safeName = rawName
    .replace(WINDOWS_INVALID_FILE_NAME_CHARS, "_")
    .replace(/\s+/g, " ")
    .replace(/[. ]+$/g, "")
    .trim();

  const finalName = safeName || fallback;

  if (WINDOWS_RESERVED_NAMES.test(finalName)) {
    return `_${finalName}`;
  }

  return finalName;
}

export function garantirExtensao(originalPath, newName) {
  const safeName = criarNomeSeguroWindows(newName);

  if (path.extname(safeName)) {
    return safeName;
  }

  return `${safeName}${path.extname(originalPath)}`;
}

export function montarCaminhoDestino(sourcePath, destinationFolder, destinationFileName) {
  const fileName = destinationFileName
    ? garantirExtensao(sourcePath, destinationFileName)
    : criarNomeSeguroWindows(path.basename(sourcePath));

  return path.join(destinationFolder, fileName);
}

