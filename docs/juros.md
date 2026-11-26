# Calculadora de Juros — "Cálculo de Juros Bruto" (`juros.js`)

Adicionada na v2.0. Independente da calculadora de Financiamento.

## Fórmula (definida pela ferramenta de referência do usuário)

Juros compostos **diários** com mês comercial de **30 dias**:

```js
diasCorridos = (dataFinal − dataInicial) em dias          // datas via Date.UTC
taxaDiaria   = Number((Math.pow(1 + taxa/100, 1/30) − 1).toFixed(12))
centavos     = capital * Math.pow(1 + taxaDiaria, diasCorridos) * 100
montante     = Math.ceil(centavos − 1e-8) / 100            // arredonda PARA CIMA
juros        = montante − capital
```

- **O expoente é o número de dias corridos** (não "dias − 1"; ver decisões D7 e D8).
- **O arredondamento para cima é intencional.** A tolerância `1e-8` evita somar um centavo
  por ruído de ponto flutuante quando o valor já é exato.
- `taxaDiaria` arredondada em 12 casas faz parte da regra: por isso 1 mês exato a 5% sobre
  2.000,00 dá **2.100,01** (e não 2.100,00). O usuário confirmou que a ferramenta de
  referência também dá 2.100,01.
- As datas `"AAAA-MM-DD"` são convertidas com `Date.UTC` para evitar erro de fuso e de
  horário de verão.

## API (função pura, sem DOM)

```js
calcularJuros(capital, taxa, dataInicial, dataFinal)
// capital: número em R$ · taxa: % ao mês (5 = 5%) · datas: "AAAA-MM-DD"
// → { montante, juros, diasCorridos }   ou   { erro: "mensagem" }
```

Validações, nesta ordem: data final informada → data inicial informada → capital > 0 →
taxa > 0 → datas válidas (rejeita datas inexistentes como 30/02) → data final posterior à
inicial.

Auxiliares: `jrParseData(s)` (string → ms UTC ou `null`) e `jrHoje(agora?)` (data **local**
de hoje em `"AAAA-MM-DD"`). No Node, as três são exportadas via `module.exports`.

## Interface

- Campos: Capital (`jrCapital`, máscara monetária igual à do app), Taxa (`jrTaxa`, % a.m.,
  sem máscara, aceita vírgula), Data inicial (`jrDataIni`) e Data final (`jrDataFim`),
  ambas `input type="date"`.
- **Data inicial:** preenchida com a data de hoje ao carregar a página e ao clicar em Limpar.
  **O usuário pode editar** e o cálculo usa a data escolhida (não volta para hoje ao calcular).
- **Data final:** começa **em branco**.
- Botões: Calcular (ou **Enter** em qualquer campo), Limpar e Ajuda (abre `#jrHelpModal`,
  que explica a fórmula).
- Resultado: **Montante** (destaque), **Total de juros** e **Dias corridos**. Nada além
  disso (percentual no período e dias considerados foram removidos a pedido; ver D9).

## Casos de referência (todos nos testes)

| Capital | Taxa | Data inicial | Data final | Dias | Montante | Juros |
|---|---|---|---|---|---|---|
| 500,00 | 5% | 26/11/2026 | 26/11/2028 | 731 | **1.641,66** | 1.141,66 |
| 500,00 | 5% | 26/11/2026 | 18/05/2027 | 173 | **662,47** | 162,47 |
| 2.000,00 | 5% | 26/11/2026 | 26/12/2026 | 30 | **2.100,01** | 100,01 |

Outro valor conferido no navegador: 500,00 a 5%, de 26/05/2026 a 26/11/2026 → 184 dias,
montante 674,43.
