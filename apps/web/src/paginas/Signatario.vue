<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { TecladoCodigo, PassoAPasso } from '@assineai/ui'

const rota = useRoute()
const token = rota.params.token as string

// Tema da Empresa que chamou a gente (normalmente viria da API)
const temaEmpresa = ref({
  nome: 'Clínica Sol',
  corTema: '#0B5D3B' // Verde do roça neon por coincidencia
})

const passos = ['Ler PDF', 'Validar', 'Assinar', 'Pronto']
const passoAtual = ref(0)
const otp = ref('')
const carregando = ref(false)

// Simula a aceitacao do contrato
function irPraValidacao() {
  passoAtual.value = 1
}

// Simula conferir o OTP
function conferirCodigo(codigo: string) {
  carregando.value = true
  setTimeout(() => {
    carregando.value = false
    passoAtual.value = 2
  }, 800)
}

// Simula a assinatura em si (rabisco / digitada)
function concluirAssinatura() {
  carregando.value = true
  setTimeout(() => {
    carregando.value = false
    passoAtual.value = 3
  }, 1500)
}
</script>

<template>
  <v-app class="bg-surface">
    <!-- Layout Branco / Limpo focado no tema da empresa -->
    <v-app-bar flat :color="temaEmpresa.corTema" class="text-white">
      <v-toolbar-title class="font-weight-bold text-center w-100">
        {{ temaEmpresa.nome }}
      </v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-container class="px-4 py-8" style="max-width: 600px; margin: 0 auto;">
        
        <div class="mb-6">
          <PassoAPasso :passos="passos" :passoAtual="passoAtual" />
        </div>

        <!-- PASSO 0: LER PDF -->
        <div v-if="passoAtual === 0" class="text-center">
          <h2 class="text-h6 mb-4">Leia o documento antes de assinar</h2>
          
          <div class="pdf-container bg-surface-variant rounded mb-6 d-flex align-center justify-center">
            <v-icon icon="mdi-file-pdf-box" size="64" color="medium-emphasis"></v-icon>
            <span class="text-medium-emphasis ml-2">PDF renderiza aqui</span>
          </div>
          
          <v-btn block :color="temaEmpresa.corTema" size="large" class="text-white" @click="irPraValidacao">
            Li e aceito os termos
          </v-btn>
        </div>

        <!-- PASSO 1: VALIDAR CODIGO (SE O ENVELOPE EXIGIR) -->
        <div v-if="passoAtual === 1" class="text-center">
          <h2 class="text-h6 mb-2">Confirme sua identidade</h2>
          <p class="text-body-2 mb-4">Mandamos um código SMS/Zap pra você. Digita aí:</p>
          
          <TecladoCodigo v-model="otp" @completou="conferirCodigo" />
          
          <v-progress-circular v-if="carregando" indeterminate :color="temaEmpresa.corTema"></v-progress-circular>
        </div>

        <!-- PASSO 2: RABISCAR A ASSINATURA -->
        <div v-if="passoAtual === 2">
          <h2 class="text-h6 mb-4 text-center">Como quer assinar?</h2>
          
          <v-card class="pa-4 mb-4" variant="outlined">
            <p class="text-caption mb-2 text-center">Desenhe com o dedo</p>
            <div class="area-rabisco bg-surface-variant rounded mb-4 d-flex align-center justify-center">
              <v-icon icon="mdi-draw" size="32" class="opacity-50"></v-icon>
            </div>
          </v-card>
          
          <div class="d-flex align-center justify-space-between mt-6">
            <v-btn variant="text" @click="passoAtual = 1">Voltar</v-btn>
            <v-btn :color="temaEmpresa.corTema" :loading="carregando" class="text-white" @click="concluirAssinatura">
              Assinar Documento
            </v-btn>
          </div>
        </div>

        <!-- PASSO 3: SUCESSO E DOWNLOAD -->
        <div v-if="passoAtual === 3" class="text-center py-8">
          <v-icon icon="mdi-check-circle" color="success" size="80" class="mb-4"></v-icon>
          <h2 class="text-h5 font-weight-bold mb-2">Documento Assinado!</h2>
          <p class="text-body-2 text-medium-emphasis mb-8">Sua assinatura foi registrada com sucesso.</p>
          
          <v-btn block color="primary" variant="outlined" prepend-icon="mdi-download" class="mb-4">
            Baixar PDF Assinado
          </v-btn>
          
          <v-btn block variant="text" color="primary" prepend-icon="mdi-shield-check" :to="{ name: 'verificacao', params: { codigo: 'ENV-123' } }">
            Verificar Autenticidade
          </v-btn>
        </div>

      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.pdf-container {
  height: 60vh;
  border: 1px solid var(--v-theme-outline);
}
.area-rabisco {
  height: 200px;
  border: 2px dashed var(--v-theme-outline);
}
</style>
