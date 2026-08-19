function openProduct(id=''){
 let p=id?prodBy(id):null,code=p?productCode(p):nextProductCode();
 productId.value=p?.id||'';productTitle.textContent=p?`Produto ${code}`:'Novo produto';productCode.value=code;
 productDesc.value=p?.descricao||'';productMaker.value=p?productMakerCode(p):'';productBarcode.value=p?.codigo_barras||'SEM GTIN';productCategory.value=p?.categoria||'';
 productStock.value=num(p?.estoque_atual);productMin.value=num(p?.estoque_minimo);productMax.value=num(p?.estoque_maximo);productCost.value=num(p?.valor_custo);productMargin.value=num(p?.margem);productSale.value=num(p?.valor_venda);productSupplier.value=p?.fornecedor||'';productLoc.value=p?.localizacao||'';productObs.value=p?.observacoes||'';
 productImagePreview.dataset.value=p?.imagem||'';productImagePreview.src=p?.imagem||'';productImagePreview.style.display=p?.imagem?'block':'none';
 deleteProduct.classList.toggle('hidden',!p);renderProductQR(code);productDlg.showModal()
}
window.openProduct=openProduct;
productForm.onsubmit=async e=>{
 e.preventDefault();let code=productCode.value.trim();if(!code){alert('Código do produto obrigatório.');return}
 let dup=S.produtos.find(x=>productCode(x)===code&&String(x.id)!==String(productId.value));if(dup){alert('Este código do produto já existe.');return}
 let p=productId.value?prodBy(productId.value):null,created=!p;if(!p){p={id:'P'+Date.now(),ativo:1};S.produtos.unshift(p)}
 let gtin=(productBarcode.value||'').trim()||'SEM GTIN';
 Object.assign(p,{codigo_jf:code,descricao:productDesc.value.trim(),codigo_fabricante:productMaker.value.trim(),codigo_barras:gtin,categoria:productCategory.value.trim(),estoque_atual:num(productStock.value),estoque_minimo:num(productMin.value),estoque_maximo:num(productMax.value),valor_custo:num(productCost.value),margem:num(productMargin.value),valor_venda:num(productSale.value),fornecedor:productSupplier.value.trim(),localizacao:productLoc.value.trim(),observacoes:productObs.value.trim(),imagem:productImagePreview.dataset.value||'',qr:'JF-PRODUTO-'+code});
 if(!isLegacyProduct(p))p.codigo_interno=productMaker.value.trim();
 log('produto',p.id,created?'Produto criado':'Produto/estoque alterado');await saveDB();render();productDlg.close()
}
closeProduct.onclick=productCancel.onclick=()=>productDlg.close();
productCamera.onchange=e=>{handleProductImage(e.target.files[0]);e.target.value=''};
productImageFile.onchange=e=>{handleProductImage(e.target.files[0]);e.target.value=''};
removeProductImage.onclick=()=>{productImagePreview.src='';productImagePreview.dataset.value='';productImagePreview.style.display='none'};
productCost.oninput=()=>{let c=num(productCost.value),m=num(productMargin.value);if(c&&m)productSale.value=(c*(1+m/100)).toFixed(2)};
productMargin.oninput=()=>{let c=num(productCost.value),m=num(productMargin.value);if(c)productSale.value=(c*(1+m/100)).toFixed(2)};
webSearchProduct.onclick=()=>{let q=[productDesc.value,productMaker.value,productBarcode.value!=='SEM GTIN'?productBarcode.value:''].filter(Boolean).join(' ');open('https://www.google.com/search?q='+encodeURIComponent(q),'_blank')};
searchSupplier.onclick=()=>{let q=['comprar',productDesc.value,productMaker.value,productBarcode.value!=='SEM GTIN'?productBarcode.value:''].filter(Boolean).join(' ');open('https://www.google.com/search?q='+encodeURIComponent(q),'_blank')};
printOneLabel.onclick=()=>printLabelsFor([productId.value?prodBy(productId.value):{id:'TMP',codigo_jf:productCode.value,descricao:productDesc.value,localizacao:productLoc.value}]);
deleteProduct.onclick=async()=>{let p=prodBy(productId.value);if(!p)return;if(!confirm(`Enviar o produto ${productCode(p)} para a lixeira por 30 dias?`))return;S.custom.deletedProducts.unshift({id:uid('D'),product_id:p.id,deleted_at:new Date().toISOString()});log('produto',p.id,'Produto enviado à lixeira');await saveDB();productDlg.close();render()};

function deletedRecordFor(id){return S.custom.deletedProducts.find(x=>String(x.product_id)===String(id))}
function daysRemaining(date){let elapsed=(Date.now()-new Date(date).getTime())/86400000;return Math.max(0,30-Math.floor(elapsed))}
function renderTrash(){normalize();trashTable.innerHTML=S.custom.deletedProducts.map(d=>{let p=prodBy(d.product_id);if(!p)return'';return `<tr class="trashrow"><td>${esc(productCode(p))}</td><td>${esc(p.descricao)}</td><td>${new Date(d.deleted_at).toLocaleDateString('pt-BR')}</td><td>${daysRemaining(d.deleted_at)}</td><td><button onclick="restoreProduct('${esc(p.id)}')">Restaurar</button> <button class="danger" onclick="purgeProduct('${esc(p.id)}')">Excluir definitivamente</button></td></tr>`}).join('')}
window.restoreProduct=async id=>{S.custom.deletedProducts=S.custom.deletedProducts.filter(x=>String(x.product_id)!==String(id));log('produto',id,'Produto restaurado da lixeira');await saveDB();renderTrash();render()}
window.purgeProduct=async id=>{let d=deletedRecordFor(id);if(!d)return;if(!confirm('Excluir definitivamente este produto? O código continuará reservado e o histórico das OS será preservado.'))return;let p=prodBy(id);if(p)p.ativo=false;S.custom.deletedProducts=S.custom.deletedProducts.filter(x=>String(x.product_id)!==String(id));log('produto',id,'Produto excluído definitivamente');await saveDB();renderTrash();render()}
function printLabelsFor(products){let list=products.filter(Boolean);if(!list.length){alert('Nenhum produto selecionado.');return}let w=open('','_blank');w.document.write(`<html><head><title>Etiquetas JF</title><script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"><\/script><style>body{font:12px Arial}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.lab{border:1px solid #000;padding:8px;height:150px;display:grid;grid-template-columns:85px 1fr;gap:8px;align-items:center}.qr{width:80px;height:80px}.code{font-size:18px;font-weight:bold}.desc{font-weight:bold}.loc{font-size:10px}@media print{button{display:none}}</style></head><body><button onclick="print()">Imprimir</button><div class="grid">${list.map((p,i)=>`<div class="lab"><div class="qr" id="q${i}"></div><div><div class="code">${esc(productCode(p))}</div><div class="desc">${esc((p.descricao||'').slice(0,70))}</div><div class="loc">${esc(p.localizacao||'')}</div></div></div>`).join('')}</div><script>${list.map((p,i)=>`new QRCode(document.getElementById('q${i}'),{text:'JF-PRODUTO-${productCode(p)}',width:80,height:80});`).join('')}<\/script></body></html>`);w.document.close()}
function addProductByScannedCode(code){
 let clean=String(code||'').replace(/^JF-PRODUTO-/,'').trim(),p=activeProducts().find(x=>productCode(x)===clean);
 if(!p){scanStatus.textContent='Produto não encontrado: '+clean;return}
 work.materiais.push({id:uid('P'),produto_id:p.id,quantidade:1,valor:num(p.valor_venda),desconto:0,acrescimo:0,origem:'Oficina'});renderMaterials();renderFinance();dirty();stopScanner();scanDlg.close();setTab('materials')
}
let scanStream=null,scanTimer=null;
async function openScanner(){
 scanDlg.showModal();scanStatus.textContent='Abrindo câmera...';
 try{
  scanStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}}});
  scanVideo.srcObject=scanStream;
  if('BarcodeDetector'in window){
   let det=new BarcodeDetector({formats:['qr_code']});scanStatus.textContent='Aponte a câmera para o QR da etiqueta.';
   scanTimer=setInterval(async()=>{try{let arr=await det.detect(scanVideo);if(arr.length)addProductByScannedCode(arr[0].rawValue)}catch(e){}},700);
  }else scanStatus.textContent='Leitura automática de QR não é suportada neste navegador. Digite o código do produto abaixo.'
 }catch(e){scanStatus.textContent='Não foi possível acessar a câmera. Digite o código do produto abaixo.'}
}
function stopScanner(){if(scanTimer)clearInterval(scanTimer);scanTimer=null;if(scanStream)scanStream.getTracks().forEach(t=>t.stop());scanStream=null;scanVideo.srcObject=null}
