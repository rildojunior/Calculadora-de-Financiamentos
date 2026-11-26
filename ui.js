/* =============================================
   UI — ajustes de interação (v2.2)
   Carregado DEPOIS de script.js e juros.js. Não altera a lógica de cálculo:
   só acrescenta listeners que rodam depois dos originais.
   ============================================= */

;(function () {
  const $ = id => document.getElementById(id)

  // ── Interruptor de entrada: mantém aria-checked em sincronia com a classe .on ──
  // (script.js alterna a classe no clique da linha; este listener roda depois dele)
  const entradaToggle = $('entradaToggle')
  const syncEntrada = () =>
    entradaToggle.setAttribute('aria-checked', String(entradaToggle.classList.contains('on')))
  $('entradaToggleRow').addEventListener('click', syncEntrada)

  // ── Celular: depois de calcular, leva o resultado para a tela ──
  // Abaixo de 560px o painel de resultado fica embaixo do formulário e o usuário
  // não via que o cálculo aconteceu.
  const mobile = window.matchMedia('(max-width: 560px)')
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  function mostrarResultado(areaId, erroId) {
    if (!mobile.matches) return
    const area = $(areaId)
    if ($(erroId).classList.contains('visible') || !area.querySelector('.result-card')) return
    const painel = area.closest('.panel')
    requestAnimationFrame(() =>
      painel.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' })
    )
  }

  // Financiamento: o Enter dos campos já dispara btnCalcular.click()
  $('btnCalcular').addEventListener('click', () => mostrarResultado('resultArea', 'errorMsg'))

  // Juros: o Enter chama jrCalcular() direto, então escuta os dois caminhos
  $('jrBtnCalcular').addEventListener('click', () => mostrarResultado('jrResultArea', 'jrErrorMsg'))
  ;['jrCapital', 'jrTaxa', 'jrDataIni', 'jrDataFim'].forEach(id => {
    $(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') mostrarResultado('jrResultArea', 'jrErrorMsg')
    })
  })
})()
