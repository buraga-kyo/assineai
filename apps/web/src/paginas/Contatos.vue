<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { CampoTexto, BotaoFechar } from '@assineai/ui'

const roteador = useRouter()
const busca = ref('')
const carregando = ref(false)

const contatos = ref<any[]>([])

async function carregarContatos() {
  carregando.value = true
  try {
    const url = busca.value ? `/api/contatos/buscar?q=${encodeURIComponent(busca.value)}` : '/api/contatos'
    const res = await fetch(url)
    if (res.ok) {
      contatos.value = await res.json()
    }
  } finally {
    carregando.value = false
  }
}

onMounted(() => {
  carregarContatos()
})

let timeoutBusca: ReturnType<typeof setTimeout>
watch(busca, () => {
  clearTimeout(timeoutBusca)
  timeoutBusca = setTimeout(() => {
    carregarContatos()
  }, 500)
})
</script>

<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-6 mt-4">
      <h1 class="text-h4 font-weight-black">Contatos</h1>
      <v-btn color="primary">Novo Contato</v-btn>
    </div>

    <v-card class="pa-4 mb-6 bg-surface-variant" variant="flat">
      <v-row align="center">
        <v-col cols="12" md="8">
          <CampoTexto v-model="busca" rotulo="" placeholder="Buscar por nome, email ou telefone" prepend-inner-icon="mdi-magnify" hide-details />
        </v-col>
      </v-row>
    </v-card>

    <div v-if="carregando" class="text-center pa-8">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <div v-else-if="contatos.length === 0" class="text-center pa-8 text-medium-emphasis">
      Nenhum contato encontrado.
    </div>

    <div v-else v-for="contato in contatos" :key="contato.id" class="mb-4">
      <v-card variant="outlined" class="pa-4 cursor-pointer" @click="() => {}">
        <div class="d-flex justify-space-between align-center">
          <div>
            <h3 class="text-h6 font-weight-bold" :class="{'text-medium-emphasis text-decoration-line-through': contato.lgpdApagado}">{{ contato.nome }}</h3>
            <div class="text-caption text-medium-emphasis">
              <span v-if="contato.email"><v-icon size="small" class="mr-1">mdi-email</v-icon>{{ contato.email }}</span>
              <span v-if="contato.telefone" class="ml-4"><v-icon size="small" class="mr-1">mdi-phone</v-icon>{{ contato.telefone }}</span>
            </div>
          </div>
          <div v-if="contato.etiquetas">
            <v-chip v-for="(eti, i) in contato.etiquetas" :key="i" :color="eti.cor" size="small" variant="flat" class="text-white">{{ eti.nome }}</v-chip>
          </div>
        </div>
      </v-card>
    </div>
  </v-container>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
