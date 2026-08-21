// JF Oficina v0.15.12 — remove somente buscas rápidas legadas de materiais e serviços
(function(){
  function clean(){
    const mat=document.querySelector('#tab-materials [data-jfquick="product"]');
    if(mat)mat.remove();
    const srv=document.querySelector('#tab-services [data-jfquick="service"]');
    if(srv)srv.remove();
  }
  addEventListener('DOMContentLoaded',()=>setTimeout(clean,250));
  const mo=new MutationObserver(()=>setTimeout(clean,0));
  addEventListener('DOMContentLoaded',()=>mo.observe(document.body,{childList:true,subtree:true}));
})();
