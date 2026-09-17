<script setup lang="ts">
// Vitrine pra gente bater o olho em todos os componentes de uma vez.
import { ref } from 'vue'
import {
  CampoTexto,
  CampoSelecao,
  CampoCombo,
  CampoDataHora,
  PassoAPasso,
  GrupoAtributos,
  BotaoFechar,
  CartaoEnvelope,
  ChipCanal,
  LinhaDoTempoEvidencias,
  TecladoCodigo
} from '../src/index'

const temaEscuro = ref(false)
const otp = ref('123')
</script>

<template>
  <v-app :theme="temaEscuro ? 'dark' : 'temaRocaNeonClaro'">
    <v-main class="bg-background">
      <v-container>
        <div class="d-flex justify-space-between align-center mb-8">
          <h1 class="text-h3 font-weight-black">Vitrine Roça Neon</h1>
          <v-switch v-model="temaEscuro" label="Modo Escuro" hide-details></v-switch>
        </div>

        <v-row>
          <v-col cols="12" md="6">
            <h2 class="text-h5 mb-4 font-weight-bold text-primary">Formulários Base</h2>
            <v-card class="pa-4 mb-4" variant="outlined">
              <CampoTexto rotulo="Nome completo" dica="Igual tá no RG" />
              <CampoSelecao rotulo="Profissão" :items="['Produtor', 'Agrônomo', 'Artista']" dica="Escolhe aí" class="mt-4" />
              <CampoCombo rotulo="Habilidade" :items="['Trator', 'Violão']" dica="Ou digita outra" class="mt-4" />
              <CampoDataHora rotulo="Data de Nascimento" class="mt-4" />
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <h2 class="text-h5 mb-4 font-weight-bold text-secondary">Componentes de Domínio</h2>
            
            <v-card class="pa-4 mb-4" variant="outlined" style="position: relative;">
              <BotaoFechar @clicou="() => {}" />
              <h3 class="text-h6 mb-3">Cartão de Envelope</h3>
              <CartaoEnvelope
                codigo="ENV-123"
                titulo="Contrato de Arrendamento Sítio 2"
                estado="pendente"
                prazo="10/10/2026"
                :signatarios="[{ nome: 'João', canal: 'whatsapp' }, { nome: 'Maria', canal: 'email' }]"
              />
            </v-card>

            <v-card class="pa-4 mb-4" variant="outlined">
              <h3 class="text-h6 mb-3">Linha do Tempo</h3>
              <LinhaDoTempoEvidencias
                :eventos="[
                  { data: '12/09/2026', hora: '10:00', titulo: 'Envelope Criado', sucesso: true },
                  { data: '12/09/2026', hora: '10:05', titulo: 'Erro no Envio', detalhe: 'WhatsApp fora do ar', sucesso: false }
                ]"
              />
            </v-card>

            <v-card class="pa-4" variant="outlined">
              <h3 class="text-h6 mb-3">Teclado de Código (OTP)</h3>
              <TecladoCodigo v-model="otp" />
              <p class="text-center text-caption mt-2">Valor atual: {{ otp }}</p>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mt-8">
          <v-col cols="12">
            <h2 class="text-h5 mb-4 font-weight-bold">Fluxo e Dados</h2>
            <v-card class="pa-4 mb-4" variant="outlined">
              <PassoAPasso
                :passos="['Documento', 'Assinantes', 'Campos', 'Pronto']"
                :passo-atual="2"
              />
            </v-card>

            <v-card class="pa-4" variant="outlined">
              <v-row>
                <v-col cols="6">
                  <GrupoAtributos titulo="Chave Pública" valor="0x123...456" />
                </v-col>
                <v-col cols="6">
                  <GrupoAtributos titulo="Hash do Documento" valor="8f4e...2b1a" />
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
