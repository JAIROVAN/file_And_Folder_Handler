# Dados de entrada

Esta pasta guarda listas operacionais que antes estavam dentro dos scripts antigos da raiz.

- `arquivosParaCopiar.js`: pares `[caminhoArquivo, pastaDestino]` usados pelo app `src/apps/copiarArquivos.js`.
- `arquivosParaRenomear.js`: pares `[caminhoAtual, novoNome]` usados pelo app `src/apps/renomearArquivos.js`.
- `arquivosParaMover.js`: pares `[caminhoArquivo, pastaDestino]` usados pelo app `src/apps/moverArquivos.js`.
- `arquivosParaExcluir.js`: caminhos usados pelo app `src/apps/excluirArquivos.js`.

Os apps de copia, renomeacao, movimentacao e exclusao continuam com `dryRun: true` por padrao.
