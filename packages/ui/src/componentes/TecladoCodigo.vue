<script setup lang="ts">
// Teclado virtual/input pra código OTP (6 dígitos).
// Usa a prop 'model-value' pra fazer o v-model funcionar direitinho.
import { ref, watch, nextTick } from 'vue'

const propriedades = defineProps<{
  modelValue: string
}>()

const emite = defineEmits(['update:modelValue', 'completou'])

const digitosOtp = ref(['', '', '', '', '', ''])
const inputRefs = ref<HTMLInputElement[]>([])

// Quando a propriedade modelValue muda por fora, a gente atualiza os quadradinhos
watch(() => propriedades.modelValue, (valorNovo) => {
  if (!valorNovo) {
    digitosOtp.value = ['', '', '', '', '', '']
    return
  }
  
  const caracteres = valorNovo.split('').slice(0, 6)
  caracteres.forEach((char, i) => {
    digitosOtp.value[i] = char
  })
}, { immediate: true })

function aoDigitar(evento: Event, indice: number) {
  const elemento = evento.target as HTMLInputElement
  const valorDigitado = elemento.value
  
  // Pega só o último número se o cara digitar muito rápido
  digitosOtp.value[indice] = valorDigitado.slice(-1)
  
  // Emite o valor atualizado inteiro
  const valorCompleto = digitosOtp.value.join('')
  emite('update:modelValue', valorCompleto)
  
  // Se preencheu e não for o último, pula pro próximo
  if (valorDigitado && indice < 5) {
    nextTick(() => {
      inputRefs.value[indice + 1]?.focus()
    })
  }

  // Se completou os 6, avisa o pai
  if (valorCompleto.length === 6) {
    emite('completou', valorCompleto)
  }
}

function aoApertarBackspace(evento: KeyboardEvent, indice: number) {
  if (evento.key === 'Backspace' && !digitosOtp.value[indice] && indice > 0) {
    nextTick(() => {
      inputRefs.value[indice - 1]?.focus()
    })
  }
}

function colarCodigo(evento: ClipboardEvent) {
  evento.preventDefault()
  const textoColado = evento.clipboardData?.getData('text')?.replace(/\D/g, '').slice(0, 6)
  
  if (textoColado) {
    textoColado.split('').forEach((char, i) => {
      digitosOtp.value[i] = char
    })
    const valorCompleto = digitosOtp.value.join('')
    emite('update:modelValue', valorCompleto)
    
    if (valorCompleto.length === 6) {
      emite('completou', valorCompleto)
      inputRefs.value[5]?.focus()
    } else {
      inputRefs.value[valorCompleto.length]?.focus()
    }
  }
}
</script>

<template>
  <div class="teclado-codigo d-flex justify-center gap-2 my-4">
    <input
      v-for="(_, indice) in digitosOtp"
      :key="indice"
      ref="inputRefs"
      v-model="digitosOtp[indice]"
      type="text"
      inputmode="numeric"
      maxlength="2"
      class="caixa-digito text-center text-h5 font-weight-bold"
      @input="aoDigitar($event, indice)"
      @keydown="aoApertarBackspace($event, indice)"
      @paste="colarCodigo"
    />
  </div>
</template>

<style scoped>
.caixa-digito {
  width: 48px;
  height: 56px;
  border: 2px solid var(--v-theme-surface-variant);
  border-radius: 8px;
  background-color: var(--v-theme-surface);
  color: var(--v-theme-on-surface);
  outline: none;
  transition: border-color 0.2s;
  box-shadow: none;
}
.caixa-digito:focus {
  border-color: var(--v-theme-primary);
}
</style>
