<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { CampoTexto, BotaoFechar } from '@assineai/ui'

const roteador = useRouter()
const busca = ref('')

const contatos = ref([
  { id: '1', nome: 'João da Silva', email: 'joao@fazenda.com', telefone: '5511999999999', etiquetas: [{ nome: 'Produtor', cor: '#0B5D3B' }] }
])
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

    <div v-for="contato in contatos" :key="contato.id" class="mb-4">
      <v-card variant="outlined" class="pa-4 cursor-pointer" @click="() => {}">
        <div class="d-flex justify-space-between align-center">
          <div>
            <h3 class="text-h6 font-weight-bold">{{ contato.nome }}</h3>
            <div class="text-caption text-medium-emphasis">
              <span v-if="contato.email"><v-icon size="small" class="mr-1">mdi-email</v-icon>{{ contato.email }}</span>
              <span v-if="contato.telefone" class="ml-4"><v-icon size="small" class="mr-1">mdi-phone</v-icon>{{ contato.telefone }}</span>
            </div>
          </div>
          <div>
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
