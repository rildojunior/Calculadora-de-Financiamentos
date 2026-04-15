// ── Utilitários ───────────────────────────────────────────────────────────────
const fmt = (v, dec = 2) =>
  v.toLocaleString('pt-BR', {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  })

const parse = s => parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0

// ── Estado global ─────────────────────────────────────────────────────────────
let calcMode    = 'financiamento'
let entradaAtiva = false
let tableOpen   = false
let lastResult  = {}
let isLight     = false

// ── Referências DOM ───────────────────────────────────────────────────────────
const calcBtns       = document.querySelectorAll('.calc-btn')
const entradaToggle  = document.getElementById('entradaToggle')
const entradaFieldWrap = document.getElementById('entradaFieldWrap')
const errorMsg       = document.getElementById('errorMsg')
const resultArea     = document.getElementById('resultArea')
const tablePanel     = document.getElementById('tablePanel')
const tableToggle    = document.getElementById('tableToggle')
const tableWrap      = document.getElementById('tableWrap')
const amortBody      = document.getElementById('amortBody')

// ── Modo de cálculo ───────────────────────────────────────────────────────────
function setCalcMode(mode) {
  const prevMode = calcMode
  calcMode = mode
  calcBtns.forEach(b => b.classList.toggle('active', b.dataset.type === mode))

  const fields = ['financiamento', 'meses', 'taxa', 'prestacao']
  fields.forEach(key => {
    const inp = document.getElementById(key)
    if (key === mode) {
      inp.value = ''
      inp.disabled = true
      inp.classList.add('target')
    } else {
      inp.disabled = false
      inp.classList.remove('target')
      if (key === prevMode && lastResult[key] !== undefined) {
        inp.value = lastResult[key]
      }
    }
  })

  document.getElementById('tgtFin').textContent = mode === 'financiamento' ? '← calcular' : ''
  document.getElementById('tgtTax').textContent = mode === 'taxa'          ? '← calcular' : ''
  document.getElementById('tgtMes').textContent = mode === 'meses'         ? '← calcular' : ''
  document.getElementById('tgtPre').textContent = mode === 'prestacao'     ? '← calcular' : ''
}

calcBtns.forEach(b => b.addEventListener('click', () => setCalcMode(b.dataset.type)))

// ── Toggle de entrada ─────────────────────────────────────────────────────────
document.getElementById('entradaToggleRow').addEventListener('click', () => {
  entradaAtiva = !entradaAtiva
  entradaToggle.classList.toggle('on', entradaAtiva)
  entradaFieldWrap.classList.toggle('hidden', !entradaAtiva)
  if (!entradaAtiva) document.getElementById('entrada').value = ''
})

// ── Limpar ────────────────────────────────────────────────────────────────────
document.getElementById('btnLimpar').addEventListener('click', () => {
  ;['financiamento', 'taxa', 'meses', 'prestacao', 'entrada'].forEach(id => {
    const el = document.getElementById(id)
    el.value = ''
    el.disabled = false
    el.classList.remove('target')
  })
  lastResult = {}
  errorMsg.classList.remove('visible')
  resultArea.innerHTML =
    '<div style="color:var(--text3);font-family:var(--mono);font-size:13px;padding:2rem 0;text-align:center;">Preencha os dados e<br>clique em Calcular</div>'
  tablePanel.style.display = 'none'
  amortBody.innerHTML = ''
  tableWrap.classList.remove('visible')
  tableToggle.classList.remove('open')
  tableOpen = false
  setCalcMode(calcMode)
})

// ── Botão Tabela ──────────────────────────────────────────────────────────────
document.getElementById('btnTabela').addEventListener('click', () => {
  if (tablePanel.style.display === 'none' || !amortBody.children.length) {
    showError('Realize um cálculo primeiro para visualizar a tabela.')
    return
  }
  tableOpen = true
  tableToggle.classList.add('open')
  tableWrap.classList.add('visible')
  tablePanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
})

// ── Modal de ajuda ────────────────────────────────────────────────────────────
document.getElementById('btnAjuda').addEventListener('click', () => {
  document.getElementById('helpModal').classList.add('visible')
})
document.getElementById('closeHelp').addEventListener('click', () => {
  document.getElementById('helpModal').classList.remove('visible')
})
document.getElementById('helpModal').addEventListener('click', e => {
  if (e.target === document.getElementById('helpModal'))
    document.getElementById('helpModal').classList.remove('visible')
})

// ── Toggle da tabela ──────────────────────────────────────────────────────────
tableToggle.addEventListener('click', () => {
  tableOpen = !tableOpen
  tableToggle.classList.toggle('open', tableOpen)
  tableWrap.classList.toggle('visible', tableOpen)
})

// ── Utilitários de feedback ───────────────────────────────────────────────────
function showError(msg) {
  errorMsg.textContent = msg
  errorMsg.classList.add('visible')
}

function hideError() {
  errorMsg.classList.remove('visible')
}

// ── Construção da tabela Price ────────────────────────────────────────────────
function buildTable(PV, i, n) {
  amortBody.innerHTML = ''
  const maxRows = Math.max(n, 20)
  for (let k = 1; k <= maxRows; k++) {
    const pmtK   = (PV * i) / (1 - Math.pow(1 + i, -k))
    const totalK = k * pmtK
    const tr     = document.createElement('tr')
    const isSelected = k === n
    const style = isSelected
      ? ' style="background:color-mix(in srgb,var(--accent) 10%,transparent);color:var(--accent)"'
      : ''
    tr.innerHTML = `<td${style}>${k}${isSelected ? ' ◀' : ''}</td><td${style}>${fmt(pmtK)}</td><td${style}>${fmt(totalK)}</td>`
    amortBody.appendChild(tr)
  }
}

// ── Exibição de resultado ─────────────────────────────────────────────────────
function showResult(label, value, { pmt, i, n, PV }) {
  const totalPago  = pmt * n
  const totalJuros = totalPago - PV
  const taxaAnual  = (Math.pow(1 + i, 12) - 1) * 100

  resultArea.innerHTML = `
    <div class="result-card">
      <div class="result-label">${label}</div>
      <div class="result-value">${value}</div>
    </div>
    <div class="result-grid">
      <div class="result-mini">
        <div class="mini-label">Total Pago</div>
        <div class="mini-value">R$ ${fmt(totalPago)}</div>
      </div>
      <div class="result-mini">
        <div class="mini-label">Total de Juros</div>
        <div class="mini-value" style="color:var(--yellow)">R$ ${fmt(totalJuros)}</div>
      </div>
      <div class="result-mini">
        <div class="mini-label">Custo Efetivo</div>
        <div class="mini-value">${fmt((totalJuros / PV) * 100, 1)}%</div>
      </div>
      <div class="result-mini">
        <div class="mini-label">Taxa Anual</div>
        <div class="mini-value">${fmt(taxaAnual, 2)}% a.a.</div>
      </div>
    </div>
  `

  buildTable(PV, i, n)
  tablePanel.style.display = 'block'
  tableOpen = true
  tableToggle.classList.add('open')
  tableWrap.classList.add('visible')
}

// ── Busca de taxa (bisseção) ──────────────────────────────────────────────────
function findRate(PV, n, pmt) {
  let lo = 0.0001, hi = 5.0
  for (let iter = 0; iter < 200; iter++) {
    const mid  = (lo + hi) / 2
    const calc = (mid * PV) / (1 - Math.pow(1 + mid, -n))
    if (Math.abs(calc - pmt) < 0.0001) return mid
    if (calc < pmt) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

// ── Botão Calcular ────────────────────────────────────────────────────────────
document.getElementById('btnCalcular').addEventListener('click', () => {
  hideError()
  tablePanel.style.display = 'none'
  amortBody.innerHTML = ''
  tableWrap.classList.remove('visible')
  tableToggle.classList.remove('open')
  tableOpen = false

  const entradaVal = entradaAtiva ? parse(document.getElementById('entrada').value) : 0
  let PV  = parse(document.getElementById('financiamento').value) - entradaVal
  let i   = parse(document.getElementById('taxa').value) / 100
  let n   = parseInt(document.getElementById('meses').value) || 0
  let pmt = parse(document.getElementById('prestacao').value)

  let resultLabel, resultValue
  let extraData = {}

  if (calcMode === 'financiamento') {
    if (!i || !n || !pmt) { showError('Informe Taxa de Juros, Nº de Meses e Prestação.'); return }
    if (pmt <= 0 || i <= 0 || n <= 0) { showError('Valores devem ser maiores que zero.'); return }
    PV = (pmt * (1 - Math.pow(1 + i, -n))) / i
    resultLabel = 'Financiamento'
    resultValue = 'R$ ' + fmt(PV + entradaVal)
    extraData   = { pmt, i, n, PV, entradaVal }
    lastResult  = { financiamento: fmt(PV + entradaVal), taxa: fmt(i * 100, 4), meses: String(n), prestacao: fmt(pmt) }
    document.getElementById('financiamento').value = fmt(PV + entradaVal)

  } else if (calcMode === 'prestacao') {
    if (PV <= 0)       { showError('Informe o Financiamento.'); return }
    if (!i || i <= 0)  { showError('Informe a Taxa de Juros.'); return }
    if (!n || n <= 0)  { showError('Informe o Nº de Meses.'); return }
    pmt = (PV * i) / (1 - Math.pow(1 + i, -n))
    resultLabel = 'Prestação'
    resultValue = 'R$ ' + fmt(pmt)
    extraData   = { pmt, i, n, PV, entradaVal }
    lastResult  = { financiamento: fmt(PV + entradaVal), taxa: fmt(i * 100, 4), meses: String(n), prestacao: fmt(pmt) }
    document.getElementById('prestacao').value = fmt(pmt)

  } else if (calcMode === 'meses') {
    if (PV <= 0)          { showError('Informe o Financiamento.'); return }
    if (!i || i <= 0)     { showError('Informe a Taxa de Juros.'); return }
    if (!pmt || pmt <= 0) { showError('Informe a Prestação.'); return }
    if (pmt <= PV * i)    { showError('Prestação muito baixa: não cobre nem os juros.'); return }
    const nRaw     = Math.log(pmt / (pmt - PV * i)) / Math.log(1 + i)
    const nRounded = Math.round(nRaw)
    n = Math.abs(nRaw - nRounded) < 0.001 ? nRounded : Math.ceil(nRaw)
    resultLabel = 'Nº de Meses'
    resultValue = n + ' meses'
    extraData   = { pmt, i, n, PV, entradaVal }
    lastResult  = { financiamento: fmt(PV + entradaVal), taxa: fmt(i * 100, 4), meses: String(n), prestacao: fmt(pmt) }
    document.getElementById('meses').value = String(n)

  } else if (calcMode === 'taxa') {
    if (PV <= 0)          { showError('Informe o Financiamento.'); return }
    if (!n || n <= 0)     { showError('Informe o Nº de Meses.'); return }
    if (!pmt || pmt <= 0) { showError('Informe a Prestação.'); return }
    if (pmt * n <= PV)    { showError('Prestação insuficiente para o prazo informado.'); return }
    i = findRate(PV, n, pmt)
    if (i === null) { showError('Não foi possível calcular a taxa. Verifique os valores.'); return }
    resultLabel = 'Taxa de Juros'
    resultValue = fmt(i * 100, 4) + '% a.m.'
    extraData   = { pmt, i, n, PV, entradaVal }
    lastResult  = { financiamento: fmt(PV + entradaVal), taxa: fmt(i * 100, 4), meses: String(n), prestacao: fmt(pmt) }
    document.getElementById('taxa').value = fmt(i * 100, 4)
  }

  showResult(resultLabel, resultValue, extraData)
})

// ── Tecla Enter em qualquer campo ────────────────────────────────────────────
;['financiamento', 'taxa', 'meses', 'prestacao', 'entrada'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btnCalcular').click()
  })
})

// ── Formatação monetária automática ──────────────────────────────────────────
function formatCurrency(inp) {
  const raw = inp.value.replace(/\D/g, '')
  if (!raw) { inp.value = ''; return }
  inp.value = (parseInt(raw, 10) / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

;['financiamento', 'prestacao', 'entrada'].forEach(id => {
  const inp = document.getElementById(id)
  inp.addEventListener('input', () => {
    const digits = inp.value.replace(/\D/g, '')
    if (!digits) { inp.value = ''; return }
    inp.value = (parseInt(digits, 10) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  })
  inp.addEventListener('blur',  () => formatCurrency(inp))
  inp.addEventListener('focus', () => { if (!inp.value) inp.placeholder = '0,00' })
})

// ── Relógio ───────────────────────────────────────────────────────────────────
function updateClock() {
  const now = new Date()
  const pad = x => String(x).padStart(2, '0')
  document.getElementById('clock').textContent =
    `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ` +
    `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}
updateClock()
setInterval(updateClock, 1000)

// ── Toggle de tema ────────────────────────────────────────────────────────────
document.getElementById('themeToggle').addEventListener('click', () => {
  isLight = !isLight
  document.documentElement.classList.toggle('light', isLight)
  document.getElementById('themeIcon').textContent  = isLight ? '☀️' : '🌙'
  document.getElementById('themeLabel').textContent = isLight ? 'Escuro' : 'Claro'
})

// ── Inicialização ─────────────────────────────────────────────────────────────
setCalcMode('financiamento')
