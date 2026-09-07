// Formato do @argfile do launcher do java (java @arquivo): um argumento por linha, sempre
// entre aspas duplas; dentro delas barra e aspas ganham escape, e quebra de linha, tabulação
// e form feed viram \n, \r, \t e \f. "" vira argumento vazio. Conferido na máquina com
// java -XshowSettings:properties @arquivo.

const ESCAPES: Record<string, string> = {
  '\\': '\\\\',
  '"': '\\"',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\f': '\\f',
}

export function escaparArgumento(valor: string): string {
  return `"${valor.replace(/[\\"\n\r\t\f]/g, (c) => ESCAPES[c] ?? c)}"`
}

export function montarArgfile(argumentos: readonly string[]): string {
  return argumentos.map(escaparArgumento).join('\n') + '\n'
}
