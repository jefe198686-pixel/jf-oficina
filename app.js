// JF Oficina v0.9.8 — carregador modular síncrono
// Carrega os módulos na ordem original antes do DOMContentLoaded.
document.write([
  '<script src="core.js?v=0.9.8"><\/script>',
  '<script src="os.js?v=0.9.8"><\/script>',
  '<script src="clients.js?v=0.9.8"><\/script>',
  '<script src="products.js?v=0.9.8"><\/script>',
  '<script src="updater-tech.js?v=0.9.8"><\/script>',
  '<script src="library.js?v=0.9.8"><\/script>',
  '<script src="init.js?v=0.9.8"><\/script>'
].join(''));
