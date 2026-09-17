import { test, expect } from '@playwright/test';

test.describe('Fluxo Completo - Roça Neon', () => {
  const email = `teste+${Date.now()}@e2e.com`;
  const senha = 'senhaSegura123';

  test('Deve criar uma conta, deslogar e logar via senha, e testar painel', async ({ page }) => {
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log(`<< ${response.status()} ${response.url()}`);
      }
    });

    // 1. Cadastro
    await page.goto('/cadastro');
    await expect(page).toHaveTitle(/AssineAi/);
    
    // Preencher o formulário
    await page.fill('input[placeholder="Ex: Minha Empresa Ltda."]', 'Empresa E2E');
    await page.fill('input[placeholder="Ex: Matheus Braga"]', 'Senhor E2E');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', senha);
    
    // Submeter
    await page.click('button:has-text("Criar Minha Conta")');
    
    // Verifica se deu erro
    const deuErro = await page.locator('.bg-error').isVisible({ timeout: 2000 }).catch(() => false);
    if (deuErro) {
      const msgErro = await page.locator('.bg-error').innerText();
      throw new Error(`Erro na interface: ${msgErro}`);
    }

    // Deve redirecionar para a tela de entrar
    await page.waitForURL('**/entrar*');
    
    // 2. Login
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', senha);
    await page.click('button:has-text("Entrar")');
    
    // 3. Painel (Envelopes)
    await page.waitForURL('**/envelopes');
    await expect(page.locator('text=Mandar para assinar')).toBeVisible({ timeout: 10000 });

    // 4. Fluxo básico do "Roça Neon" testado com sucesso
    console.log('Teste E2E do Roça Neon aprovado!');
  });
});
