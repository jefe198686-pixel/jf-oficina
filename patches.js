// JF Oficina — camada modular de atualização
// A partir da v0.9.7, correções e evoluções pequenas podem ser publicadas aqui
// sem regravar o index.html monolítico.

window.JF_RELEASE_VERSION='0.9.7';

(function(){
  const RELEASE=window.JF_RELEASE_VERSION;

  function applyReleaseIdentity(){
    document.title='JF Oficina v'+RELEASE;
    const ver=document.querySelector('.ver');
    if(ver)ver.textContent='v'+RELEASE+' • Agrícola • Elétrica • Ar-condicionado';
    const status=document.getElementById('updateStatus');
    if(status){
      status.textContent=location.protocol==='https:'
        ? 'Versão instalada: '+RELEASE+' — atualização automática ativa.'
        : 'Versão instalada: '+RELEASE+' — modo local; atualização automática indisponível.';
    }
  }

  window.refreshInstalledVersionLabel=applyReleaseIdentity;

  window.checkAppUpdate=async function(showMessage=false){
    let info=null;
    try{
      const r=await fetch('./version.json?ts='+Date.now(),{cache:'no-store',headers:{'cache-control':'no-cache'}});
      if(r.ok)info=await r.json();
    }catch(e){}

    const status=document.getElementById('updateStatus');
    if(!info){
      if(showMessage&&status)status.textContent='Sem conexão para verificar. Versão instalada: '+RELEASE;
      return false;
    }

    const parts=v=>String(v||'0').split('.').map(x=>parseInt(x,10)||0);
    const newer=(a,b)=>{a=parts(a);b=parts(b);for(let i=0;i<Math.max(a.length,b.length);i++){if((a[i]||0)>(b[i]||0))return true;if((a[i]||0)<(b[i]||0))return false}return false};

    if(newer(info.version,RELEASE)){
      if(status)status.textContent='Nova versão '+info.version+' encontrada. Atualizando...';
      try{
        const reg=await navigator.serviceWorker?.getRegistration();
        if(reg){await reg.update();if(reg.waiting)reg.waiting.postMessage({type:'SKIP_WAITING'});}
      }catch(e){}
      setTimeout(()=>location.replace(location.pathname+'?v='+encodeURIComponent(info.version)),1500);
      return true;
    }

    if(showMessage&&status)status.textContent='Versão instalada: '+RELEASE+' — aplicativo atualizado. Atualização automática ativa.';
    return false;
  };

  applyReleaseIdentity();
  addEventListener('DOMContentLoaded',applyReleaseIdentity);
})();
