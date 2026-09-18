# ATOMIC_DESIGN.md

> Documento normativo para agentes de codificação (Claude Code, Cursor, etc.) e humanos que criam ou modificam componentes neste repositório Next.js. Este arquivo define **regras determinísticas**. Se houver conflito entre este documento e a intuição do agente, este documento vence.

---

## 1. Propósito e como usar este documento

Este repositório aplica **Atomic Design** (Brad Frost, *Atomic Design*, 2016 — livro gratuito em https://atomicdesign.bradfrost.com) sobre um stack Next.js (App Router) + React Server Components + TypeScript + Tailwind CSS. O objetivo é fornecer um sistema de composição hierárquico, com **fronteiras claras** entre camadas, **regras de dependência unidirecionais** e **contratos previsíveis** para dados e interatividade.

**Regra de uso para o agente:**

1. Antes de criar ou modificar qualquer componente, execute a **árvore de decisão da §5** para classificá-lo (atom / molecule / organism / template / page).
2. Coloque o arquivo no diretório correto (§6).
3. Aplique as regras da camada correspondente (§7): dependências permitidas, diretiva `'use client'`, data-fetching, estilização.
4. Execute o **checklist da §11** antes de finalizar.
5. Se estiver em dúvida entre duas classificações, aplique os **critérios de desempate** da §5.4.

Este documento é **denso e prescritivo por design**. Não há prosa decorativa. Cada regra é acionável.

---

## 2. Resumo fiel da metodologia de Brad Frost

Atomic Design é uma metodologia — não um framework — para construir sistemas de design como hierarquias de componentes composicionais. Frost toma emprestada da química a ideia de que **átomos** se combinam em **moléculas**, moléculas em **organismos**, e assim por diante, para criar um vocabulário mental que descreve interfaces em múltiplos níveis de abstração simultaneamente.

As cinco etapas de Frost são: **atoms → molecules → organisms → templates → pages**. Elas não constituem um processo linear em cascata: Frost afirma explicitamente que as cinco etapas **operam concorrentemente** e que designers frequentemente começam pelo meio (organismos ou páginas) e trabalham em ambas as direções.

Dois conceitos centrais devem ser preservados neste projeto:

- **A relação parte-todo:** o sistema deve permitir enxergar simultaneamente as partes atômicas e o todo composto. Um componente nunca é apenas uma peça isolada; ele é sempre também um constituinte de composições maiores.
- **A distinção entre estrutura de conteúdo e conteúdo real:** *templates* articulam a **estrutura** de uma página (esqueleto, placeholders, hierarquia visual) sem se comprometer com conteúdo específico; *pages* são **instâncias** de templates preenchidas com conteúdo representativo real, e é nas pages que se testa a **resiliência do sistema** frente a variações de conteúdo (títulos longos, listas vazias, imagens ausentes, edge cases).

**Atribuição:** todas as definições, exemplos canônicos (search form como molécula, masthead como organismo) e princípios abaixo são derivados diretamente da obra de Brad Frost. Consulte https://atomicdesign.bradfrost.com/chapter-2/ para as definições originais.

---

## 3. As cinco etapas — definições precisas

### 3.1 Atoms (átomos)

**Definição (Frost):** blocos de construção fundamentais da interface. Correspondem a tags HTML básicas e não podem ser decompostos sem perder função. Incluem também abstrações irredutíveis como cores, tipografia, espaçamentos e animações.

**Critério canônico:** um átomo é **irreducível no contexto da UI**. Decompô-lo produziria algo que não é mais um componente UI (uma cor, um valor de fonte, uma tag HTML crua).

**Exemplos neste projeto:** `Button`, `Input`, `Label`, `Icon`, `Badge`, `Heading`, `Text`, `Avatar`, `Spinner`, `Link`, `Checkbox`, `Radio`, `Switch`.

**Papel:** compor o vocabulário visual base. Um átomo sozinho geralmente não é útil ao usuário final, mas define as restrições do sistema.

### 3.2 Molecules (moléculas)

**Definição (Frost):** grupos relativamente simples de átomos funcionando juntos como uma unidade. Uma molécula faz **uma coisa** e a faz bem.

**Exemplo canônico de Frost:** um formulário de busca composto por `Label` + `Input` + `Button`. Isoladamente esses átomos não fazem nada útil; juntos formam uma unidade com propósito único (buscar).

**Exemplos neste projeto:** `SearchField`, `FormField` (Label + Input + ErrorMessage), `MenuItem`, `PaginationControl`, `PriceTag`, `UserBadge` (Avatar + Text).

**Papel:** encapsular padrões pequenos e reutilizáveis; ponto onde a testabilidade e a consistência começam a se materializar.

### 3.3 Organisms (organismos)

**Definição (Frost):** componentes UI relativamente complexos, compostos por moléculas, átomos e/ou outros organismos. Formam **seções distintas** da interface.

**Exemplo canônico de Frost:** um masthead composto por logo (átomo), navegação primária (molécula), formulário de busca (molécula) e ícones sociais (molécula).

**Exemplos neste projeto:** `SiteHeader`, `SiteFooter`, `ProductCard`, `ProductGrid`, `CommentThread`, `CheckoutSummary`, `DashboardSidebar`.

**Papel:** unidades reconhecíveis e apontáveis da página. É a camada onde lógica de domínio começa a aparecer legitimamente.

### 3.4 Templates (templates de Frost)

**Definição (Frost):** objetos de nível de página que colocam componentes num layout e articulam a **estrutura de conteúdo** subjacente do design. Usam **conteúdo de placeholder** (lorem ipsum, caixas cinzas) para demonstrar o esqueleto sem comprometer com conteúdo real.

**Neste projeto:** um template é um **componente React puro-apresentacional** em `src/components/templates/` que compõe organismos num layout de página inteira, **recebe todos os dados via props** e não sabe nada sobre roteamento ou fetching.

> **⚠️ Colisão de nomenclatura com Next.js:** o arquivo `template.tsx` do App Router **não é** um template de Frost. É um layout que remonta a cada navegação (§9). Nunca confunda os dois. Templates de Frost vivem em `src/components/templates/*.tsx`.

### 3.5 Pages (páginas de Frost)

**Definição (Frost):** instâncias específicas de templates onde o conteúdo placeholder é substituído por **conteúdo representativo real**, dando uma visão fiel do que o usuário verá. Pages são o lugar onde se **testa a eficácia do sistema de design** frente a variações reais de conteúdo (nomes longos, títulos curtos, listas vazias, imagens faltando).

**Neste projeto:** uma page de Frost corresponde a um arquivo `app/**/page.tsx` do Next.js. É onde o data-fetching acontece; o resultado é passado como props para um template. A "page de Frost" é, portanto, um **papel conceitual**, não um arquivo separado — o próprio `page.tsx` do Next.js desempenha esse papel.

### 3.6 Princípios que devem ser preservados

- **Atomic design não é linear.** Você pode começar por qualquer camada. Se estiver criando uma feature nova, é aceitável esboçar o organismo primeiro e extrair átomos/moléculas depois.
- **Composição unidirecional.** Uma camada só pode importar de camadas iguais ou inferiores (§7.1).
- **Templates articulam estrutura; pages injetam conteúdo real.** Nunca coloque dados hardcoded ou fetching dentro de um template.
- **Pages testam resiliência.** Ao criar uma nova page, considere ativamente edge cases: dados vazios, longos, ausentes, extremos.

---

## 4. Stack técnico e mapeamento

| Conceito de Frost | Localização neste projeto | Tipo | Renderização padrão |
|---|---|---|---|
| **Atom** | `src/components/atoms/<Name>/` | Componente React | Server Component (a menos que use interatividade) |
| **Molecule** | `src/components/molecules/<Name>/` | Componente React | Server Component (a menos que use interatividade) |
| **Organism** | `src/components/organisms/<Name>/` | Componente React | Server Component preferencialmente; isolar interatividade em folhas Client |
| **Template (Frost)** | `src/components/templates/<Name>Template.tsx` | Componente React puro | Server Component; recebe todos os dados via props |
| **Page (Frost)** | `src/app/**/page.tsx` | Arquivo de rota Next.js | Async Server Component; realiza data-fetching |

**Não confundir com:**

- `src/app/**/layout.tsx` — casca persistente de UI (não é template de Frost). Usado para shells que sobrevivem à navegação (header/footer globais).
- `src/app/**/template.tsx` — variante rara de layout que remonta a cada navegação. **Não** é template de Frost. Usar apenas quando houver necessidade explícita de remontagem (animações de entrada, efeitos por navegação).

Referências oficiais: https://nextjs.org/docs/app/api-reference/file-conventions/layout · https://nextjs.org/docs/app/api-reference/file-conventions/template · https://nextjs.org/docs/app/api-reference/file-conventions/page

---

## 5. Árvore de decisão para classificação

Execute na ordem. Pare no primeiro `THEN` verdadeiro.

### 5.1 Passo 1 — É um arquivo de rota?

```
IF o componente é o export default de um arquivo em src/app/**/page.tsx
   THEN é uma PAGE (de Frost). PARE.

IF o componente é o export default de src/app/**/layout.tsx
   THEN é um LAYOUT do Next.js (não é template de Frost).
        Trate-o como um "shell" — geralmente compõe organismos globais
        (SiteHeader, SiteFooter) em torno de {children}. PARE.
```

### 5.2 Passo 2 — Tem função de layout de página inteira?

```
IF o componente representa a estrutura de uma página inteira
   AND compõe múltiplos organismos num layout coeso
   AND recebe TODOS os dados via props (nunca busca dados)
   AND não conhece rotas nem params
   THEN é um TEMPLATE (de Frost).
        Nome: <Coisa>Template (e.g., BlogPostTemplate, DashboardTemplate).
        Local: src/components/templates/. PARE.
```

### 5.3 Passo 3 — Átomo, molécula ou organismo?

```
IF o componente é irreducível na UI
   (representa uma única tag HTML semanticamente,
    ou uma primitiva visual como ícone, badge, spinner)
   AND não é composto de outros componentes deste projeto
   THEN é um ATOM. PARE.

IF o componente combina 2+ átomos
   AND cumpre exatamente UMA função bem definida
   AND não é uma seção autônoma da página
   AND não contém lógica de domínio significativa
   THEN é uma MOLECULE. PARE.

IF o componente é uma seção distinta e nomeável da interface
   (você pode apontar para ela e dizer "isso é o header/grade de produtos/thread de comentários")
   OR combina múltiplas moléculas
   OR contém lógica de domínio/negócio
   OR representa um cabeçalho/rodapé/sidebar/card composto
   THEN é um ORGANISM. PARE.
```

### 5.4 Critérios de desempate (para o cinturão cinza)

Quando dois níveis parecerem plausíveis, aplique **na ordem**:

1. **Regra do domínio:** se o componente contém conhecimento de domínio/negócio (formata preços com regras da aplicação, aplica lógica de permissão, referencia entidades do domínio como `Product`, `Order`, `User`), é **pelo menos um organismo**. Átomos e moléculas devem ser agnósticos de domínio.
2. **Regra da autonomia visual:** se o componente é uma "seção" que faz sentido isoladamente na página (o usuário reconheceria como uma unidade nomeada), é **organismo**. Se só faz sentido dentro de outro componente, é molécula.
3. **Regra da contagem de átomos:** ≤ 3 átomos com um propósito único → molécula. > 3 átomos ou múltiplas moléculas → organismo.
4. **Regra da reutilização:** se o componente é reutilizável em muitos contextos sem modificação → átomo/molécula. Se só faz sentido em um contexto específico → organismo.
5. **Regra do "não perca tempo":** Frost afirma explicitamente que a nomenclatura importa menos que a hierarquia e composição. Se após aplicar 1-4 ainda houver ambiguidade, escolha o nível **mais alto** dos dois candidatos (favorece organismo sobre molécula, molécula sobre átomo) e siga em frente. Consistência interna do projeto > pureza taxonômica.

### 5.5 Casos-limite conhecidos (resoluções prescritivas)

| Componente | Classificação | Justificativa |
|---|---|---|
| `Card` (contêiner visual genérico com `CardHeader`/`CardContent`) | **Molecule** (compound component) | Contêiner genérico sem domínio. |
| `ProductCard` (card específico de produto) | **Organism** | Contém domínio (`Product`). |
| `Modal` / `Dialog` genérico | **Molecule** | Primitiva sem domínio. |
| `LoginModal` (dialog com formulário e regras) | **Organism** | Domínio + composição. |
| `Avatar` sozinho | **Atom** | Primitiva irreducível. |
| `Avatar + name + status` (UserBadge) | **Molecule** | Combinação simples de átomos, uma função. |
| Tabela genérica (`DataTable`) | **Organism** | Complexidade e frequentemente lógica. |
| `Breadcrumb` | **Molecule** | Sequência simples de links. |
| `Navigation` primária do site | **Organism** | Seção nomeável. |

---

## 6. Estrutura de diretórios

```
src/
├── app/                              # Rotas Next.js (papel de "pages" de Frost)
│   ├── layout.tsx                    # Root layout: <html>, <body>, providers
│   ├── page.tsx                      # Home
│   ├── loading.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── (marketing)/                  # Route group (sem segmento na URL)
│   │   ├── about/page.tsx
│   │   └── pricing/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx                # App shell autenticado
│   │   ├── dashboard/page.tsx
│   │   └── settings/
│   │       ├── page.tsx
│   │       └── _components/          # Colocados, privados à rota (prefixo _)
│   │           └── SettingsForm.tsx
│   └── blog/
│       ├── page.tsx
│       └── [slug]/page.tsx
│
├── components/
│   ├── atoms/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.types.ts       # opcional; tipos co-localizados
│   │   │   ├── Button.stories.tsx    # opcional (Storybook)
│   │   │   ├── Button.test.tsx       # opcional
│   │   │   └── index.ts              # re-export
│   │   ├── Input/
│   │   ├── Label/
│   │   └── index.ts                  # barrel do nível
│   ├── molecules/
│   │   ├── SearchField/
│   │   ├── FormField/
│   │   └── index.ts
│   ├── organisms/
│   │   ├── SiteHeader/
│   │   ├── SiteFooter/
│   │   ├── ProductCard/
│   │   └── index.ts
│   └── templates/
│       ├── BlogPostTemplate.tsx
│       ├── DashboardTemplate.tsx
│       ├── MarketingTemplate.tsx
│       └── index.ts
│
├── lib/
│   ├── utils.ts                      # cn() e utilitários gerais
│   ├── api/                          # clientes de dados; NUNCA importado por componentes
│   └── db.ts
│
├── hooks/                            # Custom hooks (client-side)
├── styles/
│   └── globals.css                   # tokens (@theme em Tailwind v4)
└── types/                            # tipos compartilhados de domínio
```

**Regras de colocação:**

- **Global vs. co-localizado:** comece global (`src/components/**`). Só mova para `app/<route>/_components/` se ficar claro que o componente jamais será reutilizado fora daquela rota. Promova de volta ao global na primeira vez que precisar em outro lugar.
- **Prefixo `_`** em pastas dentro de `app/` marca a pasta como privada e a exclui do roteamento (https://nextjs.org/docs/app/building-your-application/routing/colocation#private-folders).
- **Route groups `(nome)`** organizam rotas sem adicionar segmento à URL. Use para aplicar `layout.tsx` distintos a subconjuntos de rotas (marketing vs. app autenticado).

---

## 7. Regras por camada

### 7.1 Regra de dependência unidirecional (obrigatória)

```
atoms      → podem importar: nada de components/*  (apenas primitivas, utils, tipos)
molecules  → podem importar: atoms
organisms  → podem importar: atoms, molecules, outros organisms
templates  → podem importar: atoms, molecules, organisms
pages      → podem importar: qualquer coisa (mas idealmente apenas templates + lib/*)
```

**Proibido:**

- Atom importando molecule/organism/template.
- Molecule importando organism/template.
- Organism importando template.
- Qualquer componente em `src/components/**` importando de `src/lib/api/**` (dados fluem via props).
- Qualquer componente em `src/components/**` importando de `next/navigation` para ler rotas (exceto `Link` de `next/link`, permitido em qualquer camada).

**Justificativa:** dependência unidirecional garante testabilidade em Storybook, reutilização, e evita ciclos. Componentes devem ser puros em relação a dados.

### 7.2 Regra `'use client'` por camada

A regra base é: **default para Server Component**. Só adicione `'use client'` quando estritamente necessário.

| Camada | Regra |
|---|---|
| Atom | Server por padrão. Adicione `'use client'` **apenas** se o átomo é intrinsecamente interativo (`Button` com `onClick`, `Input` com `onChange`, `Switch`, etc.). Átomos puramente visuais (`Text`, `Badge`, `Icon`, `Avatar`) **nunca** devem ter `'use client'`. |
| Molecule | Server por padrão. Se compõe apenas átomos server-safe e não introduz interatividade nova, permaneça server. Se introduz estado local (por ex. `SearchField` com validação client-side), marque `'use client'` no arquivo da molécula. |
| Organism | Server por padrão. **Prefira isolar a interatividade em folhas Client dentro do organismo**, mantendo o organismo em si server. Exemplo: um `SiteHeader` server que renderiza um `<MobileMenuToggle>` client. |
| Template | **Sempre** Server Component. Nunca `'use client'`. Templates são puramente composicionais. |
| Page (`app/**/page.tsx`) | **Sempre** async Server Component. Nunca `'use client'`. |

**Padrão de composição server-em-client** (obrigatório sempre que possível): passe Server Components como `children` para Client Components. Nunca `import` direto de Server → dentro de Client.

```tsx
// ✅ Correto
'use client';
export function ClientTabs({ children }: { children: React.ReactNode }) {
  // ...usa useState
  return <div>{children}</div>;
}

// Em um Server Component:
<ClientTabs>
  <ServerFeed />   {/* renderiza no servidor, entra como children */}
</ClientTabs>
```

Referência: https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns

### 7.3 Regra de data-fetching

- **Data-fetching acontece exclusivamente em `page.tsx`** (ou em Server Components-folha aninhados chamados pela page). **Nunca** em templates, organismos, moléculas ou átomos.
- **Dados fluem para baixo via props tipadas.** A interface de props de um template é o contrato entre a rota e o sistema de design.
- Use `fetch` nativo com opções de cache explícitas. Em Next.js 15+ o `fetch` é **uncached por padrão** — opte por cache explicitamente:
  ```ts
  fetch(url, { next: { revalidate: 60 } })            // ISR-like
  fetch(url, { cache: 'force-cache' })                 // estático
  fetch(url, { cache: 'no-store' })                    // dinâmico
  fetch(url, { next: { tags: ['posts'] } })            // revalidação por tag
  ```
- Paralelize requisições independentes com `Promise.all`.
- Use `<Suspense>` em subárvores lentas.
- Mutações usam **Server Actions** (`'use server'`), não Route Handlers, exceto para consumidores externos (webhooks, mobile).
- Em Next.js 15+, `params` e `searchParams` em `page.tsx` são **Promises** e devem ser `await`-ados.

### 7.4 Regra de estilização

- **Tailwind CSS** exclusivamente para estilização. Nada de CSS Modules, styled-components, emotion.
- **Design tokens** vivem em `src/styles/globals.css` sob `@theme` (Tailwind v4). Componentes referenciam tokens via classes utilitárias (`bg-primary`, `text-foreground`), nunca cores hardcoded (`bg-[#3b82f6]`).
- **Variantes** de átomos/moléculas usam `class-variance-authority` (cva). Consulte §8.
- **Merge de classes:** todo componente que aceita `className` externo **deve** usar a utility `cn()` (§8.1) para permitir overrides do consumidor.
- **Escape hatches** (`bg-[#...]`, `w-[123px]`) são proibidos exceto em casos excepcionais documentados por comentário no código.

### 7.5 Regra de props

- **Átomos estendem o tipo HTML nativo correspondente:**
  ```ts
  interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
  }
  ```
- **Composição sobre configuração.** Prefira `children` a props do tipo `label`, `icon`, `startAdornment` quando fizer sentido. Ex.: `<Button><Icon /> Salvar</Button>` em vez de `<Button icon={<Icon />} label="Salvar" />`.
- **Ref forwarding:** átomos que envolvem um elemento HTML devem encaminhar refs. Em React 19+ `ref` é uma prop regular; `forwardRef` opcional apenas para compat com libs.
- **`asChild`** (padrão Radix Slot) permite polimorfismo em átomos sem prop `as`. Preferir para casos onde o consumidor quer trocar o elemento raiz (e.g. `<Button asChild><Link href="/">Home</Link></Button>`).
- **Nunca** aceite props do tipo `data`, `onFetch`, `apiUrl` em templates ou componentes: dados vêm sempre completos, prontos para renderizar.

---

## 8. Utilidades e padrões obrigatórios

### 8.1 A utility `cn`

Arquivo canônico obrigatório: `src/lib/utils.ts`.

```ts
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Use `cn(...)` em **todo** componente que aceita `className`. Ordem obrigatória: classes-base primeiro, `className` do consumidor por último (para que sobrescreva).

### 8.2 Design tokens (Tailwind v4)

```css
/* src/styles/globals.css */
@import "tailwindcss";

@theme {
  --color-background: hsl(0 0% 100%);
  --color-foreground: hsl(222.2 84% 4.9%);
  --color-primary: hsl(221.2 83.2% 53.3%);
  --color-primary-foreground: hsl(210 40% 98%);
  --color-secondary: hsl(210 40% 96.1%);
  --color-secondary-foreground: hsl(222.2 47.4% 11.2%);
  --color-accent: hsl(210 40% 96.1%);
  --color-accent-foreground: hsl(222.2 47.4% 11.2%);
  --color-destructive: hsl(0 84.2% 60.2%);
  --color-ring: hsl(221.2 83.2% 53.3%);

  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;

  --font-sans: "Inter", ui-sans-serif, system-ui;
}

@custom-variant dark (&:where(.dark, .dark *));

.dark {
  --color-background: hsl(222.2 84% 4.9%);
  --color-foreground: hsl(210 40% 98%);
  --color-primary: hsl(217.2 91.2% 59.8%);
}
```

Se o projeto usar Tailwind v3, os tokens vão para `tailwind.config.ts` sob `theme.extend`, com CSS variables em `:root`/`.dark`.

### 8.3 Variantes com cva

```ts
import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
```

---

## 9. Exemplos de código por camada

Cada exemplo é canônico. Copie o padrão.

### 9.1 Atom — `Button`

```tsx
// src/components/atoms/Button/Button.tsx
'use client'; // necessário porque expõe onClick

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
```

```ts
// src/components/atoms/Button/index.ts
export { Button, buttonVariants } from "./Button";
export type { ButtonProps } from "./Button";
```

### 9.2 Molecule — `SearchField`

```tsx
// src/components/molecules/SearchField/SearchField.tsx
'use client';

import * as React from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { cn } from "@/lib/utils";

export interface SearchFieldProps {
  placeholder?: string;
  defaultValue?: string;
  onSubmit: (query: string) => void;
  className?: string;
}

export function SearchField({ placeholder = "Buscar...", defaultValue = "", onSubmit, className }: SearchFieldProps) {
  const [value, setValue] = React.useState(defaultValue);
  return (
    <form
      className={cn("flex items-center gap-2", className)}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value);
      }}
    >
      <Input
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Termo de busca"
      />
      <Button type="submit" size="md">Buscar</Button>
    </form>
  );
}
```

### 9.3 Organism — `SiteHeader`

```tsx
// src/components/organisms/SiteHeader/SiteHeader.tsx
// Server Component: sem 'use client'. Renderiza Client atoms/molecules como folhas.

import Link from "next/link";
import { SearchField } from "@/components/molecules/SearchField";
import { NavLinks } from "./NavLinks";

export interface SiteHeaderProps {
  currentUser?: { name: string; avatarUrl: string } | null;
}

export function SiteHeader({ currentUser }: SiteHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <Link href="/" className="text-lg font-semibold">Acme</Link>
      <NavLinks />
      <div className="flex items-center gap-4">
        <SearchField onSubmit={(q) => { window.location.href = `/search?q=${encodeURIComponent(q)}`; }} />
        {currentUser ? (
          <span className="text-sm">{currentUser.name}</span>
        ) : (
          <Link href="/login" className="text-sm underline">Entrar</Link>
        )}
      </div>
    </header>
  );
}
```

### 9.4 Template (Frost) — `BlogPostTemplate`

```tsx
// src/components/templates/BlogPostTemplate.tsx
// Server Component puro. Sem fetch. Recebe tudo via props.

import { SiteHeader } from "@/components/organisms/SiteHeader";
import { SiteFooter } from "@/components/organisms/SiteFooter";
import { CommentThread } from "@/components/organisms/CommentThread";

export interface BlogPost {
  title: string;
  authorName: string;
  publishedAt: string;
  bodyHtml: string;
}
export interface Comment {
  id: string;
  authorName: string;
  body: string;
}

export interface BlogPostTemplateProps {
  post: BlogPost;
  comments: Comment[];
  currentUser: { name: string; avatarUrl: string } | null;
}

export function BlogPostTemplate({ post, comments, currentUser }: BlogPostTemplateProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader currentUser={currentUser} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <article>
          <h1 className="text-4xl font-bold">{post.title}</h1>
          <p className="mt-2 text-sm text-foreground/60">
            {post.authorName} · {post.publishedAt}
          </p>
          <div className="prose mt-8" dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />
        </article>
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Comentários</h2>
          <CommentThread comments={comments} />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
```

### 9.5 Page (Next.js `page.tsx`, papel de "page" de Frost)

```tsx
// src/app/blog/[slug]/page.tsx
// Async Server Component. Este arquivo é o único lugar onde há data-fetching.

import { notFound } from "next/navigation";
import { BlogPostTemplate } from "@/components/templates/BlogPostTemplate";
import { getPost, getComments, getCurrentUser } from "@/lib/api";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, comments, currentUser] = await Promise.all([
    getPost(slug),
    getComments(slug),
    getCurrentUser(),
  ]);
  if (!post) notFound();
  return <BlogPostTemplate post={post} comments={comments} currentUser={currentUser} />;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  return { title: post?.title ?? "Post não encontrado" };
}
```

### 9.6 Layout Next.js (não é template de Frost)

```tsx
// src/app/(app)/layout.tsx
// Persistente entre navegações. NÃO é um template de Frost.
// Compõe organismos globais em torno de {children}.

import { SiteHeader } from "@/components/organisms/SiteHeader";
import { SiteFooter } from "@/components/organisms/SiteFooter";
import { getCurrentUser } from "@/lib/api";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader currentUser={currentUser} />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
```

---

## 10. Convenções de nomenclatura e organização de arquivos

- **PascalCase** para nomes de componentes e arquivos que exportam componentes (`Button.tsx`, `ProductCard.tsx`).
- **camelCase** para utilitários e hooks (`utils.ts`, `useDebounce.ts`).
- **kebab-case** para arquivos de rota Next.js quando o nome não é um convention-file (raro; a convenção é usar apenas `page.tsx`, `layout.tsx`, etc.).
- **Uma pasta por componente**, contendo:
  - `<Name>.tsx` — implementação.
  - `<Name>.types.ts` — tipos, se muito extensos (opcional).
  - `<Name>.stories.tsx` — story Storybook (opcional).
  - `<Name>.test.tsx` — testes (opcional).
  - `index.ts` — re-export de tudo público.
- **Barrel `index.ts` em cada nível atômico** (`atoms/index.ts`, `molecules/index.ts`, etc.) reexportando cada componente. Consumidores importam de `@/components/atoms`, não do caminho profundo.
- **Templates de Frost** vivem como arquivo único `<Name>Template.tsx` diretamente em `src/components/templates/` (sem subpasta), pois tipicamente não têm stories/tests próprios — são testados via as pages que os consomem.
- **Sufixo `Template`** obrigatório em templates de Frost (`BlogPostTemplate`, `DashboardTemplate`), para desambiguar de organismos e de arquivos `template.tsx` do Next.js.
- **Path alias:** use `@/*` para `src/*`. Configure em `tsconfig.json`:
  ```json
  { "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["./src/*"] } } }
  ```
- **Tipos de domínio** ficam em `src/types/` e são importáveis por templates. Templates **não** importam de `src/lib/api/**`.

---

## 11. Checklist antes de criar ou modificar um componente

Antes de commitar, verifique **todos** os itens aplicáveis:

- [ ] Classifiquei o componente executando a árvore de decisão da §5.
- [ ] Coloquei o arquivo na pasta correta (§6).
- [ ] O componente respeita a regra de dependência unidirecional (§7.1). Verifiquei os `import` statements.
- [ ] `'use client'` está presente **apenas** se necessário (§7.2). Se é um template ou page, **não** tem `'use client'`.
- [ ] Se é um `page.tsx`, é um `async Server Component`, faz `await params`, realiza data-fetching e passa dados a um template como props.
- [ ] Se é um template, **não** faz fetching, **não** importa de `src/lib/api/**`, e recebe todos os dados via props tipadas.
- [ ] Componente aceita e propaga `className` via `cn()`.
- [ ] Estilos usam apenas tokens definidos em `@theme` (§8.2). Nenhum valor de cor/espaçamento hardcoded.
- [ ] Variantes usam `cva` quando há mais de duas variantes visuais.
- [ ] Se é átomo que envolve um elemento HTML, estende `React.<Element>HTMLAttributes<HTML<Element>Element>` e encaminha `ref`.
- [ ] Nome segue as convenções da §10 (PascalCase, sufixo `Template` quando aplicável).
- [ ] Exports públicos passam pelo `index.ts` da pasta e pelo barrel do nível.
- [ ] Se é uma page nova, considerei ativamente **variações de conteúdo** (dados vazios, longos, ausentes) — Frost enfatiza que pages testam a resiliência do sistema.
- [ ] Nenhum ciclo de dependência foi introduzido.

---

## 12. Anti-padrões — NÃO FAÇA

Cada item é uma violação explícita. Se identificar um destes, refatore antes de commitar.

- **NÃO** faça fetching em templates, organismos, moléculas ou átomos. Data-fetching vive exclusivamente em `page.tsx` (ou em Server Components-folha invocados a partir dele).
- **NÃO** importe `src/lib/api/**` em nenhum componente de `src/components/**`. Componentes recebem dados como props.
- **NÃO** confunda `template.tsx` do Next.js com template de Frost. `template.tsx` (Next) é um layout com semântica de remontagem; templates de Frost vivem em `src/components/templates/`.
- **NÃO** coloque `'use client'` em templates, pages, ou componentes puramente apresentacionais que não precisam. Cada `'use client'` desnecessário aumenta o bundle.
- **NÃO** importe um Server Component diretamente dentro de um Client Component. Passe como `children`.
- **NÃO** faça um átomo importar uma molécula ou organismo. Se um átomo "precisa" de outro componente, ele não é um átomo.
- **NÃO** coloque lógica de domínio (formatação de preço com regras de negócio, cálculo de estoque, permissões) em átomos ou moléculas. Isso é sinal de organismo.
- **NÃO** use valores Tailwind arbitrários (`bg-[#3b82f6]`, `w-[123px]`) sem justificativa documentada. Use tokens.
- **NÃO** aceite `className` sem passá-lo por `cn()`. Consumidor deve poder sobrescrever.
- **NÃO** crie um `template.tsx` (Next.js) só para envolver `{children}` num layout — use `layout.tsx`. Só use `template.tsx` quando precisar da remontagem por navegação.
- **NÃO** debata classificação por mais de 5 minutos. Se persistir a dúvida, aplique os desempates da §5.4 e siga em frente. Frost é explícito: a nomenclatura importa menos que a hierarquia consistente.
- **NÃO** hardcode conteúdo em templates. Templates articulam **estrutura**; conteúdo vem via props na page.
- **NÃO** crie páginas (`page.tsx`) com JSX gordo. Uma page ideal tem <30 linhas: parse de params, fetch em paralelo, render de um template.
- **NÃO** duplique organismos "com pequenas variações". Adicione uma prop ou variante cva. Se as diferenças forem estruturais, crie dois organismos irmãos.
- **NÃO** use `default export` em átomos/moléculas/organismos. Use `named export` (facilita refactoring e evita renomeações silenciosas). Pages e layouts do Next.js **exigem** `default export` — essa é a única exceção.

---

## 13. Referências

- Brad Frost, *Atomic Design* (2016). https://atomicdesign.bradfrost.com/table-of-contents/
  - Capítulo 1 — Designing Systems: https://atomicdesign.bradfrost.com/chapter-1/
  - Capítulo 2 — Atomic Design Methodology: https://atomicdesign.bradfrost.com/chapter-2/
  - Capítulo 3 — Tools of the Trade: https://atomicdesign.bradfrost.com/chapter-3/
- Next.js App Router — File Conventions: https://nextjs.org/docs/app/api-reference/file-conventions
- Next.js — Server & Client Composition Patterns: https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns
- Next.js — Data Fetching: https://nextjs.org/docs/app/building-your-application/data-fetching/fetching
- Next.js — Project Organization (colocation, route groups, private folders): https://nextjs.org/docs/app/building-your-application/routing/colocation
- Tailwind CSS v4 — Theme: https://tailwindcss.com/docs/theme
- class-variance-authority: https://cva.style/docs
- tailwind-merge: https://github.com/dcastil/tailwind-merge
- Radix Slot (`asChild`): https://www.radix-ui.com/primitives/docs/utilities/slot
- shadcn/ui (referência de composição): https://ui.shadcn.com
