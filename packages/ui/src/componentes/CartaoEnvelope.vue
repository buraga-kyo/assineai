<script setup lang="ts">
// Cartão que representa um envelope na listagem.
import { VCard, VCardTitle, VCardText, VChip } from 'vuetify/components'
import ChipCanal from './ChipCanal.vue'

defineProps<{
  codigo: string
  titulo: string
  estado: 'rascunho' | 'pendente' | 'concluido' | 'cancelado'
  prazo?: string | undefined
  signatarios: Array<{ nome: string, canal: 'email' | 'whatsapp' | 'slack' | 'telegram' }>
}>()

const corDoEstado = (estadoEnvelope: string) => {
  switch (estadoEnvelope) {
    case 'concluido': return 'success'
    case 'pendente': return 'warning'
    case 'cancelado': return 'error'
    default: return 'default'
  }
}
</script>

<template>
  <v-card variant="outlined" class="cartao-envelope mb-3">
    <v-card-title class="d-flex align-center justify-space-between pt-4 pb-2">
      <span class="text-truncate font-weight-bold" style="max-width: 70%">{{ titulo }}</span>
      <v-chip size="small" :color="corDoEstado(estado)" class="text-uppercase">{{ estado }}</v-chip>
    </v-card-title>
    
    <v-card-text>
      <div class="text-caption text-medium-emphasis mb-3">Envelope {{ codigo }}</div>
      
      <div class="d-flex flex-wrap gap-2 mb-3">
        <div v-for="(sig, indice) in signatarios" :key="indice" class="d-flex align-center mr-3 mb-2">
          <span class="text-body-2 mr-2">{{ sig.nome }}</span>
          <ChipCanal :canal="sig.canal" />
        </div>
      </div>
      
      <div v-if="prazo" class="text-caption text-error font-weight-medium">
        Vence em: {{ prazo }}
      </div>
    </v-card-text>
  </v-card>
</template>
