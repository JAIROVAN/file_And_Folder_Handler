const fs = require("fs/promises");
const pdf = require("pdf-parse");

//const caminhoPdf = String.raw`H:\ASPLA DOCUMENTOS DE CONTRATOS\OS HEXIS 2025\OS 04 2025\SÃO L. DOS MONTES BELOS\NF1031738.PDF.pdf`;
const caminhoPdf = String.raw`C:\Users\m169161\Desktop\CONTRATOS\PGF\HEXIS\NOTAS\1030580.PDF`;

async function lerPdf() {
  try {
    const buffer = await fs.readFile(caminhoPdf);

    const resultado = await pdf(buffer);

    console.log("Páginas:", resultado.numpages);
    console.log("Texto extraído:");
    console.log(resultado.text);

    await fs.writeFile("texto_extraido_pdf.txt", resultado.text, "utf8");

    console.log("Arquivo texto_extraido_pdf.txt criado com sucesso.");
  } catch (erro) {
    console.error("Erro ao ler o PDF:");
    console.error(erro);
  }
}

lerPdf();