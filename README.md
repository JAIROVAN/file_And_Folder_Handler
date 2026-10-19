# File and Folder Handler

Projeto Node.js para listar, copiar, renomear e ler arquivos/PDFs no Windows com uma camada interna reutilizavel em `src/lib`.

Os scripts antigos da raiz foram substituidos pelas versoes refatoradas em `src/apps`. As listas operacionais que estavam embutidas neles foram migradas para `src/data`.

## Estrutura

```txt
src/
  apps/
    copiarArquivos.js
    excluirArquivos.js
    lerPdf.js
    lerNotasFiscaisPdf.js
    listarArquivos.js
    moverArquivos.js
    renomearArquivos.js
  config/
    paths.js
  data/
    arquivosParaCopiar.js
    arquivosParaExcluir.js
    arquivosParaMover.js
    arquivosParaRenomear.js
  lib/
    fileOps.js
    fileScanner.js
    logger.js
    nfeExtractor.js
    pathUtils.js
    pdfUtils.js
    reportUtils.js
  package.json
```

## Modulos internos

- `pathUtils.js`: normaliza caminhos, verifica existencia, identifica arquivo/pasta, monta destinos e cria nomes seguros para Windows.
- `fileScanner.js`: lista arquivos com ou sem subpastas, filtra extensoes e ignora pastas como `node_modules`, `docsTxt` e `.git`.
- `fileOps.js`: copia, renomeia, move e exclui arquivos com validacoes, sem sobrescrever por padrao, com suporte a `dryRun`.
- `pdfUtils.js`: le texto de PDFs e processa todos os PDFs de uma pasta.
- `planilhaReader.js`: le todas as abas de `.xlsx` (via `myExcel.js` do projeto `xlsx_Handler`, locais procurados em `XLSX_HANDLER_CANDIDATES`) e `.xls`/`.ods` (via SheetJS, copiado em `src/vendor/sheetjs` para nao depender de `npm install`), com datas em `dd/mm/aaaa` e formulas pelo valor calculado.
- `nfeExtractor.js`: extrai dados especificos de notas fiscais a partir do texto ja lido do PDF.
- `reportUtils.js`: salva relatorios em JSON, CSV e TXT e formata relatorios de operacao.
- `logger.js`: centraliza logs simples, erros, tabelas e resumo final.
- `src/data`: guarda listas operacionais migradas dos scripts antigos.

## Seguranca

- Copia usa `COPYFILE_EXCL` quando `overwrite` esta `false`.
- Renomeacao verifica se a origem existe e se o destino ja existe antes de alterar.
- `dryRun` vem ligado por padrao nos apps de copia, renomeacao, movimentacao e exclusao.
- Movimentacao preserva o nome do arquivo, cria a pasta de destino se necessario e nao sobrescreve por padrao.
- Exclusao so remove arquivos, nunca pastas, e exige `confirmDelete: "EXCLUIR_ARQUIVOS"` quando `dryRun` estiver `false`.
- Nomes de arquivos passam por limpeza de caracteres invalidos no Windows.
- Extensoes sao preservadas quando o novo nome nao informa extensao.
- A funcao de exclusao e intencionalmente separada, explicita e protegida.

## Configuracao rapida

Edite as constantes no inicio de cada arquivo em `src/apps`.

Para caminhos padrao compartilhados, edite:

```txt
src/config/paths.js
```

## Como rodar

```bash
npm run listar
npm run copiar
npm run renomear
npm run mover
npm run excluir
npm run ler-pdf
npm run ler-notas
npm run ler-planilhas -- "C:\pasta\com\planilhas"
```

### Ler planilhas (`ler-planilhas`)

Varre a pasta informada e todas as subpastas, le todos os `.xls`/`.xlsx`/`.ods` (ignora temporarios `~$`) e gera um JSON em `reports/` chamado `result_<nome da pasta>.json`:

```json
[
  ["C:\\pasta\\sub\\vendas.xlsx", "vendas.xlsx", "Aba1", "valor A1", "valor B1"],
  ...
]
```

Cada linha com conteudo de cada aba vira uma linha do array (linhas totalmente vazias sao descartadas). Cada execucao cria um arquivo novo e nunca sobrescreve: se `result_<pasta>.json` ja existir, cria `result_<pasta>_2.json`, `_3`... Um segundo argumento opcional define outra pasta de saida. Requer o projeto `xlsx_Handler` (com `exceljs` instalado) ao lado deste projeto.

### Gerar planilha a partir dos JSON (`gerarPlanilhaAtravesDeArraysJsons.js`)

Junta todos os `.json` gerados pelo `lerPlanilhas.js` que estao diretamente na pasta informada (sem subpastas) e cria `planilha_<nome da pasta>.xlsx` nessa mesma pasta, com todas as linhas numa unica aba, sem cabecalho e mantendo linhas repetidas. Acima de 1.048.576 linhas continua na aba `Dados 2`. Nunca sobrescreve (cria `planilha_<pasta> (1).xlsx`). Um segundo argumento opcional define outra pasta de saida.

```bash
node src\apps\gerarPlanilhaAtravesDeArraysJsons.js "C:\pasta\com\os\jsons"
```
