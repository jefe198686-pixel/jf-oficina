// JF Oficina v0.11.2 — reconciliação de numeração de OS após sincronização
(function(){
  if(typeof jfPushState!=='function')return;
  const originalPush=jfPushState;
  jfPushState=async function(baseRevision){
    const r=await originalPush(baseRevision);
    if(r && !r.conflict && r.payload && typeof r.payload==='object'){
      await jfApplyServerState(r.payload,r.revision);
      if(Array.isArray(r.renumbered) && r.renumbered.length){
        const resumo=r.renumbered.slice(0,4).map(x=>`OS ${x.from} → ${x.to}`).join(', ');
        jfSetSyncStatus(`Sincronizado. Numeração ajustada para evitar duplicidade: ${resumo}${r.renumbered.length>4?'…':''}`,'ok');
      }
    }
    return r;
  };
})();
