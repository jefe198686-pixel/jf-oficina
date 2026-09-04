// JF Oficina v0.20.33 — transporte same-origin para Supabase
(function(){
  const SUPA='https://vfswmnkbwtlzensycnfj.supabase.co';
  const nativeFetch=window.fetch.bind(window);
  function proxiedUrl(input){
    try{
      const raw=typeof input==='string'?input:input?.url;
      if(!raw||!raw.startsWith(SUPA))return null;
      const u=new URL(raw);
      return '/api/supabase-proxy?path='+encodeURIComponent(u.pathname+u.search);
    }catch{return null}
  }
  window.fetch=function(input,init){
    const url=proxiedUrl(input);
    if(!url)return nativeFetch(input,init);
    if(typeof input==='string')return nativeFetch(url,init);
    const opts={method:input.method,headers:input.headers,body:['GET','HEAD'].includes(input.method)?undefined:input.body,credentials:input.credentials,cache:'no-store',redirect:input.redirect,referrer:input.referrer,referrerPolicy:input.referrerPolicy,integrity:input.integrity,keepalive:input.keepalive,signal:input.signal,...(init||{})};
    return nativeFetch(url,opts);
  };
  window.JFNetworkProxy={enabled:true,origin:SUPA};
})();