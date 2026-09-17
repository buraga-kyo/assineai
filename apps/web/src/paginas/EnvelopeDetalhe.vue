<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { LinhaDoTempoEvidencias, GrupoAtributos, ChipCanal } from '@assineai/ui'
import { useStoreEnvelopes } from '../store/envelopes'

const roteador = useRouter()
const rota = useRoute()
const store = useStoreEnvelopes()

const idEnvelope = rota.params.id as string

// Dados marretados por enquanto até a API voltar
const eventosMock = [
  { data: '12/09/2026', hora: '10:00', titulo: 'Envelope Criado', sucesso: true },
  { data: '12/09/2026', hora: '10:05', titulo: 'Convite enviado pro WhatsApp', sucesso: true }
]

async function cancelar() {
  if (confirm('Quer mesmo cancelar esse envelope? Ninguém mais vai conseguir assinar.')) {
    await store.cancelarEnvelope(idEnvelope)
    roteador.push({ name: 'envelopes' })
  }
}
</script>

<template>
  <v-container>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="roteador.back()">Voltar</v-btn>
    
    <div class="d-flex justify-space-between align-start mb-6">
      <div>
        <div class="text-caption text-medium-emphasis mb-1">ENV-001</div>
        <h1 class="text-h4 font-weight-black">Contrato de Parceria</h1>
      </div>
      <v-chip color="warning">PENDENTE</v-chip>
    </div>

    <v-row>
      <v-col cols="12" md="8">
        <v-card class="pa-6 mb-6" variant="outlined">
          <h2 class="text-h6 mb-4">Signatários</h2>
          
          <div class="d-flex align-center justify-space-between py-3 border-b">
            <div>
              <div class="font-weight-bold">João Silva</div>
              <div class="text-caption text-medium-emphasis">joao@fazenda.com</div>
            </div>
            <div class="d-flex align-center gap-2">
              <ChipCanal canal="whatsapp" status="pendente" />
              <v-btn size="small" variant="text" color="primary">Reenviar</v-btn>
            </div>
          </div>
        </v-card>

        <v-card class="pa-6" variant="outlined">
          <h2 class="text-h6 mb-4">Rastro de Evidências</h2>
          <LinhaDoTempoEvidencias :eventos="eventosMock" />
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-6 mb-6 bg-surface-variant" variant="flat">
          <h2 class="text-h6 mb-4">Ações</h2>
          
          <v-btn block color="primary" variant="outlined" class="mb-3" prepend-icon="mdi-link">
            Copiar Link Público
          </v-btn>
          <v-btn block color="error" variant="text" @click="cancelar">
            Cancelar Envelope
          </v-btn>
        </v-card>

        <v-card class="pa-6" variant="outlined">
          <h2 class="text-h6 mb-4">Detalhes</h2>
          <GrupoAtributos titulo="Criado em" valor="12/09/2026 10:00" />
          <GrupoAtributos titulo="Remetente" valor="voce@fazenda.com" />
          <GrupoAtributos titulo="Hash" valor="8f4e2b1a..." />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
