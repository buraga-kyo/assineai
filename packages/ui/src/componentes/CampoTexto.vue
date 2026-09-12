<script setup lang="ts">
// Campo de texto no padrão do sistema: rótulo por fora do campo.
// Isso melhora muito a leitura e o foco no celular.
import { VTextField } from 'vuetify/components'

// A gente recebe as propriedades, mas como o VTextField tem muitas, 
// a gente pode repassar tudo direto usando o $attrs
defineProps<{
  rotulo: string
  dica?: string
}>()
</script>

<template>
  <div class="campo-texto">
    <!-- O rótulo fica em cima, separado do campo em si -->
    <label v-if="rotulo" class="campo-rotulo">{{ rotulo }}</label>
    
    <!-- Repassa tudo pro Vuetify (placeholder, regras, v-model) -->
    <v-text-field
      v-bind="$attrs"
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
  color: var(--v-theme-on-surface); /* Puxa do Vuetify pra bater com o modo claro/escuro */
  margin-bottom: 4px;
  display: block;
}
</style>
