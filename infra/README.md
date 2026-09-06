# Infra de desenvolvimento

O que a base nova precisa na sua máquina: Postgres 18 com PostGIS, Redis 7, MinIO
(S3 local) com o bucket `assineai` já criado e Mailpit (caixa de email de teste).
A Evolution (WhatsApp) entra na issue do canal WhatsApp.

## Subir

    bash infra/dev.sh up

Sobe os quatro serviços, espera cada um ficar saudável, cria o bucket e mostra o
`ps`. Os scripts `pnpm infra:up` e `pnpm infra:down` chegam com o monorepo (issue
#38) e chamam este script; ele também tem `ps` e `logs`. Copie `.env.example` para `.env`: os valores casam.

## Portas

| Serviço  | Porta                      | Para que         |
|----------|----------------------------|------------------|
| Postgres | 5432                       | banco `assineai` |
| Redis    | 6379                       | filas            |
| MinIO    | 9000 (API), 9001 (console) | arquivos         |
| Mailpit  | 8025 (web), 1025 (SMTP)    | email de teste   |

## Usuários de desenvolvimento

| Onde                                    | Usuário           | Senha                |
|-----------------------------------------|-------------------|----------------------|
| Postgres, aplicação (sem bypass de RLS) | assineai_app      | app_dev              |
| Postgres, migrations (dona do banco)    | assineai_migracao | migracao_dev         |
| Postgres, superusuário                  | postgres          | postgres             |
| MinIO (API e console)                   | assineai          | assineai-dev-segredo |

As roles nascem no primeiro boot do volume (`postgres-init/01-roles.sql`); mudou
o SQL, derrube com `--volumes` e suba de novo. Em produção as senhas vêm de
secrets, nunca destes arquivos.

## Derrubar

    bash infra/dev.sh down            # para e remove os containers, guarda os dados
    bash infra/dev.sh down --volumes  # apaga também banco e arquivos
