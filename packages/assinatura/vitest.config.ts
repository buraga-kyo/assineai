import { defineConfig } from 'vitest/config'

// Cada selagem sobe uma JVM (uns 2 s); o padrão de 5 s do vitest fica curto para as suítes com java.
export default defineConfig({
  test: { include: ['test/**/*.test.ts'], testTimeout: 30_000 },
})
