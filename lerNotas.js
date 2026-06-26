const fs = require("fs/promises");
const path = require("path");
const pdf = require("pdf-parse");

// Coloque aqui o caminho da pasta onde estão os PDFs
const PASTA_PDFS = 'C:\\Users\\m169161\\Desktop\\CONTRATOS\\PGF\\HEXIS\\NOTAS';

// Se true, lê também PDFs dentro de subpastas
const LER_SUBPASTAS = false;

// Arquivos de saída
const ARQUIVO_JSON = "resumo_notas.json";
const ARQUIVO_CSV = "resumo_notas.csv";

async function listarPdfs(pasta, lerSubpastas = false) {
    const arquivosEncontrados = [];

    const itens = await fs.readdir(pasta, { withFileTypes: true });

    for (const item of itens) {
        const caminhoCompleto = path.join(pasta, item.name);

        if (item.isDirectory() && lerSubpastas) {
            const pdfsSubpasta = await listarPdfs(caminhoCompleto, lerSubpastas);
            arquivosEncontrados.push(...pdfsSubpasta);
        }

        if (item.isFile() && item.name.toLowerCase().endsWith(".pdf")) {
            arquivosEncontrados.push(caminhoCompleto);
        }
    }

    return arquivosEncontrados;
}

function limparTexto(texto) {
    return texto
        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n[ \t]+/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function textoEmUmaLinha(texto) {
    return texto
        .replace(/\s+/g, " ")
        .trim();
}

function pegarPrimeiro(regex, texto) {
    const resultado = texto.match(regex);
    return resultado && resultado[1] ? resultado[1].trim() : "";
}

function pegarTodos(regex, texto) {
    return [...texto.matchAll(regex)].map((m) => m[0]);
}

function capturarEntre(texto, regexInicio, regexFim) {
    const inicio = texto.search(regexInicio);

    if (inicio === -1) {
        return "";
    }

    const textoDepoisInicio = texto.slice(inicio);
    const fimRelativo = textoDepoisInicio.search(regexFim);

    if (fimRelativo === -1) {
        return textoDepoisInicio.trim();
    }

    return textoDepoisInicio.slice(0, fimRelativo).trim();
}

function normalizarCampoLongo(texto) {
    return texto
        .replace(/-+\s*/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function converterValorBrParaNumero(valorTexto) {
    if (!valorTexto) {
        return null;
    }

    return Number(
        valorTexto
            .replace(/\./g, "") // remove separador de milhar
            .replace(",", ".")  // troca vírgula decimal por ponto
    );
}


/*
function extrairDadosNota(textoOriginal, caminhoArquivo) {
  const texto = limparTexto(textoOriginal);
  const linha = textoEmUmaLinha(texto);

  const cnpjs = pegarTodos(/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, linha);

  const numeroNota =
    pegarPrimeiro(/N[º°]\.?\s*([0-9]{5,})\s*[–-]\s*FL/i, linha) ||
    pegarPrimeiro(/NF-e\s*N[º°]\.?\s*([0-9]{5,})/i, linha) ||
    pegarPrimeiro(/N[º°]\.?\s*([0-9]{5,})/i, linha);

  const serie =
    pegarPrimeiro(/S[ÉE]RIE\s+([0-9]+)/i, linha);

  const dataEmissao =
    pegarPrimeiro(/DT\s*EMISS[ÃA]O\s*(\d{2}\/\d{2}\/\d{4})/i, linha);

  const valorTotalNota =
    pegarPrimeiro(/VALOR TOTAL DA NOTA\s*([\d.]+,\d{2})/i, linha);

  const valorTotalProdutos =
    pegarPrimeiro(/VALOR TOTAL DOS PRODUTOS\s*([\d.]+,\d{2})/i, linha);

  const valorIcms =
    pegarPrimeiro(/VALOR DO ICMS\s*([\d.]+,\d{2})/i, linha);

  const valorIpi =
    pegarPrimeiro(/VALOR DO IPI\s*([\d.]+,\d{2})/i, linha);

  const chaveAcesso = pegarPrimeiro(
    /CHAVE DE ACESSO\s*([0-9 ]{40,})/i,
    linha
  ).replace(/\s+/g, "");

  const protocoloAutorizacao =
    pegarPrimeiro(/PROTOCOLO DE AUTORIZA[ÇC][ÃA]O DE USO\s*([0-9]+)/i, linha);

  const naturezaOperacao =
    pegarPrimeiro(/NATUREZA DA OPERA[ÇC][ÃA]O\s*(.*?)\s*CHAVE DE ACESSO/i, linha);

  const nomeEmitente =
    pegarPrimeiro(/Identifica[çc][ãa]o do emitente\s*(.*?)\s+(?:Av|Rua|Rod|Avenida)/i, linha) ||
    pegarPrimeiro(/RECEBEMOS DE\s*(.*?)\s+OS PRODUTOS CONSTANTES/i, linha);

  // Neste modelo, o primeiro CNPJ encontrado é o CNPJ do emitente.
  const cnpjEmitente = cnpjs[0] || "";

  // Neste modelo, o segundo CNPJ costuma ser o destinatário.
  const cnpjDestinatario = cnpjs[1] || "";

  const produtosServicosBruto = capturarEntre(
    texto,
    /DADOS DOS PRODUTOS\s*\/\s*SERVI[ÇC]OS/i,
    /C[ÁA]LCULO DO ISSQN/i
  );

  const dadosAdicionaisBruto = capturarEntre(
    texto,
    /INFORMA[ÇC][ÕO]ES COMPLEMENTARES/i,
    /RESERVADO AO FISCO/i
  );

  const pedidos =
    pegarPrimeiro(/PEDIDOS?\s*([0-9]+)/i, linha);

  const solicitacao =
    pegarPrimeiro(/Solicita[çc][aã]o:\s*([^/]+?)(?=\s*contrato|\s*Contrato|\s*Patrimonio|\s*Patrimônio|\/\/)/i, linha);

  const contrato =
    pegarPrimeiro(/contrato\s*:?\s*([0-9/.-]+)/i, linha);

  const patrimonio =
    pegarPrimeiro(/Patrimonio\s*:?\s*([0-9.-]+)/i, linha) ||
    pegarPrimeiro(/Patrimônio\s*:?\s*([0-9.-]+)/i, linha);

  const orcamento =
    pegarPrimeiro(/Orcamento\s*:?\s*([0-9.-]+)/i, linha) ||
    pegarPrimeiro(/Orçamento\s*:?\s*([0-9.-]+)/i, linha) ||
    pegarPrimeiro(/No do Orcamento\s*:?\s*([0-9.-]+)/i, linha);

  return {
    ARQUIVO: path.basename(caminhoArquivo),
    CAMINHO: caminhoArquivo,

    NUMERO_NOTA: numeroNota,
    SERIE: serie,
    DATA_EMISSAO: dataEmissao,
    CNPJ_EMITENTE: cnpjEmitente,
    NOME_EMITENTE: nomeEmitente,

    CNPJ_DESTINATARIO: cnpjDestinatario,

    VALOR_TOTAL_NOTA: valorTotalNota,
    VALOR_TOTAL_PRODUTOS: valorTotalProdutos,
    VALOR_ICMS: valorIcms,
    VALOR_IPI: valorIpi,

    CHAVE_ACESSO: chaveAcesso,
    PROTOCOLO_AUTORIZACAO: protocoloAutorizacao,
    NATUREZA_OPERACAO: naturezaOperacao,

    PEDIDO: pedidos,
    SOLICITACAO: solicitacao,
    CONTRATO: contrato,
    PATRIMONIO: patrimonio,
    ORCAMENTO: orcamento,

    PRODUTOS_SERVICOS: normalizarCampoLongo(produtosServicosBruto),
    DADOS_ADICIONAIS: normalizarCampoLongo(dadosAdicionaisBruto)
  };
}
  */
function extrairDadosNota(textoOriginal, caminhoArquivo) {
    const texto = limparTexto(textoOriginal);
    const linha = textoEmUmaLinha(texto);

    const cnpjs = pegarTodos(/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, linha);

    const numeroNota =
        pegarPrimeiro(/N[º°]\.?\s*([0-9]{5,})\s*[–-]\s*FL/i, linha) ||
        pegarPrimeiro(/NF-e\s*N[º°]\.?\s*([0-9]{5,})/i, linha) ||
        pegarPrimeiro(/N[º°]\.?\s*([0-9]{5,})/i, linha);

    const serie =
        pegarPrimeiro(/S[ÉE]RIE\s+([0-9]+)/i, linha);

    const dataEmissao =
        pegarPrimeiro(/DT\s*EMISS[ÃA]O\s*(\d{2}\/\d{2}\/\d{4})/i, linha);

    const valorTotalNotaTexto =
        pegarPrimeiro(/VALOR TOTAL DA NOTA\s*([\d.]+,\d{2})/i, linha);

    const valorTotalNota = converterValorBrParaNumero(valorTotalNotaTexto);

    const nomeEmitente =
        pegarPrimeiro(/Identifica[çc][ãa]o do emitente\s*(.*?)\s+(?:Av|Rua|Rod|Avenida)/i, linha) ||
        pegarPrimeiro(/RECEBEMOS DE\s*(.*?)\s+OS PRODUTOS CONSTANTES/i, linha);

    // Neste modelo, o primeiro CNPJ encontrado costuma ser o CNPJ do emitente.
    const cnpjEmitente = cnpjs[0] || "";

    const produtosServicosBruto = capturarEntre(
        texto,
        /DADOS DOS PRODUTOS\s*\/\s*SERVI[ÇC]OS/i,
        /C[ÁA]LCULO DO ISSQN/i
    );

    const dadosAdicionaisBruto = capturarEntre(
        texto,
        /INFORMA[ÇC][ÕO]ES COMPLEMENTARES/i,
        /RESERVADO AO FISCO/i
    );

    const solicitacao =
        pegarPrimeiro(/Solicita[çc][aã]o:\s*([^/]+?)(?=\s*contrato|\s*Contrato|\s*Patrimonio|\s*Patrimônio|\/\/)/i, linha);

    const contrato =
        pegarPrimeiro(/contrato\s*:?\s*([0-9/.-]+)/i, linha);

    const patrimonio =
        pegarPrimeiro(/Patrimonio\s*:?\s*([0-9.-]+)/i, linha) ||
        pegarPrimeiro(/Patrimônio\s*:?\s*([0-9.-]+)/i, linha);

    const orcamento =
        pegarPrimeiro(/Orcamento\s*:?\s*([0-9.-]+)/i, linha) ||
        pegarPrimeiro(/Orçamento\s*:?\s*([0-9.-]+)/i, linha) ||
        pegarPrimeiro(/No do Orcamento\s*:?\s*([0-9.-]+)/i, linha);

    return {
        NUMERO_NOTA: numeroNota,
        SERIE: serie,
        DATA_EMISSAO: dataEmissao,
        CNPJ_EMITENTE: cnpjEmitente,
        NOME_EMITENTE: nomeEmitente,
        VALOR_TOTAL_NOTA: valorTotalNota,
        SOLICITACAO: solicitacao,
        CONTRATO: contrato,
        PATRIMONIO: patrimonio,
        ORCAMENTO: orcamento,
        PRODUTOS_SERVICOS: normalizarCampoLongo(produtosServicosBruto),
        DADOS_ADICIONAIS: normalizarCampoLongo(dadosAdicionaisBruto)
    };
}

function escaparCsv(valor) {
    if (valor === null || valor === undefined) {
        return "";
    }

    const texto = String(valor)
        .replace(/\r?\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    return `"${texto.replace(/"/g, '""')}"`;
}

function gerarCsv(dados) {
    if (dados.length === 0) {
        return "";
    }

    const colunas = Object.keys(dados[0]);

    const cabecalho = colunas.join(";");

    const linhas = dados.map((item) => {
        return colunas.map((coluna) => escaparCsv(item[coluna])).join(";");
    });

    return [cabecalho, ...linhas].join("\n");
}

async function processarPdfs() {
    try {
        const arquivosPdf = await listarPdfs(PASTA_PDFS, LER_SUBPASTAS);

        console.log(`PDFs encontrados: ${arquivosPdf.length}`);

        const resumo = [];

        for (const arquivoPdf of arquivosPdf) {
            try {
                console.log(`Lendo: ${arquivoPdf}`);

                const buffer = await fs.readFile(arquivoPdf);
                const resultadoPdf = await pdf(buffer);

                const dadosNota = extrairDadosNota(resultadoPdf.text, arquivoPdf);

                resumo.push(dadosNota);
            } catch (erroArquivo) {
                console.error(`Erro ao processar o arquivo: ${arquivoPdf}`);
                console.error(erroArquivo.message);

                resumo.push({
                    ARQUIVO: path.basename(arquivoPdf),
                    CAMINHO: arquivoPdf,
                    ERRO: erroArquivo.message
                });
            }
        }

        const caminhoJson = path.join(PASTA_PDFS, ARQUIVO_JSON);
        const caminhoCsv = path.join(PASTA_PDFS, ARQUIVO_CSV);

        await fs.writeFile(caminhoJson, JSON.stringify(resumo, null, 2), "utf8");
        await fs.writeFile(caminhoCsv, gerarCsv(resumo), "utf8");

        //logs
        console.log("");
        console.log("Resumo dos dados extraídos:");
        console.table(
            resumo.map((item) => ({
                NUMERO_NOTA: item.NUMERO_NOTA,
                SERIE: item.SERIE,
                DATA_EMISSAO: item.DATA_EMISSAO,
                CNPJ_EMITENTE: item.CNPJ_EMITENTE,
                NOME_EMITENTE: item.NOME_EMITENTE,
                VALOR_TOTAL_NOTA: item.VALOR_TOTAL_NOTA,
                SOLICITACAO: item.SOLICITACAO,
                CONTRATO: item.CONTRATO,
                PATRIMONIO: item.PATRIMONIO,
                ORCAMENTO: item.ORCAMENTO,
                ERRO: item.ERRO || ""
            }))
        );

        ////

        console.log("");
        console.log("Processamento concluído.");
        console.log(`JSON gerado em: ${caminhoJson}`);
        console.log(`CSV gerado em: ${caminhoCsv}`);
    } catch (erro) {
        console.error("Erro geral da aplicação:");
        console.error(erro);
    }



}


processarPdfs();