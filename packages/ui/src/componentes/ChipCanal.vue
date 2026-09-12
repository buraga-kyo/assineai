<script setup lang="ts">
// Chip simples pra mostrar o canal de contato e o status.
// Usado na lista de signatários do envelope.
import { VChip, VIcon } from 'vuetify/components'
import { computed } from 'vue'

const propriedades = defineProps<{
  canal: 'email' | 'whatsapp' | 'slack' | 'telegram'
  status?: 'pendente' | 'pareado' | 'erro'
}>()

const corDoStatus = computed(() => {
  switch (propriedades.status) {
    case 'pareado': return 'success'
    case 'erro': return 'error'
    default: return 'default'
  }
})

const iconeDoCanal = computed(() => {
  switch (propriedades.canal) {
    case 'email': return 'mdi-email'
    case 'whatsapp': return 'mdi-whatsapp'
    case 'slack': return 'mdi-slack'
    case 'telegram': return 'mdi-telegram'
    default: return 'mdi-message'
  }
})
</script>

<template>
  <v-chip
    size="small"
    :color="corDoStatus"
    class="chip-canal"
  >
    <v-icon start :icon="iconeDoCanal" size="14"></v-icon>
    <span class="text-capitalize">{{ canal }}</span>
  </v-chip>
</template>
