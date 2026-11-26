# Registro de decisões

Ordem cronológica. Cada item traz **o que** foi decidido, **por quê** e, quando houver, o que
foi substituído. Ao tomar uma decisão nova, acrescente no fim.

## v1.0 (antes de 26/11/2026)

- **D1 — Sem frameworks, dependências ou build.** O app é HTML, CSS e JS puros, publicado
  direto pelo GitHub Pages.

## v2.0 — calculadora de Juros (26/11/2026)

- **D2 — Nome "Calculadora Financeira" e versão v2.0.** O app deixou de ser só de
  financiamento. Mudou no `<title>`, no `<h1>` e no título do modal de ajuda.
- **D3 — `script.js` intocado; lógica nova em `juros.js`, carregado depois.** Reutiliza
  `fmt` e `parse` sem redeclarar. Motivo: não arriscar o Financiamento, que já funcionava.
- **D4 — Isolamento de nomes:** nada de `.calc-btn` nos elementos novos (`script.js` seleciona
  todos com essa classe), IDs novos com o prefixo `jr`, e `CNAME` intocado.
- **D5 — Abas** "Financiamento" (padrão) e "Juros". Trocar de aba só mostra/esconde as
  seções, sem apagar dados.
- **D6 — Mesmo padrão visual** (`.grid`, `.panel`, `.field`, `.btn`, `.result-card`), com
  os dois temas e layout responsivo. CSS novo só no fim de `styles.css`.
- **D7 — Fórmula inicial (especificação do usuário):** juros compostos diários, mês de 30
  dias, `taxaDiaria` com `toFixed(12)`, expoente `n = dias − 1`, arredondamento para cima com
  tolerância `1e-8`, datas via `Date.UTC`. Havia 8 casos de teste (capital 2.000,00, início
  18/11/2026, taxas de 5% e 3%). **Parcialmente substituída pela D8.**
- **D8 — Expoente corrigido para `n = dias corridos`.** O usuário testou na ferramenta de
  referência dele: 500,00 a 5% de 26/11/2026 a 26/11/2028 = 1.641,66, e até 18/05/2027 =
  662,47. Esses valores só fecham com `n = dias`; com `dias − 1` dariam 1.638,99 e 661,39.
  As duas regras são incompatíveis. O usuário confirmou os valores novos e pediu para
  **remover os 8 casos antigos** dos testes. Hipótese (não confirmada): os casos antigos
  foram gerados a partir de 19/11, um dia depois da data informada. O restante da D7
  (toFixed(12), arredondamento para cima, `1e-8`, `Date.UTC`) continua valendo.
- **D9 — Resultado reduzido** a Montante, Total de juros e Dias corridos. "Percentual no
  período" e "Dias considerados" foram removidos a pedido do usuário.
- **D10 — Datas padrão:** a data inicial começa com a data de hoje (data **local**, via
  `jrHoje`), também ao clicar em Limpar. A data final começa **em branco** (o usuário aceitava
  "1 mês depois" só se não fosse possível deixar em branco, e é possível).
- **D11 — Data inicial editável.** Primeiro ela ficou só leitura ("sempre a data atual");
  depois o usuário pediu para poder editar. Hoje: começa em hoje, é editável e o cálculo não
  a sobrescreve.
- **D12 — Arredondamento confirmado:** 2.000,00 a 5% por 30 dias = **2.100,01**, igual na
  ferramenta de referência. Não mudar a tolerância. Caso incluído nos testes.
- **D13 — Função pura + testes no Node.** `calcularJuros` não acessa o DOM e é exportada
  via `module.exports`. Testes em `tests/juros.test.js`, sem dependências.

## Infraestrutura

- **D14 — Git e GitHub.** A pasta local não era um repositório. Foi feito `git init` e
  depois a pasta foi ligada a `origin` (GitHub). O commit da v2.0 foi reaplicado sobre o
  `main` do GitHub, que tinha conteúdo idêntico. Fluxo adotado: branch → PR → merge
  (PR #1 = v2.0).
- **D15 — `tests/` mantida no repositório, mas fora do site publicado.** O usuário autorizou
  remover a pasta "se não fosse necessária". Os testes não são necessários para o site, mas
  protegem o cálculo de juros em sessões futuras. A pasta continua no repositório e o
  `_config.yml` a exclui da publicação (junto com `docs/`, `CLAUDE.md` e `README.md`).
- **D16 — Enforce HTTPS ligado** no GitHub Pages (o certificado já estava aprovado).
- **D17 — Documentação de referência** em `CLAUDE.md` (índice, lido automaticamente pelo
  Claude Code) e em `docs/*.md` por assunto, para que uma nova sessão leia só o necessário.

## v2.1 — PWA (26/11/2026)

- **D18 — App instalável (PWA)**, no mesmo padrão dos outros projetos do usuário
  (`provacafe_consulta`): `manifest.json`, `sw.js` com cache dos estáticos (cache-first) e
  das fontes Google, ícones em `icons/` gerados a partir do `favicon.svg`. Registro em
  `pwa.js` (arquivo próprio, `script.js` intocado).
- **D19 — Versão sobe a cada atualização publicada** (pedido do usuário), para forçar os
  apps instalados a atualizar. Versão única: `APP_VERSION` no `sw.js` = versão exibida no
  `index.html`; o nome do cache deriva dela. `tests/versao.test.js` impede que fiquem
  diferentes. Atualização forçada: `updateViaCache: 'none'`, nova verificação a cada volta
  do app para a tela, `skipWaiting` + `clients.claim` e recarga automática da página no
  `controllerchange` (perde campos preenchidos nesse momento — aceitável numa calculadora).
