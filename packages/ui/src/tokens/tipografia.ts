// O design system Roça Neon usa Montserrat pros títulos ficarem bem geométricos e pesados,
// e no corpo a gente pode manter Inter ou o próprio Montserrat mais fino pra não poluir.
// Aqui definimos os tokens pra jogar pro Vuetify e pro gerador de PDF.

export const tipografiaRocaNeon = {
  familia: {
    display: '"Montserrat", "Helvetica Neue", sans-serif',
    corpo: '"Inter", "Roboto", sans-serif',
    mono: '"JetBrains Mono", "Courier New", monospace',
  },
  tamanhos: {
    // Títulos (Display)
    titulo1: { tamanho: '3rem', alturaLinha: '1.2', peso: '900' }, // 48px
    titulo2: { tamanho: '2.25rem', alturaLinha: '1.2', peso: '800' }, // 36px
    titulo3: { tamanho: '1.5rem', alturaLinha: '1.3', peso: '700' }, // 24px
    titulo4: { tamanho: '1.25rem', alturaLinha: '1.4', peso: '700' }, // 20px
    
    // Corpo
    corpoGrande: { tamanho: '1.125rem', alturaLinha: '1.5', peso: '400' }, // 18px
    corpoPadrao: { tamanho: '1rem', alturaLinha: '1.5', peso: '400' }, // 16px
    corpoPequeno: { tamanho: '0.875rem', alturaLinha: '1.5', peso: '400' }, // 14px
    rotulo: { tamanho: '0.75rem', alturaLinha: '1.5', peso: '500', tracking: '0.05em' }, // 12px
  }
}
