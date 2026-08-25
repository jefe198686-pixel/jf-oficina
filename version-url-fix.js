// JF Oficina v0.16.1 — remove referência de versão antiga da URL após carregar a versão atual
(function(){
 addEventListener('DOMContentLoaded',()=>{
   try{
     const u=new URL(location.href),v=u.searchParams.get('v');
     if(v&&v!=='0.16.1'){
       u.searchParams.set('v','0.16.1');
       history.replaceState(null,'',u.pathname+'?'+u.searchParams.toString());
     }
   }catch(e){}
 });
})();