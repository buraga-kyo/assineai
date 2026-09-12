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

  // Bate na API pra trazer a lista paginada
  async function carregarLista(cursor?: string) {
    carregando.value = true
    try {
      // Mock da API por enquanto
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (!cursor) {
        lista.value = [
          {
            id: '1',
            codigo: 'ENV-001',
            titulo: 'Contrato de Parceria',
            estado: 'pendente',
            signatarios: [
              { id: 's1', nome: 'João', canal: 'whatsapp', status: 'pendente' }
            ]
          }
        ]
      }
    } finally {
      carregando.value = false
    }
  }

  // Cancela o bicho
  async function cancelarEnvelope(id: string) {
    // try API...
    const envelope = lista.value.find(e => e.id === id)
    if (envelope) {
      envelope.estado = 'cancelado'
    }
  }

  return { lista, carregando, carregarLista, cancelarEnvelope }
})
