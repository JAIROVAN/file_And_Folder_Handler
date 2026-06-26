import fs from "fs/promises";
import path from "path";

function limparValorCsv(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function gerarCsv(rows, options = {}) {
  const { separator = ";" } = options;

  if (!rows.length) {
    return "";
  }

  const columns = Object.keys(rows[0]);
  const header = columns.join(separator);
  const body = rows.map((row) => {
    return columns
      .map((column) => `"${limparValorCsv(row[column]).replace(/"/g, '""')}"`)
      .join(separator);
  });

  return [header, ...body].join("\n");
}

export async function salvarJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

export async function salvarCsv(filePath, rows, options = {}) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, gerarCsv(rows, options), "utf8");
}

export async function salvarTxt(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

export function formatarRelatorioOperacao(title, report) {
  const lines = [];

  lines.push(title);
  lines.push("=".repeat(title.length));
  lines.push("");
  lines.push(`Total: ${report.total}`);
  lines.push(`Sucessos: ${report.success.length}`);
  lines.push(`Ignorados: ${report.skipped.length}`);
  lines.push(`Erros: ${report.errors.length}`);
  lines.push("");

  for (const section of [
    ["SUCESSOS", report.success],
    ["IGNORADOS", report.skipped],
    ["ERROS", report.errors]
  ]) {
    const [sectionTitle, items] = section;
    lines.push(sectionTitle);
    lines.push("-".repeat(sectionTitle.length));

    if (!items.length) {
      lines.push("Nenhum item.");
      lines.push("");
      continue;
    }

    items.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.message}`);
      lines.push(`   Origem: ${item.source || ""}`);
      lines.push(`   Destino: ${item.destination || ""}`);
      lines.push(`   Status: ${item.status}`);

      if (item.errorCode) {
        lines.push(`   Codigo: ${item.errorCode}`);
      }

      lines.push("");
    });
  }

  return lines.join("\n");
}

export function montarLinhasOperacao(report) {
  return [...report.success, ...report.skipped, ...report.errors];
}

