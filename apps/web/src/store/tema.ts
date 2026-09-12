import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStoreTema = defineStore('tema', () => {
  const carregando = ref(false)
  const erroContraste = ref(false)
  
  // O tema da empresa
  const tema = ref({
    marca: { nome: 'Minha Empresa', logoUrl: '' },
    paleta: {
      primaria: '#0B5D3B',
      texto: '#1B1B1B',
      fundo: '#FFFFFF'
    },
    tipografia: { familia: 'Inter' },
    textos: {
      tituloRelatorio: 'Relatório de Assinaturas',
      rodape: 'Documento gerado por AssineAi'
    }
  })

  // Simula o cálculo de contraste (super rudimentar só pra UI)
  function validarContraste() {
    // Se a cor primaria for igual ao fundo ou texto muito claro
    if (tema.value.paleta.primaria === tema.value.paleta.fundo) {
      erroContraste.value = true
    } else {
      erroContraste.value = false
    }
  }

  async function salvarTema() {
    carregando.value = true
    try {
      // API call de mentira
      await new Promise(resolve => setTimeout(resolve, 800))
      console.log('Tema salvo:', tema.value)
    } finally {
      carregando.value = false
    }
  }

  return { tema, carregando, erroContraste, validarContraste, salvarTema }
})
