// JF Oficina v0.20.1 — cadastro rápido em OS e Orçamento
(function(){
  'use strict';
  let ctx=null;
  const ids=()=>new Set((S.produtos||[]).map(p=>String(p.id)));
  const eqids=()=>new Set((S.custom?.equipamentos||[]).map(e=>String(e.id)));

  function addBtn(after,id,text,fn){
    if(!after||document.getElementById(id))return;
    const b=document.createElement('button');b.type='button';b.id=id;b.textContent=text;b.onclick=fn;
    after.insertAdjacentElement('afterend',b);
  }
  function currentBudgetClient(){return document.getElementById('bClient')?.value||''}
  function currentOSClient(){return document.getElementById('osClient')?.value||''}

  function startProduct(where){
    ctx={kind:'product',where,before:ids()};
    openProduct('');
    // Produto criado a partir de OS/orçamento é item de catálogo, sem entrada física automática.
    if(window.productStock) productStock.value='0';
  }
  function startEquipment(where){
    const client=where==='budget'?currentBudgetClient():currentOSClient();
    if(!client){alert('Selecione o cliente antes de cadastrar o equipamento.');return}
    ctx={kind:'equipment',where,client,before:eqids()};
    openEquip('',client);
  }
  function selectNewest(selector,value){
    const els=[...document.querySelectorAll(selector)];
    const el=els[els.length-1];if(!el)return false;
    el.value=String(value);el.dispatchEvent(new Event('change',{bubbles:true}));return true;
  }
  function onProductClosed(){
    if(!ctx||ctx.kind!=='product')return;
    const c=ctx;ctx=null;
    const p=(S.produtos||[]).find(x=>!c.before.has(String(x.id)));
    if(!p)return; // cancelado
    if(c.where==='os'){
      document.getElementById('addMaterial')?.click();
      selectNewest('.matSel',p.id);
    }else{
      document.getElementById('bAddMaterial')?.click();
      selectNewest('.bmSel',p.id);
    }
  }
  function onEquipmentClosed(){
    if(!ctx||ctx.kind!=='equipment')return;
    const c=ctx;ctx=null;
    const e=(S.custom?.equipamentos||[]).find(x=>!c.before.has(String(x.id)) && String(equipClient(x))===String(c.client));
    if(!e)return; // cancelado
    // clients.js já inclui automaticamente o equipamento quando a OS está aberta.
    if(c.where==='budget'){
      document.getElementById('bAddEquipment')?.click();
      selectNewest('.beSel',e.id);
    }
  }
  function install(){
    addBtn(document.getElementById('addMaterial'),'newMaterialProduct','+ Novo produto',()=>startProduct('os'));
    addBtn(document.getElementById('bAddMaterial'),'bNewMaterialProduct','+ Novo produto',()=>startProduct('budget'));
    addBtn(document.getElementById('bAddEquipment'),'bNewEquipment','+ Novo equipamento',()=>startEquipment('budget'));
    // A OS já possui + Novo equipamento no HTML; garante o vínculo com o cliente selecionado.
    const ne=document.getElementById('newEquipment');
    if(ne&&!ne.dataset.inlineCreate){ne.dataset.inlineCreate='1';ne.onclick=()=>startEquipment('os')}
    const pd=document.getElementById('productDlg');if(pd&&!pd.dataset.inlineCreate){pd.dataset.inlineCreate='1';pd.addEventListener('close',onProductClosed)}
    const ed=document.getElementById('equipDlg');if(ed&&!ed.dataset.inlineCreate){ed.dataset.inlineCreate='1';ed.addEventListener('close',onEquipmentClosed)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
  new MutationObserver(install).observe(document.documentElement,{childList:true,subtree:true});
})();
