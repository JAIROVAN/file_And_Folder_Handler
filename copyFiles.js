const fs = require('fs');
const path = require('path');

const files = [
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\AUDITORIA HEXIS\\NOTAS FISCAIS\\NF0986298.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\AUDITORIA HEXIS\\NOTAS FISCAIS\\NF0986299.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\AUDITORIA HEXIS\\NOTAS FISCAIS\\NF0986434.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\AUDITORIA HEXIS\\NOTAS FISCAIS\\NF0990675.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\AUDITORIA HEXIS\\NOTAS FISCAIS\\NF0990677.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\AUDITORIA HEXIS\\NOTAS FISCAIS\\NF0994899.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\AUDITORIA HEXIS\\NOTAS FISCAIS\\NF0995320.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\AUDITORIA HEXIS\\NOTAS FISCAIS\\NF0997954.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\AUDITORIA HEXIS\\NOTAS FISCAIS\\NF0997958.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\AUDITORIA HEXIS\\NOTAS FISCAIS\\NF0998030.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\AUDITORIA HEXIS\\NOTAS FISCAIS\\NF0998202.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\AUDITORIA HEXIS\\NOTAS FISCAIS\\NF0998558.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\AUDITORIA HEXIS\\NOTAS FISCAIS\\NFS-0058282.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\AUDITORIA HEXIS\\NOTAS FISCAIS\\NFS-0058283.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\AUDITORIA HEXIS\\NOTAS FISCAIS\\NFS-0058298.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\AUDITORIA HEXIS\\NOTAS FISCAIS\\NFS-0058831.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\AUDITORIA HEXIS\\NOTAS FISCAIS\\NFS-0058832.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\AUDITORIA HEXIS\\NOTAS FISCAIS\\NFS-0059479.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\AUDITORIA HEXIS\\NOTAS FISCAIS\\NFS-0059539.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\AUDITORIA HEXIS\\NOTAS FISCAIS\\NFS-0059854.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\AUDITORIA HEXIS\\NOTAS FISCAIS\\NFS-0059855.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\AUDITORIA HEXIS\\NOTAS FISCAIS\\NFS-0059869.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\AUDITORIA HEXIS\\NOTAS FISCAIS\\NFS-0059913.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\AUDITORIA HEXIS\\NOTAS FISCAIS\\NFS-0059987.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\HEXIS\\NOTAS - PASTA ASPLA\\NF0979438.PDF',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\HEXIS\\NOTAS - PASTA ASPLA\\NF0979609.PDF',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\HEXIS\\NOTAS - PASTA ASPLA\\NF0979612.PDF',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\HEXIS\\NOTAS - PASTA ASPLA\\NF0979615.PDF',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\HEXIS\\NOTAS - PASTA ASPLA\\NF0979617.PDF',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\HEXIS\\NOTAS - PASTA ASPLA\\NF0979897.PDF',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\HEXIS\\NOTAS - PASTA ASPLA\\NF0980379.PDF',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\HEXIS\\NOTAS - PASTA ASPLA\\NF0983978.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\HEXIS\\NOTAS - PASTA ASPLA\\NF0987805.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\HEXIS\\NOTAS - PASTA ASPLA\\NF0987808.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\HEXIS\\NOTAS - PASTA ASPLA\\NF0987813.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\HEXIS\\NOTAS - PASTA ASPLA\\NF0987818.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\HEXIS\\NOTAS - PASTA ASPLA\\NF0987828.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\HEXIS\\NOTAS - PASTA ASPLA\\NF0987837.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\HEXIS\\NOTAS - PASTA ASPLA\\NFS-0057555.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\HEXIS\\NOTAS - PASTA ASPLA\\NFS-0057584.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\HEXIS\\NOTAS - PASTA ASPLA\\NFS-0057585.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\HEXIS\\NOTAS - PASTA ASPLA\\NFS-0057586.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\HEXIS\\NOTAS - PASTA ASPLA\\NFS-0057587.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\HEXIS\\NOTAS - PASTA ASPLA\\NFS-0057615.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\HEXIS\\NOTAS - PASTA ASPLA\\NFS-0057695.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\HEXIS\\NOTAS - PASTA ASPLA\\NFS-0057964.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\HEXIS\\NOTAS - PASTA ASPLA\\NFS-0058429.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\HEXIS\\NOTAS - PASTA ASPLA\\NFS-0058430.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\HEXIS\\NOTAS - PASTA ASPLA\\NFS-0058431.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\HEXIS\\NOTAS - PASTA ASPLA\\NFS-0058432.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\HEXIS\\NOTAS - PASTA ASPLA\\NFS-0058433.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\HEXIS\\NOTAS - PASTA ASPLA\\NFS-0058434.pdf',
'C:\\Users\\m169161\\Downloads\\notas hexis encontradas nos processo de pagamento\\nfs 57694.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\notas hexis\\OS05\\NF0979871.PDF',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\notas hexis\\OS05\\NF0979878.PDF',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\notas hexis\\OS05\\NF0979884.PDF',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\notas hexis\\OS05\\NF0979895.PDF',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\notas hexis\\OS05\\NF0979900.PDF',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\notas hexis\\OS05\\NF0979901.PDF',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\notas hexis\\OS05\\NF0979902.PDF',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\notas hexis\\OS05\\NF0979955.PDF',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\notas hexis\\OS05\\NF0980048.PDF',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\notas hexis\\OS05\\NFS-0057611.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\notas hexis\\OS05\\NFS-0057612.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\notas hexis\\OS05\\NFS-0057613.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\notas hexis\\OS05\\NFS-0057614.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\notas hexis\\OS05\\NFS-0057616.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\notas hexis\\OS05\\NFS-0057617.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\notas hexis\\OS05\\NFS-0057618.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\notas hexis\\OS05\\NFS-0057631.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\notas hexis\\OS05\\NFS-0057635.pdf',
'C:\\Users\\m169161\\Desktop\\CONTRATOS\\notas hexis\\OS05\\NFS-0057823.pdf',
'C:\\Users\\m169161\\Downloads\\NF1017887.PDF',
'C:\\Users\\m169161\\Downloads\\NF1017889.PDF',
'C:\\Users\\m169161\\Downloads\\NFS-0061267.pdf',
'C:\\Users\\m169161\\Downloads\\NFS-0062458.pdf',
'C:\\Users\\m169161\\Downloads\\NFS-0062459.pdf',
'C:\\Users\\m169161\\Downloads\\NOTAS FISCAIS HEXIS MAIO 2025\\59561.pdf',
'C:\\Users\\m169161\\Downloads\\NOTAS FISCAIS HEXIS MAIO 2025\\NF0995321.PDF',
'C:\\Users\\m169161\\Downloads\\NOTAS FISCAIS HEXIS MAIO 2025\\NF0995322.PDF',
'C:\\Users\\m169161\\Downloads\\NOTAS FISCAIS HEXIS MAIO 2025\\NF0995338.PDF',
'C:\\Users\\m169161\\Downloads\\NOTAS FISCAIS HEXIS MAIO 2025\\NF0995344.PDF',
'C:\\Users\\m169161\\Downloads\\NOTAS FISCAIS HEXIS MAIO 2025\\NF0995351.PDF',
'C:\\Users\\m169161\\Downloads\\NOTAS FISCAIS HEXIS MAIO 2025\\NF0995357.PDF',
'C:\\Users\\m169161\\Downloads\\NOTAS FISCAIS HEXIS MAIO 2025\\NF0995361.PDF',
'C:\\Users\\m169161\\Downloads\\NOTAS FISCAIS HEXIS MAIO 2025\\NF0995364.PDF',
'C:\\Users\\m169161\\Downloads\\NOTAS FISCAIS HEXIS MAIO 2025\\NF0995379.PDF',
'C:\\Users\\m169161\\Downloads\\NOTAS FISCAIS HEXIS MAIO 2025\\NF0995380.PDF',
'C:\\Users\\m169161\\Downloads\\NOTAS FISCAIS HEXIS MAIO 2025\\NF0995381.PDF',
'C:\\Users\\m169161\\Downloads\\NOTAS FISCAIS HEXIS MAIO 2025\\NF0995402.PDF',
'C:\\Users\\m169161\\Downloads\\NOTAS FISCAIS HEXIS MAIO 2025\\NFS-0059537.pdf',
'C:\\Users\\m169161\\Downloads\\NOTAS FISCAIS HEXIS MAIO 2025\\NFS-0059538.pdf',
'C:\\Users\\m169161\\Downloads\\NOTAS FISCAIS HEXIS MAIO 2025\\NFS-0059544.pdf',
'C:\\Users\\m169161\\Downloads\\NOTAS FISCAIS HEXIS MAIO 2025\\NFS-0059545.pdf',
'C:\\Users\\m169161\\Downloads\\NOTAS FISCAIS HEXIS MAIO 2025\\NFS-0059546.pdf',
'C:\\Users\\m169161\\Downloads\\NOTAS FISCAIS HEXIS MAIO 2025\\NFS-0059547.pdf',
'C:\\Users\\m169161\\Downloads\\NOTAS FISCAIS HEXIS MAIO 2025\\NFS-0059548.pdf',
'C:\\Users\\m169161\\Downloads\\NOTAS FISCAIS HEXIS MAIO 2025\\NFS-0059549.pdf',
'C:\\Users\\m169161\\Downloads\\NOTAS FISCAIS HEXIS MAIO 2025\\NFS-0059550.pdf',
'C:\\Users\\m169161\\Downloads\\NOTAS FISCAIS HEXIS MAIO 2025\\NFS-0059551.pdf',
'C:\\Users\\m169161\\Downloads\\NOTAS FISCAIS HEXIS MAIO 2025\\NFS-0059552.pdf',
'C:\\Users\\m169161\\Downloads\\NOTAS FISCAIS HEXIS MAIO 2025\\NFS-0059553.pdf',
'C:\\Users\\m169161\\Downloads\\NOTAS FISCAIS HEXIS MAIO 2025\\NFS-0059554.pdf',
'C:\\Users\\m169161\\Downloads\\NOTAS FISCAIS HEXIS MAIO 2025\\NFS-0059555.pdf',
'C:\\Users\\m169161\\Downloads\\NOTAS FISCAIS HEXIS MAIO 2025\\NFS-0059556.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS CONCLUIDAS\\2024\\OS HEXIS 2024\\OS 05 2024\\CIDADES DIVERSAS 3\\DOCUMENTOS DIVERSOS\\NF0982491.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS CONCLUIDAS\\2024\\OS HEXIS 2024\\OS 05 2024\\CIDADES DIVERSAS 3\\DOCUMENTOS DIVERSOS\\NFS-0057868.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\NOTAS FISCAIS 05.02.2026\\NF1021973.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\NOTAS FISCAIS 05.02.2026\\NF1021975.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\NOTAS FISCAIS 05.02.2026\\NFS-0062956.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\NOTAS FISCAIS 05.02.2026\\NFS-0062957.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\NFs\\NF1010346.PDF',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\NFs\\NF1010348.PDF',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\NFs\\NF1010367.PDF',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\NFs\\NF1010371.PDF',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\NFs\\NF1010381.PDF',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\NFs\\NF1010387.PDF',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\NFs\\NF1010394.PDF',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\NFs\\NF1010397.PDF',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\NFs\\NF1010398.PDF',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\NFs\\NF1010401.PDF',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\NFs\\NF1011667.PDF',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\NFs\\NF1011670.PDF',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\NFs\\NF1011708.PDF',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\NFs\\NF1011926.PDF',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\NFs\\NF1013662.PDF',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\NFs\\NFS-0061257.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\NFs\\NFS-0061258.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\NFs\\NFS-0061259.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\NFs\\NFS-0061260.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\NFs\\NFS-0061261.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\NFs\\NFS-0061262.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\NFs\\NFS-0061264.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\NFs\\NFS-0061265.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\NFs\\NFS-0061266.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\NFs\\NFS-0061490.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\NFs\\NFS-0061491.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\NFs\\NFS-0061499.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\NFs\\NFS-0061529.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\NFs\\NFS-0061768.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\VARJÃO PG COM O CRÉDITO\\NF1017471.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 03 2025\\VARJÃO PG COM O CRÉDITO\\NFS-0062392.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 04 2025\\CIDADES DIVERSAS 2\\notas fiscais hexis 07-05-2026\\NF1030577.PDF',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 04 2025\\CIDADES DIVERSAS 2\\notas fiscais hexis 07-05-2026\\NF1030579.PDF',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 04 2025\\CIDADES DIVERSAS 2\\notas fiscais hexis 07-05-2026\\NF1030580.PDF',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 04 2025\\CIDADES DIVERSAS 2\\notas fiscais hexis 07-05-2026\\NF1030581.PDF',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 04 2025\\CIDADES DIVERSAS 2\\notas fiscais hexis 07-05-2026\\NFS-0063998.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 04 2025\\CIDADES DIVERSAS 2\\notas fiscais hexis 07-05-2026\\NFS-0063999.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 04 2025\\CIDADES DIVERSAS 2\\notas fiscais hexis 07-05-2026\\NFS-0064000.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 04 2025\\CIDADES DIVERSAS 2\\notas fiscais hexis 07-05-2026\\NFS-0064001.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 04 2025\\DAVINÓPOLIS PG COM CRÉDITO\\NF1017485.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 04 2025\\DAVINÓPOLIS PG COM CRÉDITO\\NFS-0062398.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 04 2025\\ITAPIRAPUÃ\\NFS-0062663.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 04 2025\\NOTAS FISCAIS 12.2025\\NF1016947.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 04 2025\\NOTAS FISCAIS 12.2025\\NFS-0062313.pdf',
'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025\\OS 04 2025\\SÃO L. DOS MONTES BELOS\\NF1031738.PDF.pdf'

];

const folder = 'C:\\Users\\m169161\\Desktop\\CONTRATOS\\PGF\\HEXIS\\NOTAS';

async function copyFiles() {
  const arquivosCopiados = [];
  const arquivosNaoCopiados = [];

  try {
    // Cria a pasta de destino, caso ela ainda não exista
    await fs.promises.mkdir(folder, { recursive: true });

    for (const file of files) {
      const fileName = path.basename(file);
      const destinationFile = path.join(folder, fileName);

      try {
        // Verifica se o arquivo de origem existe
        await fs.promises.access(file);

        // Copia o arquivo SEM sobrescrever se já existir no destino
        await fs.promises.copyFile(
          file,
          destinationFile,
          fs.constants.COPYFILE_EXCL
        );

        arquivosCopiados.push({
          origem: file,
          destino: destinationFile,
          nome: fileName
        });

        console.log(`Copiado com sucesso: ${fileName}`);

      } catch (error) {
        let motivo = '';

        if (error.code === 'EEXIST') {
          motivo = 'Já existe um arquivo com o mesmo nome no destino. Não foi sobrescrito.';
        } else if (error.code === 'ENOENT') {
          motivo = 'Arquivo de origem não encontrado.';
        } else if (error.code === 'EACCES' || error.code === 'EPERM') {
          motivo = 'Sem permissão para acessar ou copiar o arquivo.';
        } else {
          motivo = error.message;
        }

        arquivosNaoCopiados.push({
          origem: file,
          destino: destinationFile,
          nome: fileName,
          motivo: motivo,
          codigoErro: error.code || 'SEM_CODIGO'
        });

        console.log(`Não copiado: ${fileName}`);
        console.log(`Motivo: ${motivo}`);
      }
    }

    // Monta relatório final
    let relatorio = '';

    relatorio += 'RELATÓRIO DE CÓPIA DE ARQUIVOS\n';
    relatorio += '================================\n\n';

    relatorio += `Pasta de destino:\n${folder}\n\n`;

    relatorio += `Total de arquivos informados: ${files.length}\n`;
    relatorio += `Total copiados com sucesso: ${arquivosCopiados.length}\n`;
    relatorio += `Total não copiados: ${arquivosNaoCopiados.length}\n\n`;

    relatorio += 'ARQUIVOS COPIADOS COM SUCESSO\n';
    relatorio += '-----------------------------\n';

    if (arquivosCopiados.length === 0) {
      relatorio += 'Nenhum arquivo foi copiado.\n';
    } else {
      arquivosCopiados.forEach((item, index) => {
        relatorio += `${index + 1}. ${item.nome}\n`;
        relatorio += `   Origem: ${item.origem}\n`;
        relatorio += `   Destino: ${item.destino}\n\n`;
      });
    }

    relatorio += '\nARQUIVOS NÃO COPIADOS\n';
    relatorio += '---------------------\n';

    if (arquivosNaoCopiados.length === 0) {
      relatorio += 'Todos os arquivos foram copiados com sucesso.\n';
    } else {
      arquivosNaoCopiados.forEach((item, index) => {
        relatorio += `${index + 1}. ${item.nome}\n`;
        relatorio += `   Origem: ${item.origem}\n`;
        relatorio += `   Destino: ${item.destino}\n`;
        relatorio += `   Motivo: ${item.motivo}\n`;
        relatorio += `   Código do erro: ${item.codigoErro}\n\n`;
      });
    }

    // Exibe relatório no console
    console.log('\n' + relatorio);

    // Salva relatório em arquivo TXT na mesma pasta onde o script foi executado
    await fs.promises.writeFile('relatorio_copia.txt', relatorio, 'utf8');

    console.log('Relatório gerado: relatorio_copia.txt');

  } catch (error) {
    console.error('Erro geral no processo:');
    console.error(error.message);
  }
}

copyFiles();