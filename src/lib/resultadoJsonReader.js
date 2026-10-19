import fs from "fs";
import readline from "readline";

function ehListaDeLinhas(data) {
  return Array.isArray(data) && data.every(Array.isArray);
}

async function* lerJsonInteiro(filePath) {
  const data = JSON.parse(await fs.promises.readFile(filePath, "utf8"));

  if (!ehListaDeLinhas(data)) {
    throw new Error("o JSON nao e um array de arrays (formato gerado pelo lerPlanilhas.js).");
  }

  yield* data;
}

/**
 * Le um JSON gerado pelo lerPlanilhas.js e devolve as linhas uma a uma (async generator).
 * O formato gerado tem uma linha da planilha por linha do arquivo ("[", "  [...],", "]"),
 * entao e lido em streaming, sem carregar o arquivo inteiro na memoria.
 * Outros JSON validos no formato [[...], [...]] sao lidos inteiros.
 */
export async function* lerLinhasResultadoJson(filePath) {
  const linhas = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: "utf8" }),
    crlfDelay: Infinity
  });

  let numeroLinha = 0;
  let primeiraLinha = true;

  try {
    for await (const linha of linhas) {
      numeroLinha += 1;
      const texto = linha.trim().replace(/^﻿/, "");

      if (!texto) {
        continue;
      }

      if (primeiraLinha) {
        primeiraLinha = false;

        if (texto === "[") {
          continue;
        }

        // Nao e o formato linha a linha do lerPlanilhas.js: tenta como JSON comum.
        linhas.close();
        yield* lerJsonInteiro(filePath);
        return;
      }

      if (texto === "]") {
        continue;
      }

      const json = texto.endsWith(",") ? texto.slice(0, -1) : texto;
      let row;

      try {
        row = JSON.parse(json);
      } catch (error) {
        throw new Error(`linha ${numeroLinha} invalida: ${error.message}`);
      }

      if (!Array.isArray(row)) {
        throw new Error(`linha ${numeroLinha} nao e um array.`);
      }

      yield row;
    }
  } finally {
    linhas.close();
  }
}
