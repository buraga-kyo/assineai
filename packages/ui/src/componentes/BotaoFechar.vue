<script setup lang="ts">
// Botão padrão pra fechar modais e diálogos
// Fica no canto superior direito do container relativo mais próximo.
import { VBtn, VIcon } from 'vuetify/components'

defineEmits(['clicou'])
</script>

<template>
  <v-btn
    icon
    variant="text"
    size="small"
    class="botao-fechar position-absolute right-0 top-0 mt-2 mr-2"
    @click="$emit('clicou')"
  >
    <v-icon icon="mdi-close"></v-icon>
  </v-btn>
</template>
