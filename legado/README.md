# legado

Código da geração anterior do AssineAi, guardado só para leitura. Não é base de
trabalho: quando a base nova provar que cobre o mesmo caminho, esta pasta some do
trunk. O estado exato de antes da mudança está na tag `legado-v0`
(`git show legado-v0:Iniciar.js`). Os caminhos abaixo são relativos a esta pasta.

## Três gerações empilhadas

O código em `ModuloRaiz/RegrasDeNegocio/` carrega três fases do produto, uma por
cima da outra, sem apagar a anterior; o prefixo do arquivo diz a fase.

1. GCR (`GCR_*`): assina sem tocar no banco; relatório desenhado com pdf-lib.
2. GCA (`GCA_*`): ainda sem banco; relatório refeito com pdfkit.
3. AssineAi (`AssineAi_*`): a atual, evolução do GCA ligada ao banco. Só ela casa
   com o esquema em `ModuloRaiz/BancoDeDados/Tabelas` (Assinatura,
   AssinaturaDocumentos, AssinaturaSignatarios, SignatarioHistorico, Empresa).

## O que estava vivo

Rotas de `ModuloRaiz/RegrasDeNegocio/Procedimentos/LidarComRotasDaAPI.js`:

- POST /CriarAssinaturaViaAPI (recebe os PDFs por multipart)
- POST /AssineAi_AssinarDocumentoViaAPI
- POST /ValidarToken
- POST /EnviarToken (responde true, mas o envio está comentado; não envia nada)
- POST /ListarTodasAssinaturas, GET /ListarDetalheAssinatura, GET /ListarDetalhesDoSignatario
- login e registro da Empresa, em caminhos ofuscados no começo do arquivo
- GET /PegarTemaTelaAssinatura e POST /AtualizarTemaTelaAssinatura
- POST /GCA_AssinarDocumentoViaAPI e POST /GCR_AssinarDocumentoViaAPI (legado, funcionam sem banco)

## O que estava morto

Os 14 handlers de `Procedimentos/` que pedem ao Conector as tabelas de um esquema
anterior (Documento, Signatario, Arquivo, DocumentoExtra): CriarDocumentoViaAPI,
AssinarDocumentoViaAPI, ListarTodosDocumentos, os Recuperar*, etc. O Conector não
expõe nenhuma delas; toda chamada quebra. O que ninguém importava (PDFSign.js,
AssinarPDF.js, cópias "Backup", sobras de editor) foi apagado e só existe na tag.

## O que vale como referência

- Receita do JSignPdf: `ModuloRaiz/RegrasDeNegocio/Ferramentas/LidarComAssinatura/CertificadoDigital.js`, linhas 9 a 71.
- Desenho do relatório: `ModuloRaiz/RegrasDeNegocio/Ferramentas/ManipulacaoDePDF/AssineAi_ConstruirPaginaComDadosDeAssinatura.js`.
- Esquema do banco: `ModuloRaiz/BancoDeDados/Tabelas/`.

## Como rodar o velho

`node Iniciar.js` nesta pasta, com um `.env` aqui e uma cópia de `Arquivos/Permanente`
ao lado (JSignPdf.jar e cert.pfx; hoje ela mora na raiz do repositório). Nunca use
`ModuloDoServidor/Iniciar.js`: ele sobe com `sync({ force: true })` e apaga o banco a cada boot. 
