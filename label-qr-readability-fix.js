// JF Oficina — reforço de legibilidade dos QR impressos
(function(){
  'use strict';
  const originalOpen=window.open.bind(window);
  let armed=false;

  function patchPrintWindow(child){
    if(!child)return;
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      try{
        if(child.closed){clearInterval(timer);return;}
        const doc=child.document;
        const qrs=[...doc.querySelectorAll('.qr')];
        if(!qrs.length){if(tries>100)clearInterval(timer);return;}
        let ready=false;
        qrs.forEach(qr=>{
          const el=qr.querySelector('canvas,img');
          if(!el)return;
          ready=true;
          qr.style.width='25mm';
          qr.style.height='25mm';
          qr.style.padding='3mm';
          qr.style.background='#fff';
          qr.style.overflow='visible';
          el.style.setProperty('width','19mm','important');
          el.style.setProperty('height','19mm','important');
          el.style.display='block';
          el.style.imageRendering='pixelated';
        });
        if(ready)clearInterval(timer);
      }catch(e){if(tries>100)clearInterval(timer);}
    },60);
  }

  document.addEventListener('click',e=>{
    if(e.target?.id!=='printSelectedLabels')return;
    if(armed)return;
    armed=true;
    const previous=window.open;
    window.open=function(...args){
      const child=originalOpen(...args);
      patchPrintWindow(child);
      return child;
    };
    setTimeout(()=>{window.open=previous;armed=false;},1000);
  },true);
})();