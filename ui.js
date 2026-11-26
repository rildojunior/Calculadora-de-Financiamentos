/* =============================================
   UI — ajustes de interação e movimento (v2.2 / v2.3)
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

  // ── Resultado novo: destaque rápido para mostrar que algo mudou (v2.3) ──
  // script.js e juros.js trocam o innerHTML da área; o observer marca os blocos novos.
  ;['resultArea', 'jrResultArea'].forEach(id => {
    new MutationObserver(() => {
      $(id).querySelectorAll('.result-card, .result-grid').forEach(el => el.classList.add('ui-pop'))
    }).observe($(id), { childList: true })
  })

  /* ── Modais de ajuda (v2.3) ─────────────────────────────────────────────
     script.js e juros.js abrem e fecham os modais trocando a classe .visible.
     Aqui um MutationObserver reage a essa troca, venha de onde vier (botão,
     clique fora, Esc, arrastar), para cuidar de foco, rolagem e animação. */
  const app = document.querySelector('.app')
  const modais = [
    { overlay: $('helpModal'), trigger: $('btnAjuda'), close: $('closeHelp') },
    { overlay: $('jrHelpModal'), trigger: $('jrBtnAjuda'), close: $('jrCloseHelp') }
  ]
  const aberto = () => modais.find(m => m.overlay.classList.contains('visible'))

  // Esc fecha
  document.addEventListener('keydown', e => {
    const m = aberto()
    if (e.key === 'Escape' && m) m.overlay.classList.remove('visible')
  })

  modais.forEach(m => {
    const sheet = m.overlay.querySelector('.modal')
    const header = m.overlay.querySelector('.modal-header')
    let estavaAberto = false

    new MutationObserver(() => {
      const visivel = m.overlay.classList.contains('visible')
      if (visivel === estavaAberto) return
      estavaAberto = visivel

      if (visivel) {
        // Computador: o modal cresce a partir do botão que o abriu
        const r = m.trigger.getBoundingClientRect()
        sheet.style.setProperty('--ui-origin',
          `${r.left + r.width / 2 - sheet.offsetLeft}px ${r.top + r.height / 2 - sheet.offsetTop}px`)
        m.overlay.style.removeProperty('--ui-scrim')
        app.inert = true                                 // foco fica dentro do modal
        document.documentElement.classList.add('ui-modal-open') // trava a rolagem por trás
        requestAnimationFrame(() => m.close.focus({ preventScroll: true }))
      } else {
        // Fechado no meio de um arrasto ou mola (ex.: Esc): devolve a animação ao CSS,
        // que parte da posição atual da folha
        const interrompido = mola !== null || arrastando
        pararMola()
        arrastando = false
        delete header.dataset.ponteiro
        if (interrompido) sheet.style.transition = ''
        sheet.style.transform = ''
        app.inert = false
        document.documentElement.classList.remove('ui-modal-open')
        m.trigger.focus({ preventScroll: true })          // devolve o foco ao botão Ajuda
      }
    }).observe(m.overlay, { attributes: true, attributeFilter: ['class'] })

    /* ── Celular: folha que sobe de baixo e pode ser arrastada para fechar ──
       Arrasto 1:1 pelo cabeçalho; ao soltar, projeta o movimento pela velocidade
       e decide entre fechar e voltar; a mola continua na velocidade do dedo. */
    let arrastando = false, inicioY = 0, base = 0, y = 0, historico = [], mola = null

    const altura = () => sheet.offsetHeight
    const aplicar = v => {
      y = v
      sheet.style.transform = `translateY(${v}px)`
      m.overlay.style.setProperty('--ui-scrim', String(Math.max(0, 1 - v / altura())))
    }
    // Resistência progressiva ao puxar para cima, além do limite
    const elastico = (d, dim) => (d * dim * 0.55) / (dim + 0.55 * Math.abs(d))
    // Projeção de momento (fórmula da Apple); 0.99 = desaceleração rápida, de folha
    const projetar = (v, taxa = 0.99) => (v / 1000) * taxa / (1 - taxa)

    function pararMola() { if (mola) cancelAnimationFrame(mola), mola = null }

    // Mola com os parâmetros da Apple: amortecimento (1 = sem quicar) e resposta (s)
    function animarMola(alvo, velocidade, amortecimento, resposta, fim) {
      pararMola()
      const k = Math.pow(2 * Math.PI / resposta, 2)
      const c = 4 * Math.PI * amortecimento / resposta
      let v = velocidade, t0 = null
      const passo = t => {
        const dt = Math.min(0.064, t0 === null ? 1 / 60 : (t - t0) / 1000)
        t0 = t
        for (let i = 0; i < 4; i++) {           // subpassos para estabilidade
          const a = -k * (y - alvo) - c * v
          v += a * dt / 4
          y += v * dt / 4
        }
        if (Math.abs(y - alvo) < 0.5 && Math.abs(v) < 10) { aplicar(alvo); mola = null; fim(); return }
        aplicar(y)
        mola = requestAnimationFrame(passo)
      }
      mola = requestAnimationFrame(passo)
    }

    header.addEventListener('pointerdown', e => {
      if (!mobile.matches || !e.isPrimary || e.button !== 0) return
      inicioY = e.clientY
      historico = [{ y: e.clientY, t: e.timeStamp }]
      header.dataset.ponteiro = e.pointerId
    })

    header.addEventListener('pointermove', e => {
      if (header.dataset.ponteiro !== String(e.pointerId)) return
      historico.push({ y: e.clientY, t: e.timeStamp })
      if (historico.length > 6) historico.shift()
      if (!arrastando) {
        if (Math.abs(e.clientY - inicioY) < 10) return  // tolerância: um toque no Fechar continua sendo toque
        arrastando = true
        try { header.setPointerCapture(e.pointerId) } catch (_) {}
        // Pega a folha onde ela está (mesmo no meio de uma animação)
        const atual = new DOMMatrix(getComputedStyle(sheet).transform).m42
        pararMola()
        sheet.style.transition = 'none'
        base = atual
        inicioY = e.clientY
      }
      const d = base + (e.clientY - inicioY)
      aplicar(d < 0 ? elastico(d, altura()) : d)
    })

    function soltar(e) {
      if (header.dataset.ponteiro !== String(e.pointerId)) return
      delete header.dataset.ponteiro
      if (!arrastando) return
      arrastando = false

      // Velocidade dos últimos ~100ms do gesto (px/s)
      const recentes = historico.filter(p => e.timeStamp - p.t < 100)
      const a = recentes[0] || historico[0], b = historico[historico.length - 1]
      const vel = b.t > a.t ? (b.y - a.y) / (b.t - a.t) * 1000 : 0

      const h = altura()
      const fechar = y + projetar(vel) > h * 0.4

      const terminar = () => {
        sheet.style.transition = 'none'
        if (fechar) {
          // A posição final já é a do estado fechado (translateY 100%): sem salto
          sheet.style.transform = ''
          m.overlay.classList.remove('visible')
        } else {
          sheet.style.transform = ''
          m.overlay.style.removeProperty('--ui-scrim')
        }
        requestAnimationFrame(() => requestAnimationFrame(() => { sheet.style.transition = '' }))
      }

      if (reduceMotion.matches) { aplicar(fechar ? h : 0); terminar(); return }
      // Quica um pouco só quando o gesto teve impulso para cima e volta a abrir
      const amort = !fechar && Math.abs(vel) > 300 ? 0.8 : 1
      animarMola(fechar ? h : 0, vel, amort, 0.3, terminar)
    }
    header.addEventListener('pointerup', soltar)
    header.addEventListener('pointercancel', soltar)
  })
})()
