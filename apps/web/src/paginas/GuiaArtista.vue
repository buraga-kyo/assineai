<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const roteador = useRouter()

const passos = ref([
  {
    id: 1,
    titulo: '1. Prova de Anterioridade',
    oQueE: 'O registro de que a música (letra ou áudio) existia naquela data.',
    onde: 'Aqui mesmo no AssineAi (Menu Obras).',
    custo: 'Gratuito',
    oqLevar: 'O arquivo MP3, WAV ou PDF da letra.',
    ajuda: 'Use nosso sistema de ancoragem no Bitcoin.',
    feito: true
  },
  {
    id: 2,
    titulo: '2. Registro na Biblioteca Nacional (EDA)',
    oQueE: 'O registro oficial da letra e partitura pelo Governo Federal.',
    onde: 'Site da Biblioteca Nacional (Gov.br).',
    custo: 'R$ 20 a R$ 80',
    oqLevar: 'Partitura, letra, RG, CPF e o formulário preenchido.',
    ajuda: 'Você já tem a prova de anterioridade nossa, mas o EDA é a via tradicional.',
    feito: false
  },
  {
    id: 3,
    titulo: '3. Divisão de Autoria (Split Sheet)',
    oQueE: 'O acordo por escrito de quanto cada autor tem da música.',
    onde: 'Aqui no AssineAi (Menu Copiloto ou Envelopes).',
    custo: 'Gratuito',
    oqLevar: 'Nome, CPF e porcentagem de cada autor.',
    ajuda: 'Use a nossa minuta "Divisão de Autoria (Split Sheet)".',
    feito: false
  },
  {
    id: 4,
    titulo: '4. Filiação em Associação (UBC, Abramus)',
    oQueE: 'A associação que vai arrecadar seus direitos no ECAD.',
    onde: 'Site da UBC, Abramus, Amar, etc.',
    custo: 'Gratuito na maioria.',
    oqLevar: 'RG, CPF, comprovante de residência e repertório.',
    ajuda: 'Use a nossa "Ficha de Filiação" se a associação exigir documento assinado.',
    feito: false
  },
  {
    id: 5,
    titulo: '5. Geração de ISRC',
    oQueE: 'A placa da música. O código único da gravação.',
    onde: 'No portal da sua Associação (Sisrc) ou pela Distribuidora.',
    custo: 'Gratuito.',
    oqLevar: 'O áudio finalizado (master) e a lista de músicos e produtores.',
    ajuda: 'Gere o ISRC antes de mandar a música para o Spotify.',
    feito: false
  },
  {
    id: 6,
    titulo: '6. Distribuição Digital',
    oQueE: 'Colocar a música no Spotify, Apple Music, TikTok, etc.',
    onde: 'Distribuidoras como ONErpm, CD Baby, TuneCore, Tratore.',
    custo: 'Taxa fixa ou porcentagem dos royalties.',
    oqLevar: 'Áudio master, capa (1600x1600), ISRC e dados dos autores.',
    ajuda: 'Guarde bem o ISRC gerado por eles se não tiver feito o seu.',
    feito: false
  },
  {
    id: 7,
    titulo: '7. Registro de Marca no INPI',
    oQueE: 'O registro oficial do nome da sua banda ou nome artístico.',
    onde: 'Site do INPI (Gov.br).',
    custo: 'Cerca de R$ 142 para registrar e R$ 298 para o decênio.',
    oqLevar: 'Logo, RG, CPF e pagamento da GRU.',
    ajuda: 'Demora até um ano para sair o certificado, faça o quanto antes.',
    feito: false
  }
])

function alternarPasso(id: number) {
  const passo = passos.value.find(p => p.id === id)
  if (passo) {
    passo.feito = !passo.feito
  }
}
</script>

<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-6 mt-4">
      <h1 class="text-h4 font-weight-black">Guia de Direitos do Artista</h1>
    </div>

    <v-card class="pa-4 mb-6 bg-surface-variant" variant="flat">
      <p class="text-body-1 text-medium-emphasis">
        O mapa completo para não perder dinheiro nem direito autoral. Siga os passos abaixo, entenda o que cada órgão faz e como as ferramentas do AssineAi te ajudam no caminho.
      </p>
    </v-card>

    <div v-for="passo in passos" :key="passo.id" class="mb-4">
      <v-card variant="outlined" class="pa-0">
        <div 
          class="d-flex align-center pa-4 cursor-pointer" 
          :class="passo.feito ? 'bg-success-lighten-4' : 'bg-surface'"
          @click="alternarPasso(passo.id)"
        >
          <v-checkbox-btn 
            v-model="passo.feito" 
            color="success" 
            class="mr-4" 
            @click.stop="alternarPasso(passo.id)"
          ></v-checkbox-btn>
          <div class="flex-grow-1">
            <h2 class="text-h6 font-weight-bold" :class="passo.feito ? 'text-decoration-line-through opacity-70' : ''">
              {{ passo.titulo }}
            </h2>
          </div>
          <v-icon :icon="passo.feito ? 'mdi-chevron-down' : 'mdi-chevron-left'"></v-icon>
        </div>
        
        <v-expand-transition>
          <div v-if="!passo.feito" class="pa-4 border-t bg-surface">
            <div class="mb-3">
              <strong class="text-primary">O que é:</strong> {{ passo.oQueE }}
            </div>
            <div class="mb-3">
              <strong class="text-primary">Onde faz:</strong> {{ passo.onde }}
            </div>
            <div class="mb-3">
              <strong class="text-primary">Custo médio:</strong> {{ passo.custo }}
            </div>
            <div class="mb-3">
              <strong class="text-primary">O que levar:</strong> {{ passo.oqLevar }}
            </div>
            <div class="mt-4 pa-3 bg-surface-variant rounded">
              <v-icon icon="mdi-lightbulb-on" color="warning" size="small" class="mr-1"></v-icon>
              <strong>Dica AssineAi:</strong> {{ passo.ajuda }}
            </div>
          </div>
        </v-expand-transition>
      </v-card>
    </div>
  </v-container>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.bg-success-lighten-4 {
  background-color: rgba(76, 175, 80, 0.1);
}
</style>
