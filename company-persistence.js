// JF Oficina v0.15.17 — persistência, migração e recuperação dos dados da empresa
(function(){
 const KEY='jf-company-profile-v1';
 const FIELDS=['nome','razao_social','cnpj','ie','endereco','cidade','uf','cep','email','telefone','whatsapp','logo','pix_tipo','pix_chave','banco','agencia','conta','favorecido','pagamento_obs','payment_qr','mostrar_logo','mostrar_documentos','mostrar_contato','mostrar_pagamento'];
 const DEFAULT_NAME='JF MANUTENÇÕES AGRÍCOLAS';
 const clone=x=>{try{return JSON.parse(JSON.stringify(x||{}))}catch(e){return {}}};
 const meaningful=(k,v)=>{if(typeof v==='boolean')return true;if(v===undefined||v===null||String(v).trim()==='')return false;if(k==='nome'&&String(v).trim()===DEFAULT_NAME)return false;return true};
 function mergeMissing(base,src){base=clone(base);src=src||{};for(const k of FIELDS){if(!meaningful(k,base[k])&&meaningful(k,src[k]))base[k]=clone(src[k])}return base}
 function mergeLocalWins(server,local){const out=clone(server);for(const k of FIELDS)if(meaningful(k,local?.[k]))out[k]=clone(local[k]);return out}
 function get(){S.custom=S.custom||{};S.custom.companyProfile=S.custom.companyProfile||{};return S.custom.companyProfile}
 function mirrorRead(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
 function mirrorWrite(){try{localStorage.setItem(KEY,JSON.stringify(get()))}catch(e){}}
 function score(p){return FIELDS.reduce((n,k)=>n+(meaningful(k,p?.[k])?1:0),0)}
 function paint(){const p=get(),map={cpNome:'nome',cpRazao:'razao_social',cpCnpj:'cnpj',cpIe:'ie',cpEndereco:'endereco',cpCidade:'cidade',cpUf:'uf',cpCep:'cep',cpEmail:'email',cpTelefone:'telefone',cpWhats:'whatsapp',cpPixTipo:'pix_tipo',cpPix:'pix_chave',cpBanco:'banco',cpAgencia:'agencia',cpConta:'conta',cpFav:'favorecido',cpPagObs:'pagamento_obs'};for(const [id,k] of Object.entries(map)){const el=document.getElementById(id);if(el&&document.activeElement!==el)el.value=p[k]||''}const lp=document.getElementById('cpLogoPreview');if(lp&&p.logo){lp.src=p.logo;lp.style.display='block'}const qp=document.getElementById('cpPaymentQRPreview');if(qp&&p.payment_qr){qp.src=p.payment_qr;qp.style.display='block'}}
 async function recover(){let cur=clone(get()),best=mirrorRead(),bestScore=score(best);try{if(typeof jfFindLegacyStates==='function'){for(const c of await jfFindLegacyStates()){const p=c?.state?.custom?.companyProfile;if(score(p)>bestScore){best=clone(p);bestScore=score(p)}}}}catch(e){console.warn('JF company recovery',e)}const merged=mergeMissing(cur,best);if(JSON.stringify(merged)!==JSON.stringify(cur)){S.custom.companyProfile=merged;try{await saveDB()}catch(e){}mirrorWrite();paint();const st=document.getElementById('cpStatus');if(st)st.textContent='Dados anteriores recuperados e preservados.'}else{mirrorWrite();paint()}}
 // Todo save do aplicativo mantém uma cópia local independente do estado sincronizado.
 const originalSave=saveDB;saveDB=async function(){const r=await originalSave.apply(this,arguments);mirrorWrite();return r};
 // Conflitos de sincronização preservam configurações não-array, incluindo os dados da empresa.
 if(typeof jfMergeStatesLocalWins==='function'){const origMerge=jfMergeStatesLocalWins;jfMergeStatesLocalWins=function(server,local){const out=origMerge(server,local);out.custom=out.custom||{};out.custom.companyProfile=mergeLocalWins(server?.custom?.companyProfile||{},local?.custom?.companyProfile||{});return out}}
 // Uma revisão remota antiga nunca pode apagar dados locais já preenchidos da empresa.
 if(typeof jfApplyServerState==='function'){const origApply=jfApplyServerState;jfApplyServerState=async function(payload,revision){const local=clone(get()),next=clone(payload);next.custom=next.custom||{};next.custom.companyProfile=mergeMissing(next.custom.companyProfile||{},local);const r=await origApply(next,revision);mirrorWrite();paint();return r}}
 addEventListener('DOMContentLoaded',()=>setTimeout(recover,650));
 window.JFCompanyPersistence={recover,mirrorWrite};
})();