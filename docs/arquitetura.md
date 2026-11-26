# Arquitetura e interface

## Carregamento

`index.html` carrega, nesta ordem: `styles.css` (que importa as fontes IBM Plex Mono/Sans do
Google Fonts) → `script.js` → `juros.js` → `ui.js` → `pwa.js` (service worker; ver [pwa.md](pwa.md)). Não há módulos ES: tudo é script clássico com
funções e constantes no escopo global.

- `script.js` declara `fmt` e `parse` com `const` no escopo global. `juros.js` **usa** essas
  funções e **não pode redeclará-las** (daria `SyntaxError` e quebraria o arquivo inteiro).
  - `fmt(v, dec = 2)` → número formatado em pt-BR (`2.000,00`).
  - `parse(s)` → converte `"2.000,00"` em `2000` (retorna `0` se inválido).
- `juros.js` tem duas partes: a função pura (`calcularJuros`, `jrParseData`, `jrHoje`) e a
  ligação com o DOM, dentro de `if (typeof document !== 'undefined')`, para o arquivo poder
  ser carregado no Node pelos testes (`module.exports`).

## Estrutura da página (`index.html`)

```
.app
├── .header           h1 "Calculadora Financeira", .version "v2.1", botão de tema (#themeToggle)
├── .tabs             botões .tab-btn com data-section="secFinanciamento" | "secJuros"
├── section#secFinanciamento        (visível por padrão)
│   └── .grid → painel de dados, painel .results (#resultArea), painel #tablePanel (Tabela Price)
├── section#secJuros [hidden]
│   └── .grid → painel de dados (campos jr*), painel .results (#jrResultArea)
└── .footer-clock     relógio (#clock), atualizado a cada segundo por script.js
#helpModal            ajuda da calculadora de Financiamento (script.js)
#jrHelpModal          ajuda da calculadora de Juros (juros.js)
```

## Abas

Implementadas em `juros.js`. Clicar em uma `.tab-btn` alterna a classe `active` e o
`aria-selected` e define `hidden` nas `<section>`. **Só mostra/esconde**: nenhum campo ou
resultado é apagado ao trocar de aba. A aba padrão é Financiamento.

## Tema claro/escuro

Em `script.js`: o botão alterna a classe `light` em `<html>`. O padrão é **escuro** e o tema
**não é salvo** (volta ao escuro ao recarregar). As cores são variáveis CSS em `:root`
(escuro) e `:root.light` (claro). Use sempre as variáveis (`--accent`, `--text2`,
`--surface2` etc.) em estilos novos para funcionar nos dois temas.

Os campos `input[type=date]` usam `color-scheme: dark`/`light` para que o seletor de data
nativo acompanhe o tema.

## Componentes visuais reutilizáveis (`styles.css`)

- `.grid` (2 colunas; 1 coluna abaixo de 560px), `.panel`, `.panel.results`, `.panel.full`
- `.panel-label` — título pequeno em maiúsculas com linha
- `.field` + `label` + `input`; `.field .suffix` para unidade à direita (R$, % a.m.)
- `.field-row` — dois campos lado a lado (datas da aba Juros; empilha no mobile)
- `.btn.primary | .secondary | .danger`, `.btn.full` (ocupa a linha), dentro de `.actions`
- `.result-card` (valor em destaque), `.result-grid` + `.result-mini` (valores secundários)
- `.error-msg` (+ `.visible` para mostrar)
- `.modal-overlay` (+ `.visible`; desde a v2.3 fica sempre montado e anima via `visibility`/`opacity` — ver `ui.js`), `.modal`, `.help-item`, `.help-icon`, `.help-section-title`
- `.calc-btn` — **exclusivo** dos botões de modo do Financiamento (ver regras no CLAUDE.md)
- `.tab-btn` — abas

As regras adicionadas na v2.0 estão no **fim** de `styles.css` (abas, `.field-row`, datas).
As regras originais da v1.0 não foram alteradas.

## IDs

- Financiamento (originais, não renomear): `financiamento`, `taxa`, `meses`, `prestacao`,
  `entrada`, `entradaToggle`, `entradaToggleRow`, `entradaFieldWrap`, `errorMsg`,
  `resultArea`, `tablePanel`, `tableToggle`, `tableWrap`, `amortTable`, `amortBody`,
  `btnCalcular`, `btnTabela`, `btnLimpar`, `btnAjuda`, `helpModal`, `closeHelp`,
  `tgtFin`, `tgtTax`, `tgtMes`, `tgtPre`, `label*`, `field*`, `calcType`.
- Gerais: `themeToggle`, `themeIcon`, `themeLabel`, `clock`, `secFinanciamento`, `secJuros`.
- Juros (prefixo `jr`): `jrCapital`, `jrTaxa`, `jrDataIni`, `jrDataFim`, `jrErrorMsg`,
  `jrResultArea`, `jrBtnCalcular`, `jrBtnLimpar`, `jrBtnAjuda`, `jrHelpModal`, `jrCloseHelp`,
  `jrHelpTitle`.
- Interação (`ui.js`, prefixo `ui`): `uiHelpTitle`; classes `ui-pop`, `ui-modal-open`;
  variáveis CSS `--ui-origin`, `--ui-scrim`; `entradaToggleLabel` (v2.2).

## Rodapé do modal de Financiamento

Créditos: autor Rildo Júnior; crédito ao criador original Francimar Barbosa da Silva;
recriação web baseada no Francinvest 3.0. Manter ao editar o modal.
