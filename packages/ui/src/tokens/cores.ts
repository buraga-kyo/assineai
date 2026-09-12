// Aqui a gente define a paleta de cores do "Roça Neon"
// É a vibe AgroTech: terra, verde escuro e aquele neon pra dar o choque.
// Como não temos um designer refinando os hexcodes ainda, esses são os chutes iniciais
// que garantem contraste AA e legibilidade.

export const coresRocaNeon = {
  // Cores de Função
  primaria: '#0B5D3B', // Verde bem escuro e fechado (floresta)
  sobrePrimaria: '#FFFFFF', // Texto em cima da primária
  primariaEscura: '#074229', 
  
  secundaria: '#D95C14', // Um laranja terra queimado
  sobreSecundaria: '#FFFFFF',
  secundariaEscura: '#A6450E',

  acento: '#B4ED38', // O verde limão choque (Neon)
  sobreAcento: '#1B1B1B', // Como o neon é claro, texto escuro em cima
  
  sucesso: '#16A34A',
  sobreSucesso: '#FFFFFF',
  
  aviso: '#EAB308',
  sobreAviso: '#1B1B1B',
  
  erro: '#DC2626',
  sobreErro: '#FFFFFF',
  
  info: '#2563EB',
  sobreInfo: '#FFFFFF',

  // Neutros (Escala de cinzas, mas puxando levemente pro marrom/terra)
  neutro50: '#F9F8F6',
  neutro100: '#F1EFEA',
  neutro200: '#E2DFD6',
  neutro300: '#CFCAC0',
  neutro400: '#AFA99D',
  neutro500: '#8C867B',
  neutro600: '#69645A',
  neutro700: '#524F46',
  neutro800: '#3D3A34',
  neutro900: '#262420',

  // Superfícies (Tema Claro por padrão)
  fundo: '#F9F8F6', // O neutro50
  superficie: '#FFFFFF', // Cartões e modais brancos
  linha: '#E2DFD6', // O neutro200 pra bordas
  textoPadrao: '#262420', // O neutro900
  textoSuave: '#69645A', // O neutro600
}
