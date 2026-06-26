import { constants as fsConstants } from "fs";
import fs from "fs/promises";
import path from "path";
import {
  caminhoExiste,
  criarNomeSeguroWindows,
  ehArquivo,
  montarCaminhoDestino,
  normalizarCaminho
} from "./pathUtils.js";

export const DELETE_CONFIRMATION_TEXT = "EXCLUIR_ARQUIVOS";

function criarRelatorio(total = 0) {
  return {
    total,
    success: [],
    skipped: [],
    errors: []
  };
}

function adicionarResultado(report, item) {
  if (item.status === "success" || item.status === "dryRun") {
    report.success.push(item);
    return;
  }

  if (item.status === "skipped") {
    report.skipped.push(item);
    return;
  }

  report.errors.push(item);
}

function criarResultado({ source, destination, status, message, errorCode }) {
  return {
    source,
    destination,
    status,
    message,
    ...(errorCode ? { errorCode } : {})
  };
}

export async function criarPastaSeNaoExistir(folderPath, options = {}) {
  const { dryRun = false } = options;

  if (await caminhoExiste(folderPath)) {
    return;
  }

  if (dryRun) {
    return;
  }

  await fs.mkdir(folderPath, { recursive: true });
}

export async function copiarArquivoSeguro(sourcePath, destinationFolder, options = {}) {
  const {
    destinationFileName,
    dryRun = false,
    overwrite = false
  } = options;

  const source = normalizarCaminho(sourcePath);
  const destination = montarCaminhoDestino(source, destinationFolder, destinationFileName);

  try {
    if (!(await ehArquivo(source))) {
      return criarResultado({
        source,
        destination,
        status: "error",
        message: "Arquivo de origem nao encontrado ou nao e um arquivo.",
        errorCode: "ENOENT"
      });
    }

    if (!overwrite && await caminhoExiste(destination)) {
      return criarResultado({
        source,
        destination,
        status: "skipped",
        message: "Destino ja existe. O arquivo nao foi sobrescrito."
      });
    }

    if (dryRun) {
      return criarResultado({
        source,
        destination,
        status: "dryRun",
        message: "Simulacao: arquivo seria copiado."
      });
    }

    await criarPastaSeNaoExistir(destinationFolder);
    await fs.copyFile(
      source,
      destination,
      overwrite ? 0 : fsConstants.COPYFILE_EXCL
    );

    return criarResultado({
      source,
      destination,
      status: "success",
      message: "Arquivo copiado com sucesso."
    });
  } catch (error) {
    if (error.code === "EEXIST") {
      return criarResultado({
        source,
        destination,
        status: "skipped",
        message: "Destino ja existe. O arquivo nao foi sobrescrito.",
        errorCode: error.code
      });
    }

    return criarResultado({
      source,
      destination,
      status: "error",
      message: error.message,
      errorCode: error.code || "SEM_CODIGO"
    });
  }
}

export async function copiarArquivos(filePairs, options = {}) {
  const report = criarRelatorio(filePairs.length);

  for (const item of filePairs) {
    if (!Array.isArray(item) || item.length < 2 || !item[0] || !item[1]) {
      adicionarResultado(report, criarResultado({
        source: Array.isArray(item) ? item[0] || "" : "",
        destination: Array.isArray(item) ? item[1] || "" : "",
        status: "error",
        message: "Entrada invalida. Use [caminhoArquivo, pastaDestino].",
        errorCode: "ENTRADA_INVALIDA"
      }));
      continue;
    }

    const [sourcePath, destinationFolder] = item;
    const result = await copiarArquivoSeguro(sourcePath, destinationFolder, options);
    adicionarResultado(report, result);
  }

  return report;
}

export async function renomearArquivoSeguro(sourcePath, newName, options = {}) {
  const {
    dryRun = false,
    overwrite = false
  } = options;

  const source = normalizarCaminho(sourcePath);
  const safeName = criarNomeSeguroWindows(newName);
  const destination = montarCaminhoDestino(source, path.dirname(source), safeName);

  try {
    if (!(await ehArquivo(source))) {
      return criarResultado({
        source,
        destination,
        status: "error",
        message: "Arquivo de origem nao encontrado ou nao e um arquivo.",
        errorCode: "ENOENT"
      });
    }

    if (!overwrite && await caminhoExiste(destination)) {
      return criarResultado({
        source,
        destination,
        status: "skipped",
        message: "Ja existe um arquivo com o novo nome. Nada foi alterado."
      });
    }

    if (dryRun) {
      return criarResultado({
        source,
        destination,
        status: "dryRun",
        message: "Simulacao: arquivo seria renomeado."
      });
    }

    await fs.rename(source, destination);

    return criarResultado({
      source,
      destination,
      status: "success",
      message: "Arquivo renomeado com sucesso."
    });
  } catch (error) {
    return criarResultado({
      source,
      destination,
      status: "error",
      message: error.message,
      errorCode: error.code || "SEM_CODIGO"
    });
  }
}

export async function renomearArquivos(filePairs, options = {}) {
  const report = criarRelatorio(filePairs.length);

  for (const [sourcePath, newName] of filePairs) {
    const result = await renomearArquivoSeguro(sourcePath, newName, options);
    adicionarResultado(report, result);
  }

  return report;
}

export async function moverArquivoSeguro(sourcePath, destinationFolder, options = {}) {
  const {
    dryRun = false,
    overwrite = false
  } = options;

  const source = normalizarCaminho(sourcePath);
  const destination = montarCaminhoDestino(source, destinationFolder);

  try {
    if (!(await ehArquivo(source))) {
      return criarResultado({
        source,
        destination,
        status: "error",
        message: "Arquivo de origem nao encontrado ou nao e um arquivo.",
        errorCode: "ENOENT"
      });
    }

    if (!overwrite && await caminhoExiste(destination)) {
      return criarResultado({
        source,
        destination,
        status: "skipped",
        message: "Destino ja existe. O arquivo nao foi movido."
      });
    }

    if (dryRun) {
      return criarResultado({
        source,
        destination,
        status: "dryRun",
        message: "Simulacao: arquivo seria movido."
      });
    }

    await criarPastaSeNaoExistir(destinationFolder);

    try {
      await fs.rename(source, destination);
    } catch (error) {
      if (error.code !== "EXDEV") {
        throw error;
      }

      await fs.copyFile(
        source,
        destination,
        overwrite ? 0 : fsConstants.COPYFILE_EXCL
      );
      await fs.unlink(source);
    }

    return criarResultado({
      source,
      destination,
      status: "success",
      message: "Arquivo movido com sucesso."
    });
  } catch (error) {
    if (error.code === "EEXIST") {
      return criarResultado({
        source,
        destination,
        status: "skipped",
        message: "Destino ja existe. O arquivo nao foi movido.",
        errorCode: error.code
      });
    }

    return criarResultado({
      source,
      destination,
      status: "error",
      message: error.message,
      errorCode: error.code || "SEM_CODIGO"
    });
  }
}

export async function moverArquivos(filePairs, options = {}) {
  const report = criarRelatorio(filePairs.length);

  for (const [sourcePath, destinationFolder] of filePairs) {
    const result = await moverArquivoSeguro(sourcePath, destinationFolder, options);
    adicionarResultado(report, result);
  }

  return report;
}

export async function excluirArquivoSeguro(sourcePath, options = {}) {
  const {
    dryRun = false,
    confirmDelete = ""
  } = options;

  const source = normalizarCaminho(sourcePath);

  try {
    if (!(await caminhoExiste(source))) {
      return criarResultado({
        source,
        destination: "",
        status: "skipped",
        message: "Arquivo nao encontrado. Nada foi excluido.",
        errorCode: "ENOENT"
      });
    }

    if (!(await ehArquivo(source))) {
      return criarResultado({
        source,
        destination: "",
        status: "error",
        message: "O caminho existe, mas nao e um arquivo. Pastas nao sao excluidas por esta funcao.",
        errorCode: "NAO_E_ARQUIVO"
      });
    }

    if (dryRun) {
      return criarResultado({
        source,
        destination: "",
        status: "dryRun",
        message: "Simulacao: arquivo seria excluido."
      });
    }

    if (confirmDelete !== DELETE_CONFIRMATION_TEXT) {
      return criarResultado({
        source,
        destination: "",
        status: "skipped",
        message: `Exclusao bloqueada. Para excluir de verdade, use confirmDelete: "${DELETE_CONFIRMATION_TEXT}".`
      });
    }

    await fs.unlink(source);

    return criarResultado({
      source,
      destination: "",
      status: "success",
      message: "Arquivo excluido com sucesso."
    });
  } catch (error) {
    return criarResultado({
      source,
      destination: "",
      status: "error",
      message: error.message,
      errorCode: error.code || "SEM_CODIGO"
    });
  }
}

export async function excluirArquivos(filePaths, options = {}) {
  const report = criarRelatorio(filePaths.length);

  for (const filePath of filePaths) {
    const result = await excluirArquivoSeguro(filePath, options);
    adicionarResultado(report, result);
  }

  return report;
}
