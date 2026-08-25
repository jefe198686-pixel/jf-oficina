// JF Oficina v0.16.5 — dados completos do equipamento no PDF
(function(){
 function detailedEquipName(id){
   const z=typeof equipBy==='function'?equipBy(id):null;
   if(!z)return typeof window.__jfOriginalEquipName==='function'?window.__jfOriginalEquipName(id):'';
   const link=(typeof work!=='undefined'&&work?.equipamentos||[]).find(x=>String(x.equipamento_id)===String(id));
   const model=z.equipamento||z.modelo||z.descricao||'';
   const parts=[
     z.tipo&&`Tipo: ${z.tipo}`,
     z.marca&&`Marca: ${z.marca}`,
     model&&`Modelo: ${model}`,
     (z.numero_serie||z.serie)&&`Série/Chassi: ${z.numero_serie||z.serie}`,
     z.patrimonio&&`Patrimônio: ${z.patrimonio}`,
     z.ano&&`Ano: ${z.ano}`,
     z.horimetro&&`Horímetro cadastrado: ${z.horimetro}`,
     link?.horimetro&&`Horímetro nesta OS: ${link.horimetro}`,
     z.local&&`Local/Fazenda: ${z.local}`,
     z.observacoes&&`Observações: ${z.observacoes}`
   ].filter(Boolean);
   return parts.join(' · ');
 }
 function install(){
   if(!window.JFCompanyProfile?.printDoc||typeof window.equipName!=='function')return;
   if(!window.__jfOriginalEquipName)window.__jfOriginalEquipName=window.equipName;
   const originalPrint=window.JFCompanyProfile.printDoc;
   if(originalPrint.__jfEquipDetails)return;
   function wrappedPrint(){
     const old=window.equipName;
     try{window.equipName=detailedEquipName;return originalPrint.apply(this,arguments)}
     finally{window.equipName=old}
   }
   wrappedPrint.__jfEquipDetails=true;
   window.JFCompanyProfile.printDoc=wrappedPrint;
   const b=document.getElementById('printOS');if(b)b.onclick=wrappedPrint;
   document.querySelectorAll('[id*="printBudget"],[id*="bPrint"]').forEach(x=>x.onclick=wrappedPrint);
 }
 addEventListener('DOMContentLoaded',()=>setTimeout(install,1200));
 setInterval(install,2500);
})();