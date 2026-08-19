// JF Oficina v0.11.3 — integridade offline para cadastros e estoque
(function(){
  function moveSum(state,productId){
    const moves=state?.custom?.stockMoves||[];let total=0;
    for(const m of moves)if(String(m?.produto_id||'')===String(productId))total+=Number(m.delta)||0;
    return total;
  }
  function ensureLedger(state){
    if(!state||typeof state!=='object')return false;
    state.custom=state.custom||{};
    if(!Array.isArray(state.custom.stockMoves))state.custom.stockMoves=[];
    if(!state.custom.stockBase||typeof state.custom.stockBase!=='object'||Array.isArray(state.custom.stockBase))state.custom.stockBase={};
    let changed=false;
    for(const p of state.produtos||[]){
      const id=String(p?.id||'');if(!id)continue;
      if(!Object.prototype.hasOwnProperty.call(state.custom.stockBase,id)){
        state.custom.stockBase[id]=(Number(p.estoque_atual)||0)-moveSum(state,id);changed=true;
      }
    }
    return changed;
  }
  function reconcileStock(state){
    ensureLedger(state);
    const seen=new Set(),moves=[];
    for(const m of state.custom.stockMoves||[]){
      const id=String(m?.id||'');if(id&&seen.has(id))continue;if(id)seen.add(id);moves.push(m);
    }
    state.custom.stockMoves=moves;
    for(const p of state.produtos||[]){
      const id=String(p?.id||'');if(!id)continue;
      p.estoque_atual=(Number(state.custom.stockBase[id])||0)+moveSum(state,id);
    }
    return state;
  }
  function mergeBases(server,local,out){
    ensureLedger(server);ensureLedger(local);ensureLedger(out);
    out.custom.stockBase={...(local.custom.stockBase||{}),...(server.custom.stockBase||{})};
    for(const p of out.produtos||[]){
      const id=String(p?.id||'');if(!id)continue;
      if(!Object.prototype.hasOwnProperty.call(out.custom.stockBase,id)){
        const src=(server.produtos||[]).find(x=>String(x?.id||'')===id)||(local.produtos||[]).find(x=>String(x?.id||'')===id)||p;
        out.custom.stockBase[id]=(Number(src?.estoque_atual)||0)-moveSum(src===p?out:(server.produtos||[]).includes(src)?server:local,id);
      }
    }
  }

  if(typeof jfMergeStatesLocalWins==='function'){
    const originalMerge=jfMergeStatesLocalWins;
    jfMergeStatesLocalWins=function(server,local){
      const s=deep(server||{}),l=deep(local||{});ensureLedger(s);ensureLedger(l);
      const out=originalMerge(s,l);mergeBases(s,l,out);return reconcileStock(out);
    };
  }
  if(typeof jfApplyServerState==='function'){
    const originalApply=jfApplyServerState;
    jfApplyServerState=async function(payload,revision){return originalApply(reconcileStock(deep(payload||{})),revision)};
  }

  // Registra toda alteração manual de quantidade como movimento, evitando perda
  // quando dois aparelhos alteram o mesmo produto enquanto estão offline.
  function installProductStockLedger(){
    if(typeof productForm==='undefined'||!productForm||productForm.dataset.jfLedger==='1')return;
    productForm.dataset.jfLedger='1';
    const original=productForm.onsubmit;
    productForm.onsubmit=async function(ev){
      const beforeId=String(productId?.value||''),code=String(productCode?.value||'').trim();
      const existing=beforeId&&typeof prodBy==='function'?prodBy(beforeId):null;
      const oldStock=Number(existing?.estoque_atual)||0;
      ensureLedger(S);
      const r=await original.call(this,ev);
      let p=beforeId&&typeof prodBy==='function'?prodBy(beforeId):null;
      if(!p&&code)p=(S.produtos||[]).find(x=>String(typeof window.productCode==='function'?window.productCode(x):(x.codigo_jf||''))===code)||null;
      if(!p)return r;
      const id=String(p.id||'');if(!id)return r;
      ensureLedger(S);
      if(!existing){
        S.custom.stockBase[id]=Number(p.estoque_atual)||0;
      }else{
        const delta=(Number(p.estoque_atual)||0)-oldStock;
        if(delta){
          S.custom.stockMoves.unshift({id:uid('M'),at:new Date().toISOString(),produto_id:id,delta,origem:'AJUSTE MANUAL'});
          p.estoque_atual=(Number(S.custom.stockBase[id])||0)+moveSum(S,id);
        }
      }
      await saveDB();render();return r;
    };
  }

  const currentSave=saveDB;
  saveDB=async function(){ensureLedger(S);reconcileStock(S);return currentSave.apply(this,arguments)};

  addEventListener('DOMContentLoaded',async()=>{
    installProductStockLedger();
    if(ensureLedger(S)){reconcileStock(S);await saveDB();render()}
  });
})();