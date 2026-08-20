// JF Oficina v0.15.4 — leitor QR de materiais em OS e Orçamento
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
 function accept(raw){const p=productFromCode(raw);if(!p){$('scanStatus').textContent='Produto não encontrado: '+String(raw||'').replace(/^JF-PRODUTO-/i,'').trim();return}const ok=target==='budget'?addToBudget(p):addToOS(p);if(ok){stop();$('scanDlg')?.close()}}
 async function open(mode){target=mode||'os';const dlg=$('scanDlg'),st=$('scanStatus'),v=$('scanVideo');if(!dlg)return;dlg.showModal();st.textContent='Abrindo câmera...';
   try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}}});v.srcObject=stream;
     if('BarcodeDetector' in window){const det=new BarcodeDetector({formats:['qr_code']});st.textContent='Aponte a câmera para o QR da etiqueta.';timer=setInterval(async()=>{try{const a=await det.detect(v);if(a.length)accept(a[0].rawValue)}catch(e){}},650)}
     else st.textContent='Leitura automática não suportada neste navegador. Digite o código abaixo.';
   }catch(e){st.textContent='Não foi possível acessar a câmera. Digite o código do produto abaixo.'}
 }
 function install(){
   const osBtn=$('scanMaterialQR');if(osBtn){osBtn.hidden=false;osBtn.style.display='inline-flex';osBtn.onclick=()=>open('os')}
   const pane=$('btab-materials');if(pane&&!$('scanBudgetQR')){const add=$('bAddMaterial');if(add){const b=document.createElement('button');b.type='button';b.id='scanBudgetQR';b.textContent='📷 Ler QR Code';b.onclick=()=>open('budget');add.insertAdjacentElement('afterend',b)}}
   const close=$('closeScan');if(close)close.onclick=()=>{stop();$('scanDlg')?.close()};
   const manual=$('manualAddProduct');if(manual)manual.onclick=()=>accept($('manualScanCode')?.value||'');
 }
 const mo=new MutationObserver(()=>install());addEventListener('DOMContentLoaded',()=>{install();mo.observe(document.body,{childList:true,subtree:true})});
 window.JFMaterialQR={open,stop};
})();