// JF Oficina v0.16.3 — correção de edição de cliente/equipamento
(function(){
 function install(){
  if(typeof window.openEquip!=='function'||typeof window.openClient!=='function')return;
  if(window.openEquip.__jfClientFix)return;
  const originalOpenEquip=window.openEquip;
  window.openEquip=function(id='',client=''){
   const eq=id&&typeof equipBy==='function'?equipBy(id):null;
   const owner=eq&&typeof equipClient==='function'?equipClient(eq):client;
   originalOpenEquip(id,owner);
   const sel=document.getElementById('equipClient');
   if(sel&&owner){sel.value=String(owner);sel.disabled=true;sel.required=false;sel.dataset.lockedClient=String(owner)}
  };
  window.openEquip.__jfClientFix=true;

  const originalOpenClient=window.openClient;
  window.openClient=function(id=''){
   originalOpenClient(id);
   const name=document.getElementById('clientName');
   if(name){name.readOnly=false;name.disabled=false;name.removeAttribute('readonly');name.removeAttribute('disabled')}
  };

  const form=document.getElementById('equipForm');
  if(form&&!form.dataset.jfClientFix){
   form.dataset.jfClientFix='1';
   form.addEventListener('submit',()=>{
    const sel=document.getElementById('equipClient');
    if(sel&&sel.disabled){sel.disabled=false;sel.value=sel.dataset.lockedClient||sel.value}
   },true);
  }

  const cancel=()=>{const sel=document.getElementById('equipClient');if(sel){sel.disabled=false;delete sel.dataset.lockedClient}};
  document.getElementById('closeEquip')?.addEventListener('click',cancel);
  document.getElementById('equipCancel')?.addEventListener('click',cancel);
 }
 addEventListener('DOMContentLoaded',()=>setTimeout(install,1200));
 setTimeout(install,2200);
})();