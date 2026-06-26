import fs from "fs/promises";
import path from "path";
import { DEFAULT_IGNORED_FOLDERS } from "../config/paths.js";

function normalizarExtensoes(extensions = []) {
  return new Set(
    extensions
      .filter(Boolean)
      .map((extension) => {
        const value = extension.toLowerCase();
        return value.startsWith(".") ? value : `.${value}`;
      })
  );
}

function deveIgnorarPasta(folderName, ignoredFolders) {
  return ignoredFolders.includes(folderName);
}

function deveIncluirArquivo(fileName, extensions) {
  if (extensions.size === 0) {
    return true;
  }

  return extensions.has(path.extname(fileName).toLowerCase());
}

function montarMetadados(filePath, folderPath, fileName, stats) {
  return {
    name: fileName,
    extension: path.extname(fileName),
    fullPath: filePath,
    folderPath,
    size: stats.size,
    createdAt: stats.birthtime,
    modifiedAt: stats.mtime
  };
}

export async function listarArquivos(rootFolder, options = {}) {
  const {
    recursive = true,
    extensions = [],
    ignoredFolders = DEFAULT_IGNORED_FOLDERS
  } = options;

  const extensionSet = normalizarExtensoes(extensions);
  const result = [];

  async function scan(currentFolder) {
    const entries = await fs.readdir(currentFolder, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentFolder, entry.name);

      if (entry.isDirectory()) {
        if (!deveIgnorarPasta(entry.name, ignoredFolders) && recursive) {
          await scan(fullPath);
        }

        continue;
      }

      if (!entry.isFile() || !deveIncluirArquivo(entry.name, extensionSet)) {
        continue;
      }

      const stats = await fs.stat(fullPath);
      result.push(montarMetadados(fullPath, currentFolder, entry.name, stats));
    }
  }

  await scan(rootFolder);
  return result;
}

export async function listarPdfs(rootFolder, options = {}) {
  return listarArquivos(rootFolder, {
    ...options,
    extensions: [".pdf"]
  });
}

