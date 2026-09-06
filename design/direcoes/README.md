# Três direções visuais do AssineAi

Três jeitos de o produto se vestir, antes de qualquer cor ou fonte virar código. Cada direção tem um CSS de tokens (cor, fonte, forma) e três telas em HTML puro, sem JavaScript e sem build. `base.css` é a estrutura comum das telas; o visual vem do CSS de cada direção.

| Direção | Ideia | Fontes (Google Fonts, licença OFL) | Arquivos |
|---|---|---|---|
| Roça Neon | AGRO com atitude: verde escuro e terra, acento verde-limão, cantos retos, borda grossa e sombra dura | Archivo Black + Inter | `roca-neon.css`, `roca-neon-*.html` |
| Palco | POP e música: grafite, magenta e roxo vivo, branco quente, pílulas e brilho | Unbounded + Manrope | `palco.css`, `palco-*.html` |
| Papel Timbrado | TECH sóbrio com calor de papel: off-white, tinta azul-marinho, âmbar só no sublinhado, serifa nos títulos, fios finos | Fraunces + Source Sans 3 | `papel-timbrado.css`, `papel-timbrado-*.html` |

As três telas de cada direção (dados sempre fictícios):
- `*-envelopes.html`: o app com barra lateral, busca, nome da empresa e a lista de envelopes (estado com cor por função, quem assina e por qual canal, prazo, botão "Mandar para assinar").
- `*-signatario.html`: a página pública que a pessoa abre no celular, com o tema de um cliente fictício (Clínica Sol, verde #0B5D3B, fonte Inter) por cima da nossa base: prévia do PDF, código de 6 dígitos, Assinar e Recusar, rodapé "Assinado com AssineAi". O tema do cliente entra como variáveis `--cliente*` no `style` do body, do mesmo jeito que o `tema.definicao` do produto.
- `*-carimbo.html`: a folha A4 do contrato com o carimbo do AssineAi no rodapé (logo do cliente, quem assinou, por onde e quando, código público, SHA-256, QR) e a faixa do relatório de assinaturas.

## Como gerar os PNG

Precisa do Google Chrome e de internet: as fontes vêm do Google Fonts; sem rede o Chrome usa a fonte do sistema. Os PNG não entram no git (o `.gitignore` já barra `*.png`). São 18 imagens: 3 direções x 3 telas x 2 tamanhos (computador 1440x1000 e celular 390x844). Se o Chrome reclamar de sandbox, acrescente `--no-sandbox`.

```bash
mkdir -p /tmp/direcoes
for d in roca-neon palco papel-timbrado; do for t in envelopes signatario carimbo; do
  google-chrome --headless=new --disable-gpu --hide-scrollbars --window-size=1440,1000 --screenshot=/tmp/direcoes/$d-$t-desktop.png "file://$PWD/design/direcoes/$d-$t.html"
  google-chrome --headless=new --disable-gpu --hide-scrollbars --window-size=390,844 --screenshot=/tmp/direcoes/$d-$t-celular.png "file://$PWD/design/direcoes/$d-$t.html"
done; done
```
