<script setup lang="ts">
// Um seletor simples de data, encapsulando o VDateInput e formatando bonitinho
// Usaríamos o VDatePicker interno, mas pro fluxo básico um campo que abra o picker resolve.
import { ref } from 'vue'

const propriedades = defineProps<{
  rotulo: string
  dica?: string
}>()

// Como o vuetify 3 tá meio enrolado com VDateTimePicker nato, a gente usa o text-field com type="datetime-local"
// É nativo, rápido no celular e resolve o nosso problema sem puxar lib pesada.
</script>

<template>
  <div class="campo-data-hora">
    <label v-if="rotulo" class="campo-rotulo">{{ rotulo }}</label>
    
    <v-text-field
      v-bind="$attrs"
      type="datetime-local"
      variant="outlined"
      density="comfortable"
      :hint="dica"
      persistent-hint
      class="mt-1"
    ></v-text-field>
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
