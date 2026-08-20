// JF Oficina v0.15.7 — leitor QR persistente em Materiais da OS e Orçamento
(function(){
 let target='os',stream=null,timer=null;
 const $=id=>document.getElementById(id);
 function productFromCode(raw){
   const clean=String(raw||'').replace(/^JF-PRODUTO-/i,'').trim();
   return activeProducts().find(p=>String(productCode(p)).trim()===clean)||activeProducts().find(p=>String(p.codigo_barras||'').trim()===clean);
 }
 function currentOS(){try{return (typeof work!=='undefined'&&work&&Array.isArray(work.materiais))?work:null}catch(e){return null}}
 function addToOS(p){
   const w=currentOS();
   if(!w){alert('Não foi possível identificar a OS aberta. Feche o leitor e abra novamente pela aba Materiais.');return false}
   w.materiais.push({id:uid('P'),produto_id:p.id,quantidade:1,valor:num(p.valor_venda),desconto:0,acrescimo:0,origem:'Oficina'});
   renderMaterials();renderFinance();dirty();if(typeof setTab==='function')setTab('materials');return true;
 }
 function addToBudget(p){
   const add=$('bAddMaterial');if(!add){alert('Abra um orçamento antes de ler a peça.');return false}
   add.click();
   const sels=[...document.querySelectorAll('#bMaterials .bmSel')],sel=sels[sels.length-1];
   if(!sel)return false;sel.value=String(p.id);sel.dispatchEvent(new Event('change',{bubbles:true}));return true;
 }
 function stop(){if(timer)clearInterval(timer);timer=null;if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;const v=$('scanVideo');if(v)v.srcObject=null}
 function accept(raw){
   const p=productFromCode(raw);
   if(!p){const st=$('scanStatus');if(st)st.textContent='Produto não encontrado: '+String(raw||'').replace(/^JF-PRODUTO-/i,'').trim();return}
   const ok=target==='budget'?addToBudget(p):addToOS(p);
   if(ok){stop();$('scanDlg')?.close()}
 }
 async function open(mode){
   target=mode||'os';const dlg=$('scanDlg'),st=$('scanStatus'),v=$('scanVideo');if(!dlg)return;
   dlg.showModal();st.textContent='Abrindo câmera...';
   try{
     stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}}});v.srcObject=stream;
     if('BarcodeDetector' in window){const det=new BarcodeDetector({formats:['qr_code']});st.textContent='Aponte a câmera para o QR da etiqueta.';timer=setInterval(async()=>{try{const a=await det.detect(v);if(a.length)accept(a[0].rawValue)}catch(e){}},650)}
     else st.textContent='Leitura automática não suportada neste navegador. Digite o código abaixo.';
   }catch(e){st.textContent='Não foi possível acessar a câmera. Digite o código do produto abaixo.'}
 }
 function makeToolbar(id,mode,text){
   const bar=document.createElement('div');bar.id=id;bar.className='toolbar qrMaterialToolbar';bar.style.cssText='margin:8px 0 14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap';
   const b=document.createElement('button');b.type='button';b.className='primary';b.textContent='📷 Ler QR da peça';b.onclick=()=>open(mode);
   const s=document.createElement('span');s.className='small muted';s.textContent=text;
   bar.append(b,s);return bar;
 }
 function installOSButton(){
   const pane=$('tab-materials');if(!pane)return;
   let bar=$('qrMaterialToolbarOS');
   if(!bar){bar=makeToolbar('qrMaterialToolbarOS','os','Escaneie a etiqueta para adicionar a peça à OS aberta.');const anchor=$('materialRows')||pane.firstElementChild;anchor?.parentNode?.insertBefore(bar,anchor)||pane.prepend(bar)}
   bar.style.display='flex';
   const old=$('scanMaterialQR');if(old)old.style.display='none';
 }
 function installBudgetButton(){
   const pane=$('btab-materials');if(!pane)return;
   let bar=$('qrMaterialToolbarBudget');
   if(!bar){bar=makeToolbar('qrMaterialToolbarBudget','budget','Escaneie a etiqueta para adicionar a peça ao orçamento sem movimentar estoque.');const anchor=$('bMaterials')||pane.firstElementChild;anchor?.parentNode?.insertBefore(bar,anchor)||pane.prepend(bar)}
   bar.style.display='flex';
   const old=$('scanBudgetQR');if(old)old.style.display='none';
 }
 function install(){
   installOSButton();installBudgetButton();
   const close=$('closeScan');if(close)close.onclick=()=>{stop();$('scanDlg')?.close()};
   const manual=$('manualAddProduct');if(manual)manual.onclick=()=>accept($('manualScanCode')?.value||'');
 }
 addEventListener('DOMContentLoaded',()=>{install();const mo=new MutationObserver(()=>install());mo.observe(document.body,{childList:true,subtree:true})});
 window.JFMaterialQR={open,stop,install};
})();