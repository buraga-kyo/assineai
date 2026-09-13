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
      name: 'landing',
      component: () => import('../paginas/Landing.vue'),
      meta: { publico: true }
    },
    {
      path: '/painel',
      name: 'painel',
      component: () => import('../paginas/Painel.vue')
    },
    {
      path: '/envelopes',
      name: 'envelopes',
      component: () => import('../paginas/Envelopes.vue')
    },
    {
      path: '/envelopes/novo',
      name: 'novo-envelope',
      component: () => import('../paginas/NovoEnvelope.vue')
    },
    {
      path: '/envelopes/:id',
      name: 'envelope-detalhe',
      component: () => import('../paginas/EnvelopeDetalhe.vue')
    },
    {
      path: '/estudio',
      name: 'estudio',
      component: () => import('../paginas/EstudioMarca.vue')
    },
    {
      path: '/editor',
      name: 'editor',
      component: () => import('../paginas/EditorDocumento.vue')
    },
    {
      path: '/contatos',
      name: 'contatos',
      component: () => import('../paginas/Contatos.vue')
    },
    {
      path: '/inbox',
      name: 'inbox',
      component: () => import('../paginas/Inbox.vue')
    },
    {
      path: '/copiloto',
      name: 'copiloto',
      component: () => import('../paginas/Copiloto.vue')
    },
    {
      path: '/galeria',
      name: 'galeria-temas',
      component: () => import('../paginas/GaleriaTemas.vue')
    },
    {
      path: '/assinar/:token',
      name: 'assinar',
      component: () => import('../paginas/Signatario.vue'),
      meta: { publico: true }
    },
    {
      path: '/v/:codigo',
      name: 'verificacao',
      component: () => import('../paginas/Verificacao.vue'),
      meta: { publico: true }
    },
    {
      path: '/obras',
      name: 'obras',
      component: () => import('../paginas/Obras.vue')
    },
    {
      path: '/guia',
      name: 'guia-artista',
      component: () => import('../paginas/GuiaArtista.vue')
    },
    {
      path: '/o/:codigo',
      name: 'obra-publica',
      component: () => import('../paginas/ObraPublica.vue'),
      meta: { publico: true }
    }
  ]
})

// Guarda global
roteador.beforeEach(async (destino) => {
  const sessao = useStoreSessao()
  
  if (!destino.meta.publico && !sessao.autenticado) {
    const aindaTemSessao = await sessao.verificarSessao()
    if (!aindaTemSessao) {
      return { name: 'entrar' }
    }
  }
})
