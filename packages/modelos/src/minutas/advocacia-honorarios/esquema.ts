import { z } from 'zod'

export const esquema = z.object({
  contratanteNome: z.string().describe('Nome completo ou Razão Social do cliente'),
  contratanteDocumento: z.string().describe('CPF ou CNPJ do cliente'),
  contratadoNome: z.string().describe('Nome do advogado ou escritório'),
  contratadoOab: z.string().describe('Número de inscrição na OAB'),
  valorTotal: z.string().describe('Valor total dos honorários, ex: R$ 5.000,00'),
  foro: z.string().describe('Comarca para eleição de foro')
})
