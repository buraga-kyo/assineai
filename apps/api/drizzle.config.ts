// Config do drizzle-kit (gerar migrations, push em dev e studio). Le a URL da
// role dona pelo mesmo carregador da api: process.env so e lido em config.ts.
import { defineConfig } from 'drizzle-kit'
import { carregarConfigDeMigracaoOuSair } from './src/config.js'

const config = carregarConfigDeMigracaoOuSair()

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/banco/esquema/index.ts',
  out: './src/banco/migracoes',
  dbCredentials: { url: config.BANCO_URL_MIGRACAO },
  // o SQL gerado e a especificacao do esquema: ele precisa ser lido antes de
  // commitar, por isso sem breakpoints no meio de cada instrucao
  breakpoints: false,
  strict: true,
  verbose: true,
})
