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
    ignoredFolders = DEFAULT_IGNORED_FOLDERS,
    onAccessError = null
  } = options;

  const extensionSet = normalizarExtensoes(extensions);
  const result = [];

  // Sem onAccessError, qualquer erro de leitura interrompe a varredura (comportamento original).
  // Com onAccessError, pastas/arquivos sem permissao (EPERM/EACCES no Windows) sao reportados e pulados.
  async function tentar(action, targetPath) {
    try {
      return await action();
    } catch (error) {
      if (!onAccessError || currentFolderIsRoot(targetPath)) {
        throw error;
      }

      onAccessError(targetPath, error);
      return null;
    }
  }

  function currentFolderIsRoot(targetPath) {
    return targetPath === rootFolder;
  }

  async function scan(currentFolder) {
    const entries = await tentar(
      () => fs.readdir(currentFolder, { withFileTypes: true }),
      currentFolder
    );

    if (!entries) {
      return;
    }

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

      const stats = await tentar(() => fs.stat(fullPath), fullPath);

      if (!stats) {
        continue;
      }

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

