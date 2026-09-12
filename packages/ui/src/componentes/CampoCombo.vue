<script setup lang="ts">
// Combobox: o usuário pode escolher da lista ou digitar um valor novo.
import { VCombobox } from 'vuetify/components'

defineProps<{
  rotulo: string
  dica?: string
}>()
</script>

<template>
  <div class="campo-combo">
    <label v-if="rotulo" class="campo-rotulo">{{ rotulo }}</label>
    
    <v-combobox
      v-bind="$attrs"
      variant="outlined"
      density="comfortable"
      :hint="dica"
      persistent-hint
      class="mt-1"
    ></v-combobox>
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
