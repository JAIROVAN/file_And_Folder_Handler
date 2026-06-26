import path from "path";

function limparTexto(text) {
  return String(text || "")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function textoEmUmaLinha(text) {
  return text.replace(/\s+/g, " ").trim();
}

function removerAcentos(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function pegarPrimeiro(regex, text) {
  const match = text.match(regex);
  return match?.[1]?.trim() || "";
}

function pegarTodos(regex, text) {
  return [...text.matchAll(regex)].map((match) => match[0]);
}

function capturarEntre(text, startRegex, endRegex) {
  const start = text.search(startRegex);

  if (start === -1) {
    return "";
  }

  const afterStart = text.slice(start);
  const end = afterStart.search(endRegex);

  if (end === -1) {
    return afterStart.trim();
  }

  return afterStart.slice(0, end).trim();
}

function normalizarCampoLongo(text) {
  return text
    .replace(/-+\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function converterValorBrParaNumero(value) {
  if (!value) {
    return null;
  }

  return Number(value.replace(/\./g, "").replace(",", "."));
}

export function extrairDadosNotaFiscal(textoOriginal, filePath = "") {
  const text = limparTexto(textoOriginal);
  const line = textoEmUmaLinha(text);
  const normalizedText = removerAcentos(text);
  const normalizedLine = removerAcentos(line);

  const cnpjs = pegarTodos(/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, normalizedLine);

  const numeroNota =
    pegarPrimeiro(/NF-e\s*N\D{0,5}([0-9]{5,})/i, normalizedLine) ||
    pegarPrimeiro(/\bN\D{0,5}([0-9]{5,})\s*[- ]\s*FL/i, normalizedLine) ||
    pegarPrimeiro(/\bN\D{0,5}([0-9]{5,})/i, normalizedLine);

  const serie = pegarPrimeiro(/SERIE\s+([0-9]+)/i, normalizedLine);

  const dataEmissao = pegarPrimeiro(
    /DT\s*EMISSAO\s*(\d{2}\/\d{2}\/\d{4})/i,
    normalizedLine
  );

  const valorTotalNotaTexto = pegarPrimeiro(
    /VALOR TOTAL DA NOTA\s*([\d.]+,\d{2})/i,
    normalizedLine
  );

  const nomeEmitente =
    pegarPrimeiro(/Identificacao do emitente\s*(.*?)\s+(?:Av|Rua|Rod|Avenida)\b/i, normalizedLine) ||
    pegarPrimeiro(/RECEBEMOS DE\s*(.*?)\s+OS PRODUTOS CONSTANTES/i, normalizedLine);

  const produtosServicosBruto = capturarEntre(
    normalizedText,
    /DADOS DOS PRODUTOS\s*\/\s*SERVICOS/i,
    /CALCULO DO ISSQN/i
  );

  const dadosAdicionaisBruto = capturarEntre(
    normalizedText,
    /INFORMACOES COMPLEMENTARES/i,
    /RESERVADO AO FISCO/i
  );

  const solicitacao = pegarPrimeiro(
    /Solicitacao:\s*([^/]+?)(?=\s*contrato|\s*Patrimonio|\/\/)/i,
    normalizedLine
  );

  const contrato = pegarPrimeiro(/contrato\s*:?\s*([0-9/.-]+)/i, normalizedLine);
  const patrimonio = pegarPrimeiro(/Patrimonio\s*:?\s*([0-9.-]+)/i, normalizedLine);

  const orcamento =
    pegarPrimeiro(/Orcamento\s*:?\s*([0-9.-]+)/i, normalizedLine) ||
    pegarPrimeiro(/No do Orcamento\s*:?\s*([0-9.-]+)/i, normalizedLine);

  return {
    ARQUIVO: filePath ? path.basename(filePath) : "",
    CAMINHO: filePath,
    NUMERO_NOTA: numeroNota,
    SERIE: serie,
    DATA_EMISSAO: dataEmissao,
    CNPJ_EMITENTE: cnpjs[0] || "",
    NOME_EMITENTE: nomeEmitente,
    VALOR_TOTAL_NOTA: converterValorBrParaNumero(valorTotalNotaTexto),
    SOLICITACAO: solicitacao,
    CONTRATO: contrato,
    PATRIMONIO: patrimonio,
    ORCAMENTO: orcamento,
    PRODUTOS_SERVICOS: normalizarCampoLongo(produtosServicosBruto),
    DADOS_ADICIONAIS: normalizarCampoLongo(dadosAdicionaisBruto)
  };
}

