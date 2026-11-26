# Calculadora de Financiamento (`script.js`)

Código original da v1.0, **sem alterações de lógica** desde então. Sistema Francês (Tabela
Price): todas as prestações iguais.

## Campos

| Campo | ID | Máscara |
|---|---|---|
| Financiamento (R$) | `financiamento` | monetária |
| Taxa de Juros (% a.m.) | `taxa` | nenhuma (texto livre, vírgula decimal) |
| Nº de Meses | `meses` | nenhuma (`parseInt`) |
| Prestação (R$) | `prestacao` | monetária |
| Valor da Entrada (R$) | `entrada` | monetária; só aparece com o toggle "Entrada?" ligado |

**Máscara monetária:** a cada tecla, pega só os dígitos e divide por 100
(`"200000"` → `2.000,00`). A calculadora de Juros usa a mesma lógica no `jrCapital`.

## Modos ("Calcular")

Os botões `.calc-btn` (`data-type`) escolhem qual campo será o resultado. Esse campo fica
desabilitado, com a classe `target` e o indicador "← calcular". Ao trocar de modo, o campo
que era o resultado anterior é preenchido com o valor de `lastResult`.

Com `PV` = financiamento − entrada, `i` = taxa/100, `n` = meses e `pmt` = prestação:

| Modo | Fórmula | Validações |
|---|---|---|
| `prestacao` | `pmt = PV·i / (1 − (1+i)^−n)` | PV, i, n > 0 |
| `financiamento` | `PV = pmt·(1 − (1+i)^−n) / i`; exibe `PV + entrada` | i, n, pmt > 0 |
| `meses` | `n = ln(pmt/(pmt − PV·i)) / ln(1+i)`; arredonda para o inteiro se a diferença for < 0,001, senão `ceil` | PV, i, pmt > 0; `pmt > PV·i` (senão a prestação "não cobre nem os juros") |
| `taxa` | bisseção em `findRate` (de 0,0001 a 5,0; 200 iterações; tolerância 0,0001 na prestação) | PV, n, pmt > 0; `pmt·n > PV` |

## Resultado

`showResult` mostra o valor calculado em `.result-card` e, em `.result-mini`: Total Pago
(`pmt·n`), Total de Juros, Custo Efetivo (`juros/PV`, 1 casa) e Taxa Anual
(`(1+i)^12 − 1`).

## Tabela Price

`buildTable(PV, i, n)` gera as linhas de 1 até `max(n, 20)` meses com a prestação e o total
de cada prazo. A linha do prazo calculado fica destacada com ◀. O painel abre
automaticamente depois de calcular. O botão "Tabela" reabre o painel (ou mostra um erro se
ainda não houve cálculo) e o cabeçalho ▼ alterna aberto/fechado.

## Outros comportamentos

- **Enter** em qualquer campo do financiamento clica em Calcular.
- **Limpar** apaga todos os campos, o resultado e a tabela, e reaplica o modo atual.
- **Entrada:** o toggle mostra/esconde o campo. Ao desligar, o valor é apagado.
- O tema e o relógio também estão em `script.js` (ver `arquitetura.md`).

## Particularidades conhecidas (pré-existentes; não mudar sem pedido)

- `findRate` nunca retorna `null`, então a checagem `i === null` nunca dispara.
- Ida e volta entre modos pode mostrar diferença de centavos por arredondamento
  (ex.: prestação 945,60 → financiamento 10.000,04). É esperado.
- A taxa do resultado no modo `taxa` é exibida com 4 casas.

## Valores de conferência (usados nas verificações no navegador)

Financiamento 10.000,00, taxa 2%, 12 meses → prestação **R$ 945,60**; total pago
11.347,15; tabela com 20 linhas. Com financiamento 12.000,00 e entrada 2.000,00 → a mesma
prestação, 945,60. Modo financiamento com prestação 945,60 → **R$ 10.000,04**. Modo
meses → **12 meses**. Modo taxa → **2,0000% a.m.**
