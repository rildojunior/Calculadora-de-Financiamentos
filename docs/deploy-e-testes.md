# Testes, preview local, git e deploy

## Testes automatizados

```bash
node tests/juros.test.js
node tests/versao.test.js
```

`versao.test.js` confere que `APP_VERSION` do `sw.js` é igual às 3 versões do `index.html` e
que todo arquivo listado no cache do service worker existe.

Sem dependências (usa `assert` do Node). Cobrem a função pura de juros: os casos de
referência de `juros.md`, a contagem de dias, o formato do resultado, `jrHoje` e as
validações. O comando sai com código 1 se algum caso falhar.

**Regra:** se um valor esperado falhar, avisar o usuário. Não ajustar o valor esperado para
o teste passar.

O Financiamento (`script.js`) não tem testes automatizados: é conferido no navegador
(valores em `financiamento.md`).

## Preview local

- Abrir `index.html` como `file://` no painel de preview do app Claude **não executa os
  scripts** (vira snapshot estático). É preciso servir por HTTP.
- `python3 -m http.server` com o diretório atual dentro de `~/Desktop` falha com
  `PermissionError` (permissão de privacidade do macOS). O que funciona é rodar de fora da
  pasta e apontar com `-d`:

  ```bash
  cd /private/tmp && python3 -m http.server 8765 --bind 127.0.0.1 -d /Users/rildojunior/Desktop/Calculadora-de-Financiamentos
  ```

  Depois, abrir `http://127.0.0.1:8765/index.html`. Se o navegador servir versões antigas
  dos arquivos, recarregar a página.
- Nos campos `input type="date"`, a digitação automatizada do navegador do painel (`type`)
  não funciona. Use teclas individuais (`key "2 6 1 1 2 0 2 6"`) depois de clicar no
  segmento do dia, ou defina `.value` via JavaScript.

## Checklist de verificação no navegador

1. Financiamento: os 4 modos (prestação, financiamento, meses, taxa), tabela Price (abre,
   fecha, botão Tabela), entrada (toggle e desconto), Limpar, Enter.
2. Tema claro/escuro e modal de ajuda do Financiamento.
3. Aba Juros: um caso de referência, data inicial = hoje ao carregar, edição da data
   inicial, validações, Limpar, Enter, modal de ajuda próprio.
4. Trocar de aba não apaga dados de nenhuma das duas.
5. Mobile (375 px): uma coluna; as datas ficam empilhadas.
6. PWA: o service worker registra e o cache `calculadora-financeira-vX.Y` tem a versão nova
   (ver [pwa.md](pwa.md)).

## Git e GitHub

- Remoto: `origin` = `git@github.com:rildojunior/Calculadora-de-Financiamentos.git`
  (`gh` está autenticado como `rildojunior`, protocolo SSH).
- Branch padrão: `main`. Fluxo: criar uma branch → commit → `gh pr create` → merge.
- Mensagens de commit e descrições de PR em português.
- Histórico relevante: `abbc079` First Commit (v1.0) → `809b15b` Create CNAME → PR #1
  (calculadora de Juros, v2.0) → PR #2 (referência, `_config.yml`, HTTPS).

## Deploy (produção)

- **GitHub Pages**, build "legacy" (Jekyll), publicando a partir de `main`, pasta raiz.
  **Todo merge em `main` vai para produção.** Não há CI nem checks.
- Domínio: `calculadorafinanciamento.rildo.dev` (arquivo `CNAME`, verificado; certificado
  HTTPS aprovado). **Enforce HTTPS ligado**: `http://` redireciona para `https://`.
- `_config.yml` exclui `tests/`, `docs/`, `CLAUDE.md` e `README.md` do site publicado. Se
  criar outro arquivo que não deva ir para o site, adicione-o na lista.
- Acompanhar o build depois do merge:

  ```bash
  gh api repos/rildojunior/Calculadora-de-Financiamentos/pages/builds/latest -q '.status+" "+.commit'
  ```

  Leva cerca de 30 a 60 s até `built`. Depois, conferir o site (ver checklist).
