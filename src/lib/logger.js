export function logInfo(message) {
  console.log(message);
}

export function logError(message, error) {
  console.error(message);

  if (error) {
    console.error(error.message || error);
  }
}

export function logResumoOperacao(title, report) {
  console.log("");
  console.log(title);
  console.log("=".repeat(title.length));
  console.log(`Total: ${report.total}`);
  console.log(`Sucessos: ${report.success.length}`);
  console.log(`Ignorados: ${report.skipped.length}`);
  console.log(`Erros: ${report.errors.length}`);
}

export function logTabela(rows) {
  console.table(rows);
}

