// Unico lugar dos testes que le process.env: as URLs do banco de dev. Sem
// elas os testes que precisam de banco sao pulados, nao falham.
export const BANCO_URL = process.env.BANCO_URL
export const BANCO_URL_MIGRACAO = process.env.BANCO_URL_MIGRACAO
export const temBanco = Boolean(BANCO_URL && BANCO_URL_MIGRACAO)
// para os testes que rodam outro processo (herda o PATH e o resto)
export const ambiente = process.env
