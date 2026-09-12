<script setup lang="ts">
// Linha do tempo simples para mostrar o rastro de eventos do signatário.
import { VTimeline, VTimelineItem } from 'vuetify/components'

defineProps<{
  eventos: Array<{ data: string, hora: string, titulo: string, detalhe?: string, sucesso: boolean }>
}>()
</script>

<template>
  <v-timeline density="compact" align="start" class="linha-do-tempo-evidencias">
    <v-timeline-item
      v-for="(evento, indice) in eventos"
      :key="indice"
      :dot-color="evento.sucesso ? 'success' : 'error'"
      :icon="evento.sucesso ? 'mdi-check' : 'mdi-alert'"
      size="small"
    >
      <div class="d-flex flex-column">
        <div class="text-caption font-weight-bold">{{ evento.data }} às {{ evento.hora }}</div>
        <div class="text-body-2 font-weight-medium mt-1">{{ evento.titulo }}</div>
        <div v-if="evento.detalhe" class="text-caption text-medium-emphasis mt-1">
          {{ evento.detalhe }}
        </div>
      </div>
    </v-timeline-item>
  </v-timeline>
</template>
