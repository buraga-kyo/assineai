import { createRouter, createWebHistory } from 'vue-router'
import { useStoreSessao } from '../store/sessao'

export const roteador = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/entrar',
      name: 'entrar',
      component: () => import('../paginas/Entrar.vue'),
      meta: { publico: true }
    },
    {
      path: '/',
      name: 'painel',
      component: () => import('../paginas/Painel.vue')
    },
    {
      path: '/envelopes',
      name: 'envelopes',
      component: () => import('../paginas/Envelopes.vue')
    },
    {
      path: '/envelopes/:id',
      name: 'envelope-detalhe',
      component: () => import('../paginas/EnvelopeDetalhe.vue')
    }
  ]
})

// Guarda global: se a rota não for pública e o cara não tiver sessão, manda pro login
roteador.beforeEach(async (destino) => {
  const sessao = useStoreSessao()
  
  if (!destino.meta.publico && !sessao.autenticado) {
    // Tenta bater na API pra ver se o cookie de sessão tá válido
    const aindaTemSessao = await sessao.verificarSessao()
    if (!aindaTemSessao) {
      return { name: 'entrar' }
    }
  }
})
