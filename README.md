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

Varre a pasta informada e todas as subpastas, le todos os `.xls`/`.xlsx`/`.ods` (ignora temporarios `~$`) e gera `reports/result.js` com:

```js
const dados = [
  ["C:\\pasta\\sub\\vendas.xlsx", "vendas.xlsx", "Aba1", "valor A1", "valor B1"],
  ...
];
```

Cada linha de cada aba vira uma linha do array (inclusive linhas vazias entre os dados). Um segundo argumento opcional define outro caminho de saida. Requer `npm install` tambem no projeto `xlsx_Handler`.

Tambem e possivel rodar direto:

```bash
node src/apps/listarArquivos.js
node src/apps/copiarArquivos.js
node src/apps/renomearArquivos.js
node src/apps/moverArquivos.js
node src/apps/excluirArquivos.js
node src/apps/lerPdf.js
node src/apps/lerNotasFiscaisPdf.js
```

## Exemplos de uso

### Listar arquivos

No arquivo `src/apps/listarArquivos.js`, ajuste:

```js
const CONFIG = {
  rootFolder: DEFAULT_NOTAS_FOLDER,
  recursive: true,
  extensions: []
};
```

Use `extensions: [".pdf"]` para listar apenas PDFs.

### Copiar arquivos

No arquivo `src/data/arquivosParaCopiar.js`, ajuste a lista bidimensional:

```js
export const arquivosParaCopiar = [
  [String.raw`C:\origem\arquivo.pdf`, String.raw`C:\destino`]
];
```

O primeiro item e o caminho completo do arquivo. O segundo item e a pasta de destino.

Mantenha `dryRun: true` para simular. Depois de revisar o relatorio, altere para `false` para executar.

### Renomear arquivos

No arquivo `src/data/arquivosParaRenomear.js`, ajuste a lista:

```js
export const arquivosParaRenomear = [
  [String.raw`C:\pasta\NF0986298.pdf`, "986298"]
];
```

Se o novo nome nao tiver extensao, a extensao original sera preservada.

### Mover arquivos

No arquivo `src/data/arquivosParaMover.js`, ajuste a lista bidimensional:

```js
export const arquivosParaMover = [
  [String.raw`C:\pasta-origem\arquivo.pdf`, String.raw`C:\pasta-destino`]
];
```

O primeiro item e o caminho completo do arquivo. O segundo item e a pasta de destino.

No app `src/apps/moverArquivos.js`, o padrao e:

```js
const CONFIG = {
  dryRun: true,
  overwrite: false
};
```

Com `dryRun: true`, o app apenas simula. Para mover de verdade, revise o relatorio primeiro e depois altere para:

```js
const CONFIG = {
  dryRun: false,
  overwrite: false
};
```

O nome do arquivo e preservado no destino. Se ja existir arquivo com o mesmo nome no destino, ele registra como ignorado e nao sobrescreve.

### Excluir arquivos

No arquivo `src/data/arquivosParaExcluir.js`, ajuste a lista:

```js
export const arquivosParaExcluir = [
  String.raw`C:\pasta\arquivo-para-excluir.pdf`
];
```

No app `src/apps/excluirArquivos.js`, o padrao e:

```js
const CONFIG = {
  dryRun: true,
  confirmDelete: ""
};
```

Com `dryRun: true`, o app apenas simula. Para excluir de verdade, revise o relatorio primeiro e depois altere os dois campos:

```js
const CONFIG = {
  dryRun: false,
  confirmDelete: "EXCLUIR_ARQUIVOS"
};
```

O app exclui somente arquivos. Se um path apontar para uma pasta, ele registra erro e nao remove nada.

### Ler um PDF unico

No arquivo `src/apps/lerPdf.js`, ajuste:

```js
const CONFIG = {
  pdfPath: path.join(DEFAULT_NOTAS_FOLDER, "1030580.PDF")
};
```

O texto extraido sai em `reports/texto_extraido_pdf.txt`.

### Ler notas fiscais em PDF

No arquivo `src/apps/lerNotasFiscaisPdf.js`, ajuste:

```js
const CONFIG = {
  pdfFolder: DEFAULT_NOTAS_FOLDER,
  recursive: false
};
```

O resultado sai em `reports/resumo_notas.json` e `reports/resumo_notas.csv`.

## Proximos passos sugeridos

- Mover as listas grandes de arquivos para JSON externo.
- Criar arquivos de configuracao por cliente/contrato.
- Adicionar testes automatizados para copia, renomeacao e extracao de notas.
- Criar um modo de linha de comando com parametros como `--dry-run`, `--origem` e `--destino`.
