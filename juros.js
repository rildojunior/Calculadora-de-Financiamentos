// ── Cálculo de Juros Bruto ────────────────────────────────────────────────────
// Juros compostos diários com mês comercial de 30 dias.
// Carregado depois de script.js: reutiliza fmt() e parse() de lá.

// Converte "AAAA-MM-DD" em milissegundos UTC (evita erro de fuso/horário de verão).
function jrParseData(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''))
  if (!m) return null
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3])
  const t = Date.UTC(y, mo - 1, d)
  const dt = new Date(t)
  // rejeita datas inexistentes (ex.: 2026-02-30)
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null
  return t
}

// Função pura (sem DOM). Retorna { erro } ou o resultado do cálculo.
function calcularJuros(capital, taxa, dataInicial, dataFinal) {
  if (!dataFinal)   return { erro: 'Informe a Data final.' }
  if (!dataInicial) return { erro: 'Informe a Data inicial.' }
  if (!(capital > 0) || !isFinite(capital)) return { erro: 'Informe um Capital maior que zero.' }
  if (!(taxa > 0) || !isFinite(taxa))       return { erro: 'Informe uma Taxa de Juros maior que zero.' }

  const ini = jrParseData(dataInicial)
  const fim = jrParseData(dataFinal)
  if (ini === null || fim === null) return { erro: 'Data inválida.' }
  if (fim <= ini) return { erro: 'A Data final deve ser posterior à Data inicial.' }

  const diasCorridos = Math.round((fim - ini) / 86400000)
  // Juros capitalizados sobre todos os dias corridos; arredondamento para cima (intencional).
  const taxaDiaria = Number((Math.pow(1 + taxa / 100, 1 / 30) - 1).toFixed(12))
  const centavos = capital * Math.pow(1 + taxaDiaria, diasCorridos) * 100
  const montante = Math.ceil(centavos - 1e-8) / 100
  const juros = montante - capital

  return { montante, juros, diasCorridos }
}

// Data local de hoje no formato "AAAA-MM-DD" (o mesmo de <input type="date">).
function jrHoje(agora = new Date()) {
  const pad = x => String(x).padStart(2, '0')
  return `${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())}`
}

// Permite testar no Node sem navegador.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calcularJuros, jrParseData, jrHoje }
}

// ── Interface ─────────────────────────────────────────────────────────────────
if (typeof document !== 'undefined') {
  const jrEl = id => document.getElementById(id)

  const jrPlaceholder =
    '<div style="color:var(--text3);font-family:var(--mono);font-size:13px;padding:2rem 0;text-align:center;">Preencha os dados e<br>clique em Calcular</div>'

  // Abas: só mostram/escondem as seções, sem apagar dados.
  const jrTabs = document.querySelectorAll('.tab-btn')
  jrTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      jrTabs.forEach(t => {
        const ativo = t === tab
        t.classList.toggle('active', ativo)
        t.setAttribute('aria-selected', String(ativo))
        jrEl(t.dataset.section).hidden = !ativo
      })
    })
  })

  // Máscara monetária no Capital (mesma lógica da calculadora de financiamento).
  const jrCapital = jrEl('jrCapital')
  const jrMascara = () => {
    const digits = jrCapital.value.replace(/\D/g, '')
    if (!digits) { jrCapital.value = ''; return }
    jrCapital.value = (parseInt(digits, 10) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }
  jrCapital.addEventListener('input', jrMascara)
  jrCapital.addEventListener('blur', jrMascara)

  const jrError = jrEl('jrErrorMsg')
  const jrResult = jrEl('jrResultArea')

  function jrShowError(msg) {
    jrError.textContent = msg
    jrError.classList.add('visible')
  }

  // A Data inicial começa na data atual (editável); a Data final começa em branco.
  const jrDataIni = jrEl('jrDataIni')
  const jrAtualizaHoje = () => { jrDataIni.value = jrHoje() }
  jrAtualizaHoje()

  function jrCalcular() {
    jrError.classList.remove('visible')
    const capital = jrCapital.value.trim() ? parse(jrCapital.value) : 0
    const taxa = jrEl('jrTaxa').value.trim() ? parse(jrEl('jrTaxa').value) : 0
    const r = calcularJuros(capital, taxa, jrEl('jrDataIni').value, jrEl('jrDataFim').value)
    if (r.erro) {
      jrShowError(r.erro)
      jrResult.innerHTML = jrPlaceholder
      return
    }
    jrResult.innerHTML = `
      <div class="result-card">
        <div class="result-label">Montante</div>
        <div class="result-value">R$ ${fmt(r.montante)}</div>
      </div>
      <div class="result-grid">
        <div class="result-mini">
          <div class="mini-label">Total de Juros</div>
          <div class="mini-value" style="color:var(--yellow)">R$ ${fmt(r.juros)}</div>
        </div>
        <div class="result-mini">
          <div class="mini-label">Dias Corridos</div>
          <div class="mini-value">${r.diasCorridos}</div>
        </div>
      </div>
    `
  }

  jrEl('jrBtnCalcular').addEventListener('click', jrCalcular)

  ;['jrCapital', 'jrTaxa', 'jrDataIni', 'jrDataFim'].forEach(id => {
    jrEl(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); jrCalcular() }
    })
  })

  jrEl('jrBtnLimpar').addEventListener('click', () => {
    ;['jrCapital', 'jrTaxa', 'jrDataFim'].forEach(id => { jrEl(id).value = '' })
    jrAtualizaHoje()
    jrError.classList.remove('visible')
    jrResult.innerHTML = jrPlaceholder
  })

  // Ajuda própria
  const jrModal = jrEl('jrHelpModal')
  jrEl('jrBtnAjuda').addEventListener('click', () => jrModal.classList.add('visible'))
  jrEl('jrCloseHelp').addEventListener('click', () => jrModal.classList.remove('visible'))
  jrModal.addEventListener('click', e => {
    if (e.target === jrModal) jrModal.classList.remove('visible')
  })
}
