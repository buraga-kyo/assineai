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

## Antes de abrir um PR

Rode na raiz:

```bash
pnpm verificar
```

É a soma de `pnpm typecheck`, `pnpm lint`, `pnpm test` e `pnpm audit --prod`. Para conferir o formato, `pnpm format:check`; para arrumar, `pnpm format`. O mesmo `verificar` roda no GitHub em todo PR e em todo push na main, junto com uma busca por segredo no código e por dependência com falha conhecida. O resultado é aviso: fica vermelho no PR, mas não trava o merge.

## Licença

Uso interno permitido para qualquer empresa ou pessoa: você pode rodar, modificar e usar o AssineAi para assinar **os próprios documentos da sua organização**, com os seus próprios certificados.

**Proibido**: vender, revender, oferecer como SaaS/API/white-label, ou cobrar (de qualquer forma) para assinar documentos de terceiros. Quem quiser fazer isso precisa de licença comercial separada.

Detalhes em [LICENSE](./LICENSE). Não é uma licença open source no sentido OSI (é *source-available*).
