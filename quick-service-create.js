// JF Oficina v0.20.7 — cadastro rápido de serviço com código automático em OS e orçamento
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 let origin='';
 function services(){S.servicos_catalogo=S.servicos_catalogo||[];return S.servicos_catalogo}
 function usedCodes(){return new Set(services().map(s=>String(s.codigo||'').trim().toUpperCase()).filter(Boolean))}
 function nextServiceCode(){
   const used=usedCodes();let max=0;
   services().forEach(s=>{const m=String(s.codigo||'').trim().toUpperCase().match(/^SV(\d+)$/);if(m)max=Math.max(max,Number(m[1])||0)});
   let n=max+1,code='';do{code='SV'+String(n++).padStart(4,'0')}while(used.has(code));return code;
 }
 async function ensureServiceCodes(){
   let changed=false;
   services().forEach(s=>{if(!String(s.codigo||'').trim()){s.codigo=nextServiceCode();changed=true}});
   if(changed)await saveDB();
   return changed;
 }
 function ensureDialog(){
   if($('quickServiceDlg'))return;
   const d=document.createElement('dialog');d.id='quickServiceDlg';d.className='modal';
   d.innerHTML=`<form id="quickServiceForm"><div class="dhead"><div><b>Novo serviço</b><div class="small muted">Cadastrar no catálogo e usar imediatamente</div></div><button type="button" id="quickServiceClose">✕</button></div><div class="dbody"><label>Código<input id="qsCode" readonly title="Código gerado automaticamente pelo sistema"></label><div class="small muted">O código é gerado automaticamente e não é reutilizado.</div><label>Descrição<input id="qsName" required placeholder="Descrição do serviço"></label><div class="grid2"><label>Valor<input id="qsValue" type="number" step=".01" min="0" value="0"></label><label>Categoria<input id="qsCategory" placeholder="Ex.: Elétrica, Ar-condicionado"></label></div><label>Palavras-chave<input id="qsKeywords" placeholder="Termos para facilitar a busca"></label></div><div class="dfoot"><button type="button" id="quickServiceCancel">Cancelar</button><button type="submit" class="primary">Salvar e adicionar</button></div></form>`;
   document.body.appendChild(d);
   $('quickServiceClose').onclick=$('quickServiceCancel').onclick=()=>d.close();
   $('quickServiceForm').onsubmit=save;
 }
 function ensureButtons(){
   ensureDialog();
   const budgetPane=$('btab-services');
   if(budgetPane&&!$('bQuickNewService')){
     const btn=document.createElement('button');btn.type='button';btn.id='bQuickNewService';btn.className='primary';btn.textContent='+ Criar novo serviço';btn.onclick=()=>open('budget');
     const section=budgetPane.querySelector('.section');const picker=budgetPane.querySelector('.srvQuickPicker');
     if(picker)picker.insertAdjacentElement('afterend',btn);else section?.insertBefore(btn,$('bServices'));
   }
   const osPane=$('tab-services');
   if(osPane&&!$('osQuickNewService')){
     const btn=document.createElement('button');btn.type='button';btn.id='osQuickNewService';btn.className='primary';btn.textContent='+ Criar novo serviço';btn.onclick=()=>open('os');
     const picker=osPane.querySelector('.srvQuickPicker');
     if(picker)picker.insertAdjacentElement('afterend',btn);else osPane.querySelector('.section')?.insertBefore(btn,$('serviceRows'));
   }
 }
 async function open(where){
   origin=where;await ensureServiceCodes();['qsName','qsCategory','qsKeywords'].forEach(id=>{if($(id))$(id).value=''});if($('qsCode'))$('qsCode').value=nextServiceCode();if($('qsValue'))$('qsValue').value='0';$('quickServiceDlg').showModal();setTimeout(()=>$('qsName')?.focus(),30);
 }
 async function save(e){
   e.preventDefault();
   const name=$('qsName').value.trim();if(!name)return;
   await ensureServiceCodes();
   let code=String($('qsCode').value||'').trim().toUpperCase();if(!code||usedCodes().has(code))code=nextServiceCode();
   const s={id:uid('SV'),codigo:code,descricao:name,valor:num($('qsValue').value),categoria:$('qsCategory').value.trim(),palavras_chave:$('qsKeywords').value.trim(),ativo:true};
   services().unshift(s);await saveDB();
   $('quickServiceDlg').close();
   if(origin==='os'&&typeof work!=='undefined'&&work){work.servicos=work.servicos||[];work.servicos.unshift({id:uid('S'),servico_id:s.id,descricao:s.descricao,quantidade:1,valor:num(s.valor),desconto:0,acrescimo:0,tecnico:work.tecnico||'JEFERSON'});if(typeof renderServices==='function')renderServices();if(typeof renderFinance==='function')renderFinance();if(typeof dirty==='function')dirty();}
   if(origin==='budget'){
     const add=$('bAddService');if(add)add.click();
     setTimeout(()=>{const sels=[...document.querySelectorAll('#bServices .bsSel')];const sel=sels[sels.length-1];if(sel){sel.value=s.id;sel.dispatchEvent(new Event('change',{bubbles:true}));}const q=$('sqDesc');if(!sel&&q){q.value=s.descricao;q.dispatchEvent(new Event('input',{bubbles:true}));}},30);
   }
 }
 addEventListener('DOMContentLoaded',()=>setTimeout(async()=>{ensureButtons();await ensureServiceCodes();},180));
 new MutationObserver(ensureButtons).observe(document.documentElement,{childList:true,subtree:true});
})();