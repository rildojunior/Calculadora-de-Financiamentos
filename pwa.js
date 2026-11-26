/* =============================================
   PWA — registro do service worker e atualização forçada
   Carregado depois de script.js e juros.js.
   ============================================= */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // updateViaCache: 'none' → o navegador sempre busca o sw.js na rede ao
    // verificar atualizações (o GitHub Pages manda cache de 10 min).
    navigator.serviceWorker
      .register('sw.js', { updateViaCache: 'none' })
      .then(reg => {
        // Apps instalados ficam abertos em segundo plano por muito tempo:
        // verifica de novo sempre que o app volta para a tela.
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') reg.update().catch(() => {})
        })
      })
      .catch(() => {})
  })

  // Quando uma versão nova assume o controle (sw.js usa skipWaiting +
  // clients.claim), recarrega a página uma vez para já usar os arquivos novos.
  // Na primeira instalação não há controlador anterior, então não recarrega.
  if (navigator.serviceWorker.controller) {
    let recarregou = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (recarregou) return
      recarregou = true
      window.location.reload()
    })
  }
}
