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

  async function carregarTema() {
    carregando.value = true
    try {
      const res = await fetch('/api/tema')
      if (res.ok) {
        const json = await res.json()
        if (json.tema) {
           // Merging mock structure vs api structure
           const t = json.tema
           tema.value.paleta.primaria = t.paleta?.primaria || '#0B5D3B'
           tema.value.paleta.fundo = t.paleta?.fundo || '#FFFFFF'
           tema.value.paleta.texto = t.paleta?.texto || '#1B1B1B'
           tema.value.tipografia.familia = t.fonte || 'Inter'
           tema.value.marca.logoUrl = t.logo || ''
           if (t.textos) {
             tema.value.textos.tituloRelatorio = t.textos.tituloRelatorio || 'Relatório de Assinaturas'
             tema.value.textos.rodape = t.textos.rodape || 'Documento gerado por AssineAi'
           }
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      carregando.value = false
    }
  }

  async function salvarTema() {
    carregando.value = true
    try {
      const payload = {
        logo: tema.value.marca.logoUrl || undefined,
        paleta: tema.value.paleta,
        fonte: tema.value.tipografia.familia,
        textos: tema.value.textos
      }
      await fetch('/api/tema', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } finally {
      carregando.value = false
    }
  }

  return { tema, carregando, erroContraste, validarContraste, carregarTema, salvarTema }
})
