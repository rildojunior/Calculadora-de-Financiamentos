// Confere que a versão do service worker (sw.js) é a mesma exibida no index.html.
// A versão precisa subir a cada atualização publicada: é a mudança no sw.js que
// faz os apps instalados (PWA) baixarem os arquivos novos.
// Uso: node tests/versao.test.js
const fs = require('fs')
const path = require('path')
const assert = require('assert')

const raiz = path.join(__dirname, '..')
const sw = fs.readFileSync(path.join(raiz, 'sw.js'), 'utf8')
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8')

const m = sw.match(/const APP_VERSION = '(v\d+\.\d+(?:\.\d+)?)'/)
assert(m, 'APP_VERSION não encontrada em sw.js')
const versao = m[1]

const noHtml = [...html.matchAll(/\bv\d+\.\d+(?:\.\d+)?\b/g)].map(x => x[0])
assert.strictEqual(noHtml.length, 3, `esperava 3 versões no index.html, achei ${noHtml.length}: ${noHtml}`)
noHtml.forEach(v => assert.strictEqual(v, versao, `index.html mostra ${v}, sw.js tem ${versao}`))

// Todo arquivo listado no cache precisa existir (senão a instalação do SW falha).
const lista = [...sw.matchAll(/'\.\/([^']+)'/g)].map(x => x[1])
lista.forEach(f => assert(fs.existsSync(path.join(raiz, f)), `sw.js lista ${f}, que não existe`))

console.log(`OK — versão ${versao} igual no sw.js e no index.html; ${lista.length} arquivos do cache existem.`)
