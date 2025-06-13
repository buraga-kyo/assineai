const dataAtualFormatada = require('../dataAtualFormatada');

test('retorna data no formato DD/MM/YYYY às HHhMMmin', () => {
  const resultado = dataAtualFormatada();
  expect(resultado).toMatch(/^\d{2}\/\d{2}\/\d{4} às \d{2}h\d{2}min$/);
});
