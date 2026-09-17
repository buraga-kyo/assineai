<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { TecladoCodigo } from '@assineai/ui'

const rota = useRoute()
const token = rota.params.token as string

// Tema da Empresa mockado pra teste
const temaEmpresa = ref({
  nome: 'Clínica Sol',
  corTema: '#0B5D3B' // O verde do cliente
})

const passoAtual = ref(0)
const otp = ref('')
const carregando = ref(false)

function irPraValidacao() {
  passoAtual.value = 1
}

function conferirCodigo(codigo: string) {
  carregando.value = true
  setTimeout(() => {
    carregando.value = false
    passoAtual.value = 2
  }, 800)
}

function concluirAssinatura() {
  carregando.value = true
  setTimeout(() => {
    carregando.value = false
    passoAtual.value = 3
  }, 1500)
}

function recusarAssinatura() {
  alert('Você recusou assinar o documento.')
}
</script>

<template>
  <!-- O body real teria a classe signatario, como estamos num SPA (Single Page App) 
       jogamos a classe no container principal para imitar a diretriz do design -->
  <div 
    class="signatario" 
    style="--cliente:#0B5D3B;--cliente-texto:#1B1B1B;--cliente-suave:#5C5C5C;--cliente-linha:#D9D9D9;--cliente-fundo:#FFFFFF;--fonte-cliente:Inter,system-ui,sans-serif; min-height: 100vh; display: grid; place-items: center;"
  >
    <main class="cartao-assinar">
      
      <div class="cabeca">
        <span class="marca-cliente"><i></i>{{ temaEmpresa.nome }}</span>
        <h2 v-if="passoAtual === 0">Maria, a {{ temaEmpresa.nome }} pede sua assinatura</h2>
        <h2 v-else-if="passoAtual === 1">Confirme sua identidade</h2>
        <h2 v-else-if="passoAtual === 2">Hora de assinar</h2>
        <h2 v-else-if="passoAtual === 3">Tudo pronto!</h2>
        
        <p v-if="passoAtual === 0" class="suave">Contrato de prestação de serviços, 3 páginas. Confira o documento para prosseguir.</p>
        <p v-if="passoAtual === 1" class="suave">Digite o código de 6 dígitos que chegou no seu WhatsApp/SMS.</p>
        <p v-if="passoAtual === 2" class="suave">Desenhe sua assinatura ou clique em assinar para usar uma digital gerada automaticamente.</p>
      </div>

      <!-- PASSO 0: LER PDF -->
      <div v-if="passoAtual === 0">
        <div class="previa mb-4">
          <h3>Contrato de prestação de serviços</h3>
          <p>Pelo presente instrumento, a Clínica Sol Serviços de Saúde Ltda., inscrita no CNPJ 12.345.678/0001-90, aqui chamada Contratada, e Maria Souza, CPF ***.482.***-**, aqui chamada Contratante, ajustam o que segue.</p>
          <p>1. Objeto. A Contratada prestará acompanhamento nutricional em 12 sessões mensais, presenciais ou por vídeo, conforme agenda combinada entre as partes.</p>
          <a href="#">Ver o PDF completo</a>
        </div>
        <div class="acoes mt-4">
          <a class="botao contorno" href="#" @click.prevent="recusarAssinatura">Recusar</a>
          <a class="botao primario" href="#" @click.prevent="irPraValidacao">Continuar</a>
        </div>
      </div>

      <!-- PASSO 1: VALIDAR CODIGO -->
      <div v-if="passoAtual === 1">
        <TecladoCodigo v-model="otp" @completou="conferirCodigo" />
        <div v-if="carregando" class="suave mt-2 text-center">Verificando...</div>
      </div>

      <!-- PASSO 2: ASSINAR DE FATO -->
      <div v-if="passoAtual === 2">
        <div style="height: 150px; border: 2px dashed var(--cliente-linha); border-radius: 8px; display: grid; place-items: center; margin-bottom: 16px;">
          <span class="suave">Área de rabisco</span>
        </div>
        <div class="acoes">
          <a class="botao contorno" href="#" @click.prevent="passoAtual = 1">Voltar</a>
          <a class="botao primario" href="#" @click.prevent="concluirAssinatura">
            {{ carregando ? 'Assinando...' : 'Assinar' }}
          </a>
        </div>
      </div>

      <!-- PASSO 3: SUCESSO -->
      <div v-if="passoAtual === 3">
        <div style="text-align: center; padding: 32px 0;">
          <svg style="width:64px; height:64px; color:var(--cliente); margin:0 auto 16px;" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          <h3 style="color:var(--cliente-texto); font-size:18px; margin-bottom:8px;">Documento Assinado</h3>
          <p class="suave">Uma cópia foi enviada para seu e-mail.</p>
        </div>
        <div class="acoes" style="grid-template-columns: 1fr;">
          <a class="botao primario" href="#">Baixar PDF Assinado</a>
        </div>
      </div>

      <p class="rodape-assineai mt-6">Assinado com <span class="marca">AssineAi</span></p>

    </main>
  </div>
</template>
