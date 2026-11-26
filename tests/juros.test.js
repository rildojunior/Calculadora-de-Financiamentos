// Testes do Cálculo de Juros Bruto.  Executar com:  node tests/juros.test.js
const assert = require('assert')
const { calcularJuros, jrHoje } = require('../juros.js')

let falhas = 0
function caso(nome, fn) {
  try { fn(); console.log('OK    ' + nome) }
  catch (e) { falhas++; console.log('FALHA ' + nome + '\n      ' + e.message) }
}

// Casos confirmados em 26/11/2026: capital 500,00 a 5% a.m., data inicial 26/11/2026
const novos = [
  ['2028-11-26', 1641.66, 1141.66, 731],
  ['2027-05-18',  662.47,  162.47, 173],
]
for (const [fim, montante, juros, dias] of novos) {
  caso(`500,00 de 26/11/2026 a ${fim.split('-').reverse().join('/')} a 5% = ${montante.toFixed(2)} (juros ${juros.toFixed(2)})`, () => {
    const r = calcularJuros(500, 5, '2026-11-26', fim)
    assert.strictEqual(r.erro, undefined)
    assert.strictEqual(r.diasCorridos, dias)
    assert.strictEqual(r.montante.toFixed(2), montante.toFixed(2), `obtido ${r.montante.toFixed(2)}`)
    assert.strictEqual(r.juros.toFixed(2), juros.toFixed(2), `obtido ${r.juros.toFixed(2)}`)
  })
}

// Confirmado na ferramenta de referência: 1 mês a 5% arredonda para cima (2.100,01, não 2.100,00)
caso('2.000,00 de 26/11/2026 a 26/12/2026 a 5% = 2100.01', () => {
  const r = calcularJuros(2000, 5, '2026-11-26', '2026-12-26')
  assert.strictEqual(r.diasCorridos, 30)
  assert.strictEqual(r.montante.toFixed(2), '2100.01', `obtido ${r.montante.toFixed(2)}`)
})

caso('dias corridos 18/11/2026 → 26/11/2026 = 8', () => {
  assert.strictEqual(calcularJuros(2000, 5, '2026-11-18', '2026-11-26').diasCorridos, 8)
})
caso('resultado traz só montante, juros e dias corridos', () => {
  assert.deepStrictEqual(Object.keys(calcularJuros(500, 5, '2026-11-26', '2027-05-18')).sort(), ['diasCorridos', 'juros', 'montante'])
})
caso('jrHoje usa a data local no formato AAAA-MM-DD', () => {
  assert.strictEqual(jrHoje(new Date(2026, 10, 26, 23, 59)), '2026-11-26')
})
caso('erro: capital zero',          () => assert.ok(calcularJuros(0, 5, '2026-11-18', '2026-12-18').erro))
caso('erro: taxa zero',             () => assert.ok(calcularJuros(2000, 0, '2026-11-18', '2026-12-18').erro))
caso('erro: data vazia',            () => assert.ok(calcularJuros(2000, 5, '', '2026-12-18').erro))
caso('erro: data final igual',      () => assert.ok(calcularJuros(2000, 5, '2026-11-18', '2026-11-18').erro))
caso('erro: data final anterior',   () => assert.ok(calcularJuros(2000, 5, '2026-12-18', '2026-11-18').erro))
caso('erro: data inexistente',      () => assert.ok(calcularJuros(2000, 5, '2026-02-30', '2026-03-10').erro))

console.log(falhas ? `\n${falhas} teste(s) falharam` : '\nTodos os testes passaram')
process.exit(falhas ? 1 : 0)
