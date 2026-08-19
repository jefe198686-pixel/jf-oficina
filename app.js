// JF Oficina v0.10.0 — carregador modular síncrono
// Carrega os módulos na ordem original antes do DOMContentLoaded.
document.write([
  '<script src="core.js?v=0.10.0"><\/script>',
  '<script src="os.js?v=0.10.0"><\/script>',
  '<script src="clients.js?v=0.10.0"><\/script>',
  '<script src="products.js?v=0.10.0"><\/script>',
  '<script src="updater-tech.js?v=0.10.0"><\/script>',
  '<script src="library.js?v=0.10.0"><\/script>',
  '<script src="service-intelligence.js?v=0.10.0"><\/script>',
  '<script src="recovery.js?v=0.10.0"><\/script>',
  '<script src="release.js?v=0.10.0"><\/script>',
  '<script src="init.js?v=0.10.0"><\/script>'
].join(''));
