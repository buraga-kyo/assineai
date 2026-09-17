<script setup lang="ts">
defineProps<{
  codigo: string
  titulo: string
  estado: string // 'rascunho' | 'pendente' | 'concluido' | 'cancelado' (vem do backend)
  prazo?: string | undefined
  signatarios: Array<{ nome: string, canal: 'email' | 'whatsapp' | 'slack' | 'telegram' }>
}>()

function iniciais(nome: string) {
  const pedacos = nome.split(' ').filter(Boolean)
  if (pedacos.length === 0) return '??'
  if (pedacos.length === 1) return (pedacos[0] || '').substring(0, 2).toUpperCase()
  const p1 = pedacos[0] || ''
  const p2 = pedacos[pedacos.length - 1] || ''
  return ((p1[0] || '') + (p2[0] || '')).toUpperCase()
}

function classeEstado(estadoEnvelope: string) {
  switch (estadoEnvelope) {
    case 'concluido': return 'selado'
    case 'pendente': return 'aguardando'
    case 'cancelado': return 'recusado'
    case 'expirado': return 'expirado'
    case 'parcial': return 'parcial'
    default: return 'aguardando'
  }
}

function rotuloEstado(estadoEnvelope: string) {
  switch (estadoEnvelope) {
    case 'concluido': return 'Selado'
    case 'pendente': return 'Aguardando'
    case 'cancelado': return 'Recusado'
    case 'expirado': return 'Expirado'
    default: return estadoEnvelope
  }
}
</script>

<template>
  <article :class="['cartao', classeEstado(estado)]">
    <h2>{{ titulo }}</h2>
    <span class="chip estado">{{ rotuloEstado(estado) }}</span>
    <div class="assinantes">
      <span v-for="(sig, indice) in signatarios" :key="indice" class="pessoa">
        <b class="avatar">{{ iniciais(sig.nome) }}</b>
        {{ sig.nome }} 
        <span :class="['canal', sig.canal]">{{ sig.canal }}</span>
      </span>
    </div>
    <span v-if="prazo" class="prazo">{{ prazo }}</span>
  </article>
</template>
