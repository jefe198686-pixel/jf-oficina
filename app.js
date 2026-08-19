// JF Oficina v0.9.8 — carregador modular
(async()=>{
  const modules=[
    'core.js?v=0.9.8',
    'os.js?v=0.9.8',
    'clients.js?v=0.9.8',
    'products.js?v=0.9.8',
    'updater-tech.js?v=0.9.8',
    'library.js?v=0.9.8',
    'init.js?v=0.9.8'
  ];
  for(const src of modules){
    await new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src=src;
      s.async=false;
      s.onload=resolve;
      s.onerror=()=>reject(new Error('Falha ao carregar '+src));
      document.body.appendChild(s);
    });
  }
})().catch(err=>{
  console.error(err);
  const status=document.getElementById('updateStatus');
  if(status)status.textContent='Falha ao carregar módulos da aplicação. Recarregue o aplicativo.';
});
