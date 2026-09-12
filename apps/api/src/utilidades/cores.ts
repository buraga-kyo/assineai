export function hexParaRgb(hex: string): { r: number; g: number; b: number } | null {
  const limpo = hex.replace(/^#/, '')
  if (limpo.length !== 3 && limpo.length !== 6) return null

  let completo = limpo
  if (limpo.length === 3) {
    completo = limpo.split('').map((char) => char + char).join('')
  }

  const valor = parseInt(completo, 16)
  if (isNaN(valor)) return null

  return {
    r: (valor >> 16) & 255,
    g: (valor >> 8) & 255,
    b: valor & 255,
  }
}

export function luminanciaRelativa(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs! + 0.7152 * gs! + 0.0722 * bs!
}

export function proporcaoContraste(hex1: string, hex2: string): number {
  const rgb1 = hexParaRgb(hex1)
  const rgb2 = hexParaRgb(hex2)
  if (!rgb1 || !rgb2) return 1 // Falha silenciosa ou retorno default

  const l1 = luminanciaRelativa(rgb1.r, rgb1.g, rgb1.b)
  const l2 = luminanciaRelativa(rgb2.r, rgb2.g, rgb2.b)

  const maisClaro = Math.max(l1, l2)
  const maisEscuro = Math.min(l1, l2)

  return (maisClaro + 0.05) / (maisEscuro + 0.05)
}

export function validarContrasteWcag(corTexto: string, corFundo: string): boolean {
  // WCAG AA requer no mínimo 4.5:1 para texto normal
  return proporcaoContraste(corTexto, corFundo) >= 4.5
}
