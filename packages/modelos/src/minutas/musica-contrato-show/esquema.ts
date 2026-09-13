import { z } from 'zod'

export const esquema = z.object({
  contratanteNome: z.string().describe('Nome do Contratante (Casa de Show, Produtor)'),
  contratanteDoc: z.string().describe('CPF ou CNPJ do Contratante'),
  artistaNome: z.string().describe('Nome Artístico ou da Banda'),
  representanteNome: z.string().describe('Nome do representante legal do artista'),
  representanteDoc: z.string().describe('CPF ou CNPJ do representante'),
  dataHora: z.string().describe('Data e horário da apresentação'),
  local: z.string().describe('Endereço do local da apresentação'),
  cache: z.string().describe('Valor do cachê (ex: R$ 2.000,00)'),
  condicoesPagamento: z.string().describe('Como será pago (ex: 50% no ato, 50% no dia do show)')
})
