<script setup lang="ts">
// Select simples pra escolha de lista fechada.
// Mesmo padrão visual do CampoTexto.
import { VSelect } from 'vuetify/components'

defineProps<{
  rotulo: string
  dica?: string
}>()
</script>

<template>
  <div class="campo-selecao">
    <label v-if="rotulo" class="campo-rotulo">{{ rotulo }}</label>
    
    <v-select
      v-bind="$attrs"
      variant="outlined"
      density="comfortable"
      :hint="dica"
      persistent-hint
      class="mt-1"
    ></v-select>
  </div>
</template>

<style scoped>
.campo-rotulo {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--v-theme-on-surface);
  margin-bottom: 4px;
  display: block;
}
</style>
