import { describe, expect, test } from 'vitest'
import { redigir } from '../src/index.js'

describe('redigir', () => {
  test('troca a senha por [redigido] em todas as ocorrências', () => {
    expect(redigir('senha=abc123 e de novo abc123', 'abc123')).toBe(
      'senha=[redigido] e de novo [redigido]',
    )
  })
  test('aceita várias senhas e ignora vazia ou ausente', () => {
    expect(redigir('a=um b=dois', ['um', '', undefined, 'dois'])).toBe('a=[redigido] b=[redigido]')
    expect(redigir('nada a ver', '')).toBe('nada a ver')
  })
})
