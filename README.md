# AssineAi

Assinatura eletrônica de documentos para quem vende serviço: advogados, clínicas, nutricionistas, psicólogos, associações, artistas e produtores rurais.

## O que muda

- O cliente assina dentro do chat, no Telegram, no WhatsApp ou no Slack: responde ACEITO e o código de 6 dígitos que recebeu, sem abrir navegador.
- O PDF final sai com a marca do cliente, não a nossa.
- Todo documento recebe o selo digital ICP-Brasil da plataforma e uma prova de tempo, que mostra quando foi assinado.
- Modelos de documento prontos por profissão.
- Kit para músicos, com prova de anterioridade: fica registrado que a música já existia naquela data.

## Estado do projeto

O AssineAi está sendo reescrito do zero, num monorepo: um repositório só para a API, o app web e os pacotes que eles compartilham. O código antigo continua em `legado/`, só para consulta.

- Já roda: a infra de desenvolvimento (banco, filas, arquivos e caixa de email de teste, tudo em Docker) e a verificação de tipos, lint e teste em todos os pacotes.
- Em construção: a API e o pacote de assinatura, que sela os PDFs.
- Ainda não existe: login, envelopes (o conjunto de documentos que vai para assinatura), canais de envio e o app web. O primeiro login chega com a API.

## Como subir em desenvolvimento

Você precisa de:

- Node 22 (a versão está em `.nvmrc`)
- pnpm 9.15: rode `corepack enable` e, na primeira chamada de `pnpm`, o Node baixa a versão que o `package.json` pede
- Docker com o plugin compose
- Java 21, só para selar PDF com o JSignPdf; hoje nada chama o Java, porque o pacote de assinatura está em construção

Na raiz do repositório:

1. Instale as dependências:

   ```bash
   pnpm install
   ```

2. Suba a infra: Postgres 18 com PostGIS, Redis, MinIO (guarda os arquivos, já com o bucket `assineai` criado) e Mailpit (caixa de email de teste). O comando espera cada serviço ficar saudável, mostra o estado de cada um e termina com esta linha:

   ```bash
   pnpm infra:up
   ```

   ```
   Mailpit: http://localhost:8025   Console do MinIO: http://localhost:9001
   ```

3. Copie as variáveis de ambiente. O `.env.example` explica cada uma e já vem com os valores da infra de desenvolvimento; o `.env` fica fora do git:

   ```bash
   cp .env.example .env
   ```

4. Confira que está tudo certo:

   ```bash
   pnpm verificar
   ```

5. Todo email mandado em desenvolvimento cai no Mailpit, em http://localhost:8025. Os arquivos ficam no MinIO; o console em http://localhost:9001 abre com o usuário `assineai` e a senha `assineai-dev-segredo`.

6. Para derrubar a infra (os dados ficam guardados):

   ```bash
   pnpm infra:down
   ```

Por enquanto não há servidor para subir: `pnpm dev` não faz nada até a API chegar. Portas, usuários e como zerar o banco estão em `infra/README.md`.

## Certificados e Selagem Digital

O pacote `@assineai/assinatura` utiliza o **JSignPdf 2.2.0** para selar digitalmente os PDFs de forma robusta e segura.

### Instalação do JSignPdf.jar
Por motivos de higiene de repositório, o binário do JSignPdf.jar de 19MB não é versionado. Após clonar ou atualizar o repositório, você deve baixar o binário de forma segura rodando o script:

```bash
bash infra/baixar-jsignpdf.sh
```

Este script baixa a versão estável, valida seu hash SHA-256 e instala o JAR em `Arquivos/Permanente/JSignPdf.jar`.

### Certificados Digitais em Produção
Em produção, os certificados A1 (`.pfx` ou `.p12`) nunca devem residir no repositório.
- **Localização recomendada:** Devem ficar montados em um volume Docker somente leitura em `/cofre`.
- **Configuração:** O caminho e a senha do certificado ativo de produção são configurados por meio de variáveis de ambiente seguras (por exemplo, `CERTIFICADO_ARQUIVO_CAMINHO` e `CERTIFICADO_SENHA`), que apontam para o arquivo montado no volume `/cofre`.

## Antes de abrir um PR

Rode na raiz:

```bash
pnpm verificar
```

É a soma de `pnpm typecheck`, `pnpm lint`, `pnpm test` e `pnpm audit --prod`. Para conferir o formato, `pnpm format:check`; para arrumar, `pnpm format`. O mesmo `verificar` roda no GitHub em todo PR e em todo push na main, junto com uma busca por segredo no código e por dependência com falha conhecida. O resultado é aviso: fica vermelho no PR, mas não trava o merge.

## Mapa do repositório

| Pasta                 | O que mora ali                                                                          |
| --------------------- | --------------------------------------------------------------------------------------- |
| `apps/api`            | a API: o servidor e o worker que processa as filas; em construção                       |
| `apps/web`            | o app web; ainda vazio                                                                  |
| `packages/ui`         | componentes de tela compartilhados; ainda vazio                                         |
| `packages/assinatura` | o selo digital dos PDFs, com o JSignPdf em Java; em construção                          |
| `packages/modelos`    | os modelos de documento por profissão; ainda vazio                                      |
| `packages/config`     | tsconfig, eslint e prettier que todos os pacotes usam                                   |
| `infra/`              | o docker compose e o script da infra de desenvolvimento (`infra/README.md`)             |
| `design/`             | as três direções visuais em HTML, para escolher pelo olho (`design/direcoes/README.md`) |
| `legado/`             | o código antigo, congelado; a tag `legado-v0` marca como estava antes da reescrita      |
| `Arquivos/`           | JSignPdf.jar e outros arquivos fixos que o código antigo usava                          |
| `.github/`            | o fluxo que roda a verificação em todo PR                                               |

## Licença

Uso interno permitido para qualquer empresa ou pessoa: você pode rodar, modificar e usar o AssineAi para assinar **os próprios documentos da sua organização**, com os seus próprios certificados.

**Proibido**: vender, revender, oferecer como serviço a terceiros (SaaS, API ou com a marca de outra empresa) ou cobrar, de qualquer forma, para assinar documentos de terceiros. Quem quiser fazer isso precisa de uma licença comercial separada.

O código fica aberto para ler e usar dentro de casa, mas não é open source: a licença é do tipo _source-available_. Detalhes em [LICENSE](./LICENSE).
