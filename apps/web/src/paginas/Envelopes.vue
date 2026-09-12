<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreEnvelopes } from '../store/envelopes'
import { CartaoEnvelope, CampoTexto, CampoSelecao } from '@assineai/ui'

const store = useStoreEnvelopes()
const roteador = useRouter()

const filtroEstado = ref('Todos')
const termoBusca = ref('')

onMounted(() => {
  store.carregarLista()
})

function irParaDetalhe(id: string) {
  roteador.push({ name: 'envelope-detalhe', params: { id } })
}
</script>

<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-6 mt-4">
      <h1 class="text-h4 font-weight-black">Meus Envelopes</h1>
      <v-btn color="primary" @click="roteador.push({ name: 'novo-envelope' })">Novo Envelope</v-btn>
    </div>

    <v-card class="pa-4 mb-6 bg-surface-variant" variant="flat">
      <v-row align="center">
        <v-col cols="12" md="6">
          <CampoTexto v-model="termoBusca" rotulo="" placeholder="Buscar por título ou código" prepend-inner-icon="mdi-magnify" hide-details />
        </v-col>
        <v-col cols="12" md="4">
          <CampoSelecao v-model="filtroEstado" rotulo="" :items="['Todos', 'Pendentes', 'Concluídos', 'Cancelados']" hide-details />
        </v-col>
      </v-row>
    </v-card>

    <div v-if="store.carregando" class="text-center pa-8">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <div v-else-if="store.lista.length === 0" class="text-center pa-8 text-medium-emphasis">
      Nenhum envelope encontrado.
    </div>

    <div v-else>
      <div 
        v-for="env in store.lista" 
        :key="env.id"
        class="cursor-pointer"
        @click="irParaDetalhe(env.id)"
      >
        <CartaoEnvelope
          :codigo="env.codigo"
          :titulo="env.titulo"
          :estado="env.estado"
          :prazo="env.prazo"
          :signatarios="env.signatarios"
        />
      </div>
    </div>
  </v-container>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
