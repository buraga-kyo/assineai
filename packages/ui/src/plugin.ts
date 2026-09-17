import { createVuetify } from 'vuetify'
import * as componentesVuetify from 'vuetify/components'
import * as diretivasVuetify from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import { coresRocaNeon } from './tokens/index.js'
import './base.css'
import './roca-neon.css' // Importa o CSS base do Roça Neon

// Tema escuro do Roça Neon mapeado pros nomes que o Vuetify entende
const temaRocaNeonEscuro = {
  dark: true,
  colors: {
    background: coresRocaNeon.fundo,
    surface: coresRocaNeon.superficie,
    primary: coresRocaNeon.primaria,
    'primary-darken-1': coresRocaNeon.primariaEscura,
    secondary: coresRocaNeon.secundaria,
    'secondary-darken-1': coresRocaNeon.secundariaEscura,
    accent: coresRocaNeon.acento,
    error: coresRocaNeon.erro,
    info: coresRocaNeon.info,
    success: coresRocaNeon.sucesso,
    warning: coresRocaNeon.aviso,
  },
}

// Exporta o plugin pronto pra ser usado com app.use() no Vue
export const pluginAssineAi = createVuetify({
  components: componentesVuetify,
  directives: diretivasVuetify,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: 'temaRocaNeonEscuro',
    themes: {
      temaRocaNeonEscuro,
    },
  },
  defaults: {
    global: {
      rounded: 0, // cantos retos (sobrescritos pelo CSS)
    },
    VBtn: {
      variant: 'flat', // botões sólidos
      rounded: 0,
    },
    VCard: {
      rounded: 0,
    },
    VTextField: {
      variant: 'outlined',
      rounded: 0,
    },
  },
})
