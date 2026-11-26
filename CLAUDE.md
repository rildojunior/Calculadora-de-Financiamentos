# Calculadora Financeira — guia de referência

App web estático (HTML, CSS e JS puros; sem frameworks, dependências ou build) com duas
calculadoras em abas: **Financiamento** (Tabela Price) e **Juros** (juros compostos diários).

- Produção: https://calculadorafinanciamento.rildo.dev (GitHub Pages, branch `main`, raiz)
- Repositório: `rildojunior/Calculadora-de-Financiamentos` (público)
- Versão atual: **v2.0** (exibida no cabeçalho e no título do modal de ajuda)
- Idioma da interface e da documentação: português (pt-BR)

## Leia só o que precisar

| Vai mexer em… | Leia |
|---|---|
| Estrutura dos arquivos, abas, tema, estilos, IDs | [docs/arquitetura.md](docs/arquitetura.md) |
| Calculadora de Financiamento (`script.js`) | [docs/financiamento.md](docs/financiamento.md) |
| Calculadora de Juros (`juros.js`) — fórmula e regras | [docs/juros.md](docs/juros.md) |
| Testes, preview local, deploy, git/PR | [docs/deploy-e-testes.md](docs/deploy-e-testes.md) |
| Por que algo é do jeito que é | [docs/decisoes.md](docs/decisoes.md) |

## Regras que valem para qualquer mudança

1. **Não alterar a lógica de `script.js`** sem pedido explícito. Lógica nova vai em arquivo próprio.
2. **Não usar a classe `.calc-btn`** em elementos novos: `script.js` seleciona todos com ela.
3. **IDs novos sempre com prefixo** (a calculadora de Juros usa `jr`). Nunca repetir IDs existentes.
4. **Não mexer no `CNAME`** (domínio de produção).
5. **Regras do cálculo de juros são da ferramenta de referência do usuário** — inclusive o
   arredondamento para cima. Não "corrigir"; se um valor esperado não bater, avisar o usuário
   em vez de ajustar o teste. Ver [docs/juros.md](docs/juros.md).
6. Rodar `node tests/juros.test.js` antes de qualquer commit que toque em `juros.js`.
7. Depois de mudanças na interface, conferir no navegador os 4 modos de financiamento, a
   tabela Price, a entrada, o tema, os dois modais de ajuda e a aba Juros.
8. Fluxo: branch nova → commit → PR → merge em `main` (o merge publica em produção).
9. Ao tomar uma decisão nova sobre o projeto, registrar em [docs/decisoes.md](docs/decisoes.md).

## Arquivos

```
index.html          estrutura das duas telas, abas e dois modais de ajuda
script.js           calculadora de Financiamento + tema + relógio (define fmt/parse globais)
juros.js            calculadora de Juros (carregado DEPOIS de script.js)
styles.css          estilos e temas claro/escuro; regras novas ficam no fim do arquivo
favicon.svg         ícone
CNAME               domínio do GitHub Pages — não alterar
_config.yml         exclui tests/, docs/, CLAUDE.md e README.md do site publicado
tests/juros.test.js testes da função pura de juros (Node, sem dependências)
docs/               referência do projeto (este conjunto de arquivos)
```
