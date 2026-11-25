const send=m=>browser.runtime.sendMessage(m);
document.querySelectorAll("[data-cat]").forEach(b=>b.onclick=async()=>{
 const r=await send({action:"addToCategory",category:b.dataset.cat});
 if(r.ok){const n=document.createElement("div");n.style.cssText="background:#7c4dff;color:#fff;padding:8px;border-radius:6px;margin-bottom:6px;font-size:12px";n.textContent=r.domain+" \u2192 "+r.category;document.body.insertBefore(n,document.body.firstChild);setTimeout(()=>window.close(),1500);}
});
document.querySelectorAll("[data-q]").forEach(b=>b.onclick=async()=>{
 await send({action:"addToQueue",queue:b.dataset.q});
 window.close();
});
document.getElementById("g").onclick=()=>send({action:"openGallery"});
document.getElementById("m").onclick=()=>send({action:"muteAll"});