// JF Oficina v0.20.5 — cadastro rápido de serviço em OS e orçamento
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 let origin='';
 function ensureDialog(){
   if($('quickServiceDlg'))return;
   const d=document.createElement('dialog');d.id='quickServiceDlg';d.className='modal';
   d.innerHTML=`<form id="quickServiceForm"><div class="dhead"><div><b>Novo serviço</b><div class="small muted">Cadastrar no catálogo e usar imediatamente</div></div><button type="button" id="quickServiceClose">✕</button></div><div class="dbody"><label>Código<input id="qsCode" placeholder="Opcional"></label><label>Descrição<input id="qsName" required placeholder="Descrição do serviço"></label><div class="grid2"><label>Valor<input id="qsValue" type="number" step=".01" min="0" value="0"></label><label>Categoria<input id="qsCategory" placeholder="Ex.: Elétrica, Ar-condicionado"></label></div><label>Palavras-chave<input id="qsKeywords" placeholder="Termos para facilitar a busca"></label></div><div class="dfoot"><button type="button" id="quickServiceCancel">Cancelar</button><button type="submit" class="primary">Salvar e adicionar</button></div></form>`;
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
 function open(where){
   origin=where;['qsCode','qsName','qsCategory','qsKeywords'].forEach(id=>{if($(id))$(id).value=''});if($('qsValue'))$('qsValue').value='0';$('quickServiceDlg').showModal();setTimeout(()=>$('qsName')?.focus(),30);
 }
 async function save(e){
   e.preventDefault();
   const name=$('qsName').value.trim();if(!name)return;
   const s={id:uid('SV'),codigo:$('qsCode').value.trim(),descricao:name,valor:num($('qsValue').value),categoria:$('qsCategory').value.trim(),palavras_chave:$('qsKeywords').value.trim(),ativo:true};
   S.servicos_catalogo=S.servicos_catalogo||[];S.servicos_catalogo.unshift(s);await saveDB();
   $('quickServiceDlg').close();
   if(origin==='os'&&typeof work!=='undefined'&&work){work.servicos=work.servicos||[];work.servicos.unshift({id:uid('S'),servico_id:s.id,descricao:s.descricao,quantidade:1,valor:num(s.valor),desconto:0,acrescimo:0,tecnico:work.tecnico||'JEFERSON'});if(typeof renderServices==='function')renderServices();if(typeof renderFinance==='function')renderFinance();if(typeof dirty==='function')dirty();}
   if(origin==='budget'){
     const add=$('bAddService');if(add)add.click();
     setTimeout(()=>{const sels=[...document.querySelectorAll('#bServices .bsSel')];const sel=sels[sels.length-1];if(sel){sel.value=s.id;sel.dispatchEvent(new Event('change',{bubbles:true}));}const q=$('sqDesc');if(!sel&&q){q.value=s.descricao;q.dispatchEvent(new Event('input',{bubbles:true}));}},30);
   }
 }
 addEventListener('DOMContentLoaded',()=>setTimeout(ensureButtons,180));
 new MutationObserver(ensureButtons).observe(document.documentElement,{childList:true,subtree:true});
})();