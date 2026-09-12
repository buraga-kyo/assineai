import { createVuetify } from 'vuetify'
import * as componentesVuetify from 'vuetify/components'
import * as diretivasVuetify from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import { coresRocaNeon } from './tokens/index.js'

// Tema claro do Roça Neon mapeado pros nomes que o Vuetify entende
const temaRocaNeonClaro = {
  dark: false,
  colors: {
    background: coresRocaNeon.fundo,
    surface: coresRocaNeon.superficie,
    primary: coresRocaNeon.primaria,
    'primary-darken-1': coresRocaNeon.primariaEscura,
    secondary: coresRocaNeon.secundaria,
    'secondary-darken-1': coresRocaNeon.secundariaEscura,
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
    defaultTheme: 'temaRocaNeonClaro',
    themes: {
      temaRocaNeonClaro,
    },
  },
})
