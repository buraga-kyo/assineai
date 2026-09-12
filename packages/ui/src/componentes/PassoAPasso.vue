<script setup lang="ts">
// Passo a passo (stepper) visual
defineProps<{
  passos: string[]
  passoAtual: number // índice 0 a N
}>()
</script>

<template>
  <div class="passo-a-passo d-flex align-center">
    <template v-for="(nomeDoPasso, indiceDoPasso) in passos" :key="indiceDoPasso">
      <!-- O círculo do passo -->
      <div 
        class="circulo-passo d-flex align-center justify-center text-caption font-weight-bold"
        :class="{ 'ativo': indiceDoPasso === passoAtual, 'concluido': indiceDoPasso < passoAtual }"
      >
        <v-icon v-if="indiceDoPasso < passoAtual" icon="mdi-check" size="16"></v-icon>
        <span v-else>{{ indiceDoPasso + 1 }}</span>
      </div>
      
      <!-- O nome do passo (esconde no celular pra economizar espaço) -->
      <span class="nome-passo ml-2 mr-4 d-none d-sm-inline" :class="{ 'text-primary font-weight-bold': indiceDoPasso === passoAtual }">
        {{ nomeDoPasso }}
      </span>

      <!-- A linha conectora -->
      <div v-if="indiceDoPasso < passos.length - 1" class="linha-conectora flex-grow-1 mx-2" :class="{ 'bg-primary': indiceDoPasso < passoAtual }"></div>
    </template>
  </div>
</template>

<style scoped>
.circulo-passo {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: var(--v-theme-surface-variant);
  color: var(--v-theme-on-surface-variant);
  transition: all 0.2s;
}
.circulo-passo.ativo {
  background-color: var(--v-theme-primary);
  color: var(--v-theme-on-primary);
}
.circulo-passo.concluido {
  background-color: var(--v-theme-success);
  color: var(--v-theme-on-success);
}
.linha-conectora {
  height: 2px;
  background-color: var(--v-theme-surface-variant);
}
</style>
