# PWA, service worker e versão

## Arquivos

- `manifest.json` — nome "Calculadora Financeira" (curto: "Calculadora"), `display:
  standalone`, retrato, cores `#0f1117` (fundo do tema escuro), ícones de `icons/` + `favicon.svg`.
- `index.html` — `<link rel="manifest">`, `apple-touch-icon` (`icons/icon-180.png`),
  `theme-color` e metas `apple-mobile-web-app-*` (barra de status `black`, não translucent,
  para o conteúdo não ficar embaixo dela no iPhone).
- `icons/` — `icon-192.png` e `icon-512.png` (cantos arredondados, iguais ao favicon),
  `icon-180.png` (quadrado cheio, o iOS arredonda) e `maskable-512.png` (calculadora em 72%,
  dentro da zona segura). Gerados renderizando o desenho do `favicon.svg` no Chrome headless.
- `pwa.js` — registra o `sw.js` e cuida da atualização (abaixo).
- `sw.js` — service worker.

## Service worker (`sw.js`)

- `APP_VERSION = 'vX.Y'` → `CACHE_NAME = 'calculadora-financeira-vX.Y'`.
- **Install:** guarda `STATIC_FILES` com `cache: 'reload'` (ignora o cache HTTP, para não
  guardar cópias antigas) e chama `skipWaiting()`.
- **Activate:** apaga os caches com outro nome e chama `clients.claim()`.
- **Fetch:** fontes Google → cache-first (guardadas na primeira visita online); arquivos do
  próprio site → cache-first (`ignoreSearch`); o resto passa direto.
- Arquivo novo usado pelo site → adicionar em `STATIC_FILES` (o teste confere se existem).
- Só funciona em HTTPS ou `localhost`/`127.0.0.1`.

## Como a atualização é forçada

1. A versão sobe → o `sw.js` muda de bytes → o navegador instala o SW novo.
2. `pwa.js` registra com `updateViaCache: 'none'` (o GitHub Pages manda `max-age=600`; sem
   isso, o `sw.js` velho poderia ficar até 10 min no cache HTTP) e chama `reg.update()` toda
   vez que o app volta para a tela (`visibilitychange`), porque apps instalados ficam
   abertos em segundo plano por dias.
3. O SW novo ativa na hora (`skipWaiting` + `clients.claim`), apaga o cache antigo e
   dispara `controllerchange` → `pwa.js` recarrega a página uma vez, já com os arquivos novos.
   Na primeira instalação não recarrega (não havia controlador antes).

## Regra da versão

**Toda atualização publicada sobe a versão**, mesmo pequena: `APP_VERSION` no `sw.js` e as
3 ocorrências no `index.html` (cabeçalho, título e rodapé do modal de ajuda). v2.1 → v2.2…;
o primeiro número só sobe em mudança grande. Conferir com `node tests/versao.test.js`.

## Testar localmente

- Servir por HTTP (ver [deploy-e-testes.md](deploy-e-testes.md)) e abrir
  `http://127.0.0.1:8765/index.html`.
- No console: `(await navigator.serviceWorker.getRegistration())?.active?.scriptURL` e
  `await caches.keys()` (deve listar só `calculadora-financeira-<versão atual>`).
- Depois de mudar o `sw.js`: `(await navigator.serviceWorker.getRegistration()).update()` —
  a página recarrega sozinha quando o SW novo assume.
