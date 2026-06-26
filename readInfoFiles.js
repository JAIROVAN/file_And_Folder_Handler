 /*  COLOQUE AQUI O SEU DIRETÓRIO */
   const directoryPath = 'C:\\Users\\m169161\\Desktop\\CONTRATOS\\PGF\\HEXIS\\NOTAS'
   // 'C:\\Users\\m169161\\Desktop\\CONTRATOS'
   //'C:\\Users\\m169161\\Downloads';
   //'C:\\Users\\m169161\\Desktop\\CONTRATOS\\HEXIS\\NOTAS - PASTA ASPLA'
   //'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS HEXIS 2025';
   //'H:\\ASPLA DOCUMENTOS DE CONTRATOS\\OS CONCLUIDAS'
   // 'G:\\ASPLA DOCUMENTOS DE CONTRATOS' ; //  'C:\\Users\\m169161\\Downloads';
   
const fs = require('fs');
const path = require('path');
const nameDocReturnTxt = "listaPdfNotasPGF-Hexis";
function formatDate(date) {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

async function getFilesMetadata(dir) {
    let result = [];
    
    async function readDir(currentPath) {
        const files = await fs.promises.readdir(currentPath, { withFileTypes: true });
        
        for (const file of files) {
            const filePath = path.join(currentPath, file.name);
            
            if (file.isDirectory()) {
                await readDir(filePath);
            } else {
                const stats = await fs.promises.stat(filePath);
                const fileType = path.extname(file.name) || 'unknown';
                result.push([
                    file.name,  // Nome do arquivo
                    currentPath,  // Caminho da pasta onde o arquivo está localizado
                    filePath,  // Caminho completo do arquivo
                    fileType,  // Extensão do arquivo
                    stats.size,  // Tamanho do arquivo em bytes
                    formatDate(stats.birthtime),  // Data de criação formatada
                    formatDate(stats.mtime)  // Última modificação formatada
                ]);
            }
        }
    }
    
    await readDir(dir);
    return result;
}

(async () => {
   
    try {
        const metadataArray = await getFilesMetadata(directoryPath);
        
        // Adicionar cabeçalho
        const header = ['Nome do Arquivo', 'Caminho da Pasta', 'Caminho Completo', 'Extensão', 'Tamanho (bytes)', 'Data de Criação', 'Última Modificação'];
        const fileContent = [header, ...metadataArray].map(row => row.join('\t')).join('\n');
        
        fs.writeFileSync(nameDocReturnTxt+'.txt', fileContent, 'utf8');
        
        console.log('Arquivo metadata.txt gerado com sucesso!');
    } catch (error) {
        console.error('Erro ao ler arquivos:', error);
    }
})();
