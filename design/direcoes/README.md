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

## Comparação

Contraste calculado por `node design/direcoes/contraste.mjs` (razão WCAG 2 a partir dos tokens; texto precisa de 4.5:1, botão e chip de 3:1):

| Par | Roça Neon | Palco | Papel Timbrado |
| --- | --- | --- | --- |
| texto / fundo | 15.5:1 ok | 17.5:1 ok | 14.1:1 ok |
| texto / superfície | 12.7:1 ok | 16.0:1 ok | 15.7:1 ok |
| texto suave / superfície | 7.2:1 ok | 8.1:1 ok | 5.9:1 ok |
| texto sobre a primária | 14.3:1 ok | 5.9:1 ok | 14.1:1 ok |
| primária / fundo (botão) | 14.3:1 ok | 5.8:1 ok | 14.1:1 ok |
| texto sobre o acento | 6.5:1 ok | 4.9:1 ok | 7.2:1 ok |
| pior estado / superfície | 6.0:1 ok (recusado) | 6.0:1 ok (expirado) | 4.8:1 ok (expirado) |
| tema do cliente: branco sobre #0B5D3B | 7.9:1 ok | 7.9:1 ok | 7.9:1 ok |

Legibilidade no celular (390px). Os tamanhos são os mesmos nas três, porque a estrutura é a mesma; o que muda é a fonte:

| | Roça Neon | Palco | Papel Timbrado |
|---|---|---|---|
| menor texto da interface | 11px, Inter (rótulos da barra e do canal); a prévia do PDF usa 9px de propósito, é miniatura com o botão "Ver o PDF completo" | 11px, Manrope | 11px, Source Sans 3 |
| corpo e cartões | 15px e 13px, Inter | 15px e 13px, Manrope | 15px e 13px, Source Sans 3 |
| alvo de toque | botões 44px, teclas 48px, casas do código 52px | igual | igual |
| título no celular | caixa alta pesada, ocupa mais largura, quebra em 2 linhas | Unbounded larga, quebra em 2 linhas mais cedo | serifa itálica, mais leve, quebra em 2 linhas |
| carimbo no PDF | folha de 640px no computador: texto de 9px e código de 8px; no celular a folha inteira cabe na tela (366px) e o texto fica como em qualquer PDF sem zoom | igual | igual |

Como o carimbo convive com o tema de um cliente:
- Roça Neon: moldura grossa e reta na cor do cliente, logo do cliente em bloco cheio; o selo verde-limão do AssineAi, levemente torto, chama atenção dentro do documento dele.
- Palco: cantos redondos, logo do cliente em círculo e faixa do relatório com degradê da cor dele; o selo magenta é pequeno, mas é a única cor fora da paleta do cliente na folha.
- Papel Timbrado: fio duplo fino, logo do cliente só em contorno, faixa sem preenchimento; o selo azul-marinho parece parte do papel timbrado do cliente e quase some.

## Próximo passo

Abrir os 18 PNG, escolher uma direção pelo olho e registrar os valores de token no DESIGN-SYSTEM.md (seção 3). Nenhum componente antes dessa escolha.
