# Calculadora Financeira — guia de referência

App web estático (HTML, CSS e JS puros; sem frameworks, dependências ou build) com duas
calculadoras em abas: **Financiamento** (Tabela Price) e **Juros** (juros compostos diários).
Funciona também como **PWA** (instalável e offline).

- Produção: https://calculadorafinanciamento.rildo.dev (GitHub Pages, branch `main`, raiz)
- Repositório: `rildojunior/Calculadora-de-Financiamentos` (público)
- Versão atual: **v2.1** — fica em `APP_VERSION` no `sw.js` e em 3 lugares do `index.html`
  (cabeçalho, título e rodapé do modal de ajuda)
- Idioma da interface e da documentação: português (pt-BR)

## Leia só o que precisar

| Vai mexer em… | Leia |
|---|---|
| Estrutura dos arquivos, abas, tema, estilos, IDs | [docs/arquitetura.md](docs/arquitetura.md) |
| Calculadora de Financiamento (`script.js`) | [docs/financiamento.md](docs/financiamento.md) |
| Calculadora de Juros (`juros.js`) — fórmula e regras | [docs/juros.md](docs/juros.md) |
| PWA, service worker, versão e atualização | [docs/pwa.md](docs/pwa.md) |
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
10. **Toda atualização publicada sobe a versão** — sem exceção, mesmo correção pequena de
    texto ou CSS. Trocar `APP_VERSION` em `sw.js` **e** as 3 ocorrências no `index.html`
    (v2.1 → v2.2…; o primeiro número só sobe em mudança grande). É a mudança no `sw.js` que
    força os apps instalados a baixar a versão nova. Rodar `node tests/versao.test.js`
    antes do commit. Arquivo novo que o site usa entra em `STATIC_FILES` no `sw.js`.

## Arquivos

```
index.html          estrutura das duas telas, abas e dois modais de ajuda
script.js           calculadora de Financiamento + tema + relógio (define fmt/parse globais)
juros.js            calculadora de Juros (carregado DEPOIS de script.js)
pwa.js              registro do service worker e recarga ao atualizar (carregado por último)
sw.js               service worker: cache offline; APP_VERSION = versão do app
manifest.json       manifesto do PWA (nome, ícones, cores, standalone)
icons/              ícones PNG do PWA (180 apple-touch, 192, 512, maskable-512)
styles.css          estilos e temas claro/escuro; regras novas ficam no fim do arquivo
favicon.svg         ícone
CNAME               domínio do GitHub Pages — não alterar
_config.yml         exclui tests/, docs/, CLAUDE.md e README.md do site publicado
tests/juros.test.js testes da função pura de juros (Node, sem dependências)
tests/versao.test.js confere a versão igual no sw.js e no index.html e os arquivos do cache
docs/               referência do projeto (este conjunto de arquivos)
```
