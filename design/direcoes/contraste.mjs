// Calcula a razão de contraste WCAG 2 dos pares de cor de cada direção.
// Uso: node design/direcoes/contraste.mjs   (sem dependências; lê os CSS de tokens ao lado)
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const direcoes = { "Roça Neon": "roca-neon.css", "Palco": "palco.css", "Papel Timbrado": "papel-timbrado.css" };

const canal = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const luminancia = (hex) => {
  const n = parseInt(hex.slice(1, 7), 16);
  return 0.2126 * canal(n >> 16) + 0.7152 * canal((n >> 8) & 255) + 0.0722 * canal(n & 255);
};
const razao = (a, b) => {
  const [claro, escuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (escuro + 0.05);
};
const marca = (r, minimo) => `${r.toFixed(1)}:1 ${r >= minimo ? "ok" : "REPROVA"}`;

// texto exige 4.5:1 (AA); botão e chip, como componente, 3:1
const pares = [
  ["texto / fundo", "texto", "fundo", 4.5],
  ["texto / superfície", "texto", "superficie", 4.5],
  ["texto suave / superfície", "texto-suave", "superficie", 4.5],
  ["texto sobre a primária", "sobre-primaria", "primaria", 4.5],
  ["primária / fundo (botão)", "primaria", "fundo", 3],
  ["texto sobre o acento", "sobre-acento", "acento", 4.5],
];
const estados = ["aguardando", "parcial", "selado", "recusado", "expirado"];

const cabecalho = ["Par", ...Object.keys(direcoes)];
const linhas = [cabecalho, cabecalho.map(() => "---")];
const tokensDe = {};
for (const [nome, arquivo] of Object.entries(direcoes)) {
  const css = readFileSync(join(aqui, arquivo), "utf8");
  tokensDe[nome] = Object.fromEntries([...css.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]));
}
for (const [rotulo, a, b, minimo] of pares) {
  linhas.push([rotulo, ...Object.values(tokensDe).map((t) => marca(razao(t[a], t[b]), minimo))]);
}
linhas.push(["pior estado / superfície", ...Object.values(tokensDe).map((t) => {
  const pior = estados.map((e) => [e, razao(t[e], t.superficie)]).sort((x, y) => x[1] - y[1])[0];
  return `${marca(pior[1], 4.5)} (${pior[0]})`;
})]);
linhas.push(["tema do cliente: branco sobre #0B5D3B", ...Object.keys(direcoes).map(() => marca(razao("#FFFFFF", "#0B5D3B"), 4.5))]);
for (const l of linhas) console.log(`| ${l.join(" | ")} |`);
