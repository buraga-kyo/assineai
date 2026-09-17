import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Signatario {
  id: string
  nome: string
  canal: 'email' | 'whatsapp' | 'slack' | 'telegram'
  status: 'pendente' | 'pareado' | 'erro'
}

export interface Envelope {
  id: string
  codigo: string
  titulo: string
  estado: 'rascunho' | 'pendente' | 'concluido' | 'cancelado'
  prazo?: string
  signatarios: Signatario[]
}

export const useStoreEnvelopes = defineStore('envelopes', () => {
  const lista = ref<Envelope[]>([])
  const carregando = ref(false)

  // Bate na API pra trazer a lista
  async function carregarLista() {
    carregando.value = true
    try {
      const res = await fetch('/api/envelopes')
      if (res.ok) {
        lista.value = await res.json()
      }
    } catch (e) {
      console.error('Falha ao carregar envelopes', e)
    } finally {
      carregando.value = false
    }
  }

  // Cancela o bicho
  async function cancelarEnvelope(id: string) {
    try {
      const res = await fetch(`/api/envelopes/${id}/cancelar`, { method: 'POST', headers: { 'X-Requisicao': '1' } })
      if (res.ok) {
        const envelope = lista.value.find(e => e.id === id)
        if (envelope) envelope.estado = 'cancelado'
      }
    } catch (e) {
      console.error('Falha ao cancelar envelope', e)
    }
  }

  return { lista, carregando, carregarLista, cancelarEnvelope }
})
