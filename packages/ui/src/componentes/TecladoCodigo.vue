<script setup lang="ts">
import { ref, watch } from 'vue'

const propriedades = defineProps<{
  modelValue: string
}>()

const emite = defineEmits(['update:modelValue', 'completou'])

const digitosOtp = ref(['', '', '', '', '', ''])

watch(() => propriedades.modelValue, (valorNovo) => {
  if (!valorNovo) {
    digitosOtp.value = ['', '', '', '', '', '']
    return
  }
  const caracteres = valorNovo.split('').slice(0, 6)
  for (let indice = 0; indice < 6; indice++) {
    digitosOtp.value[indice] = caracteres[indice] || ''
  }
}, { immediate: true })

function digitarNumero(numero: string) {
  const indiceVazio = digitosOtp.value.findIndex(d => d === '')
  if (indiceVazio !== -1) {
    digitosOtp.value[indiceVazio] = numero
    emitirAlteracao()
  }
}

function apagarNumero() {
  for (let indice = 5; indice >= 0; indice--) {
    if (digitosOtp.value[indice] !== '') {
      digitosOtp.value[indice] = ''
      emitirAlteracao()
      break
    }
  }
}

function emitirAlteracao() {
  const valorCompleto = digitosOtp.value.join('')
  emite('update:modelValue', valorCompleto)
  if (valorCompleto.length === 6) {
    emite('completou', valorCompleto)
  }
}
</script>

<template>
  <div class="modulo-codigo">
    <div class="codigo mb-4">
      <b 
        v-for="(digito, indice) in digitosOtp" 
        :key="indice" 
        :class="{ 'cheio': digito !== '' }"
      >{{ digito }}</b>
    </div>
    
    <div class="teclado mt-2">
      <b @click="digitarNumero('1')">1</b>
      <b @click="digitarNumero('2')">2</b>
      <b @click="digitarNumero('3')">3</b>
      <b @click="digitarNumero('4')">4</b>
      <b @click="digitarNumero('5')">5</b>
      <b @click="digitarNumero('6')">6</b>
      <b @click="digitarNumero('7')">7</b>
      <b @click="digitarNumero('8')">8</b>
      <b @click="digitarNumero('9')">9</b>
      <b></b>
      <b @click="digitarNumero('0')">0</b>
      <b @click="apagarNumero">
        <svg viewBox="0 0 24 24"><path d="M9 5h12v14H9l-6-7z"/><path d="m12 9 6 6M18 9l-6 6"/></svg>
      </b>
    </div>
  </div>
</template>

<style scoped>
/* O CSS já vem globalmente do base.css e roca-neon.css */
.teclado b {
  cursor: pointer;
  user-select: none;
}
.teclado b:active {
  transform: translateY(2px);
  box-shadow: 1px 1px 0 var(--cliente-linha);
}
</style>
