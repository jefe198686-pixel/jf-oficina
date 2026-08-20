// JF Oficina v0.15.5 — leitor QR de materiais sempre visível em OS e Orçamento
(function(){
 let target='os',stream=null,timer=null;
 const $=id=>document.getElementById(id);
 function productFromCode(raw){
   const clean=String(raw||'').replace(/^JF-PRODUTO-/i,'').trim();
   return activeProducts().find(p=>String(productCode(p)).trim()===clean)||activeProducts().find(p=>String(p.codigo_barras||'').trim()===clean);
 }
 function addToOS(p){
   if(!window.work||!Array.isArray(work.materiais)){alert('Abra uma OS antes de ler a peça.');return false}
   work.materiais.push({id:uid('P'),produto_id:p.id,quantidade:1,valor:num(p.valor_venda),desconto:0,acrescimo:0,origem:'Oficina'});
   renderMaterials();renderFinance();dirty();if(typeof setTab==='function')setTab('materials');return true;
 }
 function addToBudget(p){
   const add=$('bAddMaterial');if(!add){alert('Abra um orçamento antes de ler a peça.');return false}
   add.click();
   const sels=[...document.querySelectorAll('#bMaterials .bmSel')],sel=sels[sels.length-1];
   if(!sel)return false;sel.value=String(p.id);sel.dispatchEvent(new Event('change',{bubbles:true}));return true;
 }
 function stop(){if(timer)clearInterval(timer);timer=null;if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;const v=$('scanVideo');if(v)v.srcObject=null}
 function accept(raw){const p=productFromCode(raw);if(!p){const s=$('scanStatus');if(s)s.textContent='Produto não encontrado: '+String(raw||'').replace(/^JF-PRODUTO-/i,'').trim();return}const ok=target==='budget'?addToBudget(p):addToOS(p);if(ok){stop();$('scanDlg')?.close()}}
 async function open(mode){target=mode||'os';const dlg=$('scanDlg'),st=$('scanStatus'),v=$('scanVideo');if(!dlg||!st||!v)return;dlg.showModal();st.textContent='Abrindo câmera...';
   try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}}});v.srcObject=stream;
     if('BarcodeDetector' in window){const det=new BarcodeDetector({formats:['qr_code']});st.textContent='Aponte a câmera para o QR da etiqueta.';timer=setInterval(async()=>{try{const a=await det.detect(v);if(a.length)accept(a[0].rawValue)}catch(e){}},650)}
     else st.textContent='Leitura automática não suportada neste navegador. Digite o código abaixo.';
   }catch(e){st.textContent='Não foi possível acessar a câmera. Digite o código do produto abaixo.'}
 }
 function ensureOSButton(){
   const pane=$('tab-materials');if(!pane)return;
   const sec=pane.querySelector('.section');if(!sec)return;
   let bar=$('jfOSMaterialActions');
   if(!bar){
     bar=document.createElement('div');bar.id='jfOSMaterialActions';bar.className='toolbar jfQrToolbar';
     bar.innerHTML='<button type="button" id="jfScanMaterialQR" class="primary">📷 Ler QR da peça</button><span class="small muted">Escaneie a etiqueta para adicionar a peça à OS.</span>';
     const rows=$('materialRows');if(rows)rows.insertAdjacentElement('beforebegin',bar);else sec.appendChild(bar);
   }
   const b=$('jfScanMaterialQR');if(b)b.onclick=()=>open('os');
   const legacy=$('scanMaterialQR');if(legacy)legacy.style.display='none';
 }
 function ensureBudgetButton(){
   const pane=$('btab-materials');if(!pane)return;
   const sec=pane.querySelector('.section');if(!sec)return;
   let bar=$('jfBudgetMaterialActions');
   if(!bar){
     bar=document.createElement('div');bar.id='jfBudgetMaterialActions';bar.className='toolbar jfQrToolbar';
     bar.innerHTML='<button type="button" id="jfScanBudgetQR" class="primary">📷 Ler QR da peça</button><span class="small muted">Adiciona ao orçamento sem movimentar estoque.</span>';
     const rows=$('bMaterials');if(rows)rows.insertAdjacentElement('beforebegin',bar);else sec.appendChild(bar);
   }
   const b=$('jfScanBudgetQR');if(b)b.onclick=()=>open('budget');
 }
 function install(){
   ensureOSButton();ensureBudgetButton();
   const close=$('closeScan');if(close)close.onclick=()=>{stop();$('scanDlg')?.close()};
   const manual=$('manualAddProduct');if(manual)manual.onclick=()=>accept($('manualScanCode')?.value||'');
 }
 const mo=new MutationObserver(()=>install());
 addEventListener('DOMContentLoaded',()=>{install();mo.observe(document.body,{childList:true,subtree:true})});
 setTimeout(install,300);setTimeout(install,1200);
 window.JFMaterialQR={open,stop,install};
 const style=document.createElement('style');style.textContent='.jfQrToolbar{margin:10px 0;align-items:center;gap:10px;flex-wrap:wrap}.jfQrToolbar .primary{font-weight:700}';document.head.appendChild(style);
})();