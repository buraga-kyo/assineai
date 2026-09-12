<script setup lang="ts">
// Agrupa rótulo e valor pra mostrar detalhes (ex: remetente, data, etc)
// Simples e limpo.
defineProps<{
  titulo: string
  valor: string
}>()
</script>

<template>
  <div class="grupo-atributos mb-2">
    <div class="titulo text-caption text-medium-emphasis">{{ titulo }}</div>
    <div class="valor text-body-1">{{ valor }}</div>
  </div>
</template>
