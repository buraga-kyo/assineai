import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStoreCriacaoEnvelope = defineStore('criacaoEnvelope', () => {
  const passoAtual = ref(0)
  
  const documento = ref<File | null>(null)
  
  const signatarios = ref<Array<{ nome: string, email: string, canal: string }>>([])
  
  const configCarimbo = ref({
    tipo: 'ultima_pagina', // ou 'marcacao_manual'
    posicoes: [] as Array<{ pagina: number, proporcaoX: number, proporcaoY: number }>
  })
  
  const configEnvio = ref({
    mensagem: 'Por favor, assine este documento.',
    exigirCodigo: false
  })

  function proximoPasso() {
    if (passoAtual.value < 3) passoAtual.value++
  }

  function passoAnterior() {
    if (passoAtual.value > 0) passoAtual.value--
  }

  function limpar() {
    passoAtual.value = 0
    documento.value = null
    signatarios.value = []
    configCarimbo.value = { tipo: 'ultima_pagina', posicoes: [] }
    configEnvio.value = { mensagem: 'Por favor, assine este documento.', exigirCodigo: false }
  }

  return { 
    passoAtual, 
    documento, 
    signatarios, 
    configCarimbo, 
    configEnvio,
    proximoPasso,
    passoAnterior,
    limpar
  }
})
