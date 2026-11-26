# Calculadora Financeira

Calculadora web com duas ferramentas, em abas:

- **Financiamento** — Tabela Price (prestações iguais). Calcula a prestação, o valor
  financiado, o número de meses ou a taxa a partir dos outros três. Aceita valor de entrada e
  mostra a tabela de amortização.
- **Juros** — juros compostos diários entre duas datas (mês comercial de 30 dias). Mostra o
  montante, o total de juros e os dias corridos.

**Acesse:** https://calculadorafinanciamento.rildo.dev

Funciona também como **app instalável (PWA)** e abre sem internet:

- iPhone: no Safari, Compartilhar → Adicionar à Tela de Início
- Android: no Chrome, toque em "Instalar app"

O app instalado se atualiza sozinho quando uma versão nova é publicada.

## Tecnologia

HTML, CSS e JavaScript puros, sem frameworks, dependências ou etapa de build. Publicado pelo
GitHub Pages a partir da branch `main`.

## Rodar localmente

Sirva a pasta por HTTP (o service worker não funciona abrindo o arquivo direto):

```bash
python3 -m http.server 8765
```

Depois abra http://localhost:8765.

## Testes

```bash
node tests/juros.test.js
node tests/versao.test.js
```

## Créditos

Desenvolvido por Rildo Júnior. Crédito ao criador original Francimar Barbosa da Silva; a
calculadora de financiamento é uma recriação web baseada no Francinvest 3.0.
