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

  async function dispararEnvelope(titulo: string) {
    if (!documento.value || signatarios.value.length === 0) throw new Error('Faltam dados')
    
    // 1. Cria o envelope
    const resEnv = await fetch('/api/envelopes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo })
    })
    const envData = await resEnv.json()
    if (!resEnv.ok) throw new Error('Erro criando envelope')
    const envelopeId = envData.id

    // 2. Cria os signatarios
    for (const sig of signatarios.value) {
      await fetch(`/api/envelopes/${envelopeId}/signatarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: sig.nome, email: sig.email })
      })
    }

    // Na vida real a gente chamaria a rota pra dar o upload do documento (multipart)
    const formData = new FormData()
    formData.append('arquivo', documento.value)
    const resUpload = await fetch(`/api/envelopes/${envelopeId}/documentos`, {
      method: 'POST',
      body: formData
    })
    if (!resUpload.ok) throw new Error('Erro no upload do documento')

    // 3. Envia o envelope
    await fetch(`/api/envelopes/${envelopeId}/enviar`, {
      method: 'POST'
    })
    
    limpar()
  }

  return { 
    passoAtual, 
    documento, 
    signatarios, 
    configCarimbo, 
    configEnvio,
    proximoPasso,
    passoAnterior,
    limpar,
    dispararEnvelope
  }
})
