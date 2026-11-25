const HOST="kirill_router";
const CATS=["Games","AI","Base","NSFW"];
const LBL={Games:"\u{1F3AE} Games",AI:"\u{1F916} AI",Base:"\u{1F3E0} Base",NSFW:"\u{1F51E} NSFW"};
let port=null,activeUrl="",reqId=0;const waiting=new Map(),pending=new Map();
function connect(){port=browser.runtime.connectNative(HOST);
 port.onMessage.addListener(m=>{
  if(m.reqId&&waiting.has(m.reqId)){waiting.get(m.reqId)(m);waiting.delete(m.reqId);return;}
  if(m.event==="routed")notify("Saved \u2192 "+m.category,m.name);
  if(m.event==="ytdlp-start")notify("Downloading video\u2026","category: "+m.name);
  if(m.event==="ytdlp-done")notify(m.ok?"Done":"Error",m.name||m.error||"");
  if(m.event==="domain-added")notify("Added to "+m.category,m.domain);});
 port.onDisconnect.addListener(()=>{port=null;setTimeout(connect,2000);});}
connect();
function send(m){if(!port)connect();port.postMessage(m);}
function request(p){return new Promise(res=>{const id=++reqId;waiting.set(id,res);send(Object.assign({},p,{reqId:id}));
 setTimeout(()=>{if(waiting.has(id)){waiting.delete(id);res({error:"timeout"});}},20000);});}
function notify(title,message){browser.notifications.create({type:"basic",title,message:String(message||"").slice(0,200),iconUrl:browser.runtime.getURL("icon.png")});}
browser.tabs.onActivated.addListener(async({tabId})=>{try{activeUrl=(await browser.tabs.get(tabId)).url||"";}catch(e){}});
browser.tabs.onUpdated.addListener((id,info,tab)=>{if(tab.active&&info.url)activeUrl=info.url;});
browser.downloads.onCreated.addListener(d=>pending.set(d.id,{url:d.finalUrl||d.url,referrer:d.referrer,page:activeUrl}));
browser.downloads.onChanged.addListener(dl=>{
 if(dl.state&&dl.state.current==="complete"){const info=pending.get(dl.id)||{};
  browser.downloads.search({id:dl.id}).then(([d])=>{if(!d||!d.filename)return;
   send({action:"route",path:d.filename,url:d.finalUrl||d.url,referrer:info.referrer||d.referrer,page:info.page||activeUrl});pending.delete(dl.id);});}
 if(dl.error)pending.delete(dl.id);});
function mk(id,title,contexts,parentId){browser.menus.create({id,title,contexts,parentId});}
browser.menus.create({id:"video",title:"\u2B07 Video (max quality)",contexts:["page","link","video"]});
browser.menus.create({id:"audio",title:"\u{1F3B5} Audio (mp3)",contexts:["page","link","video"]});
browser.menus.create({id:"vidcat",title:"\u2B07 Video to category\u2026",contexts:["page","link","video"]});
browser.menus.create({id:"audcat",title:"\u{1F3B5} mp3 to category\u2026",contexts:["page","link","video"]});
browser.menus.create({id:"savecat",title:"\u{1F4C1} Save file to category\u2026",contexts:["image","link","video","audio"]});
browser.menus.create({id:"queue",title:"\u{1F4CC} Add to queue\u2026",contexts:["page","link"]});
CATS.forEach(c=>{mk("vc_"+c,LBL[c],["page","link","video"],"vidcat");mk("ac_"+c,LBL[c],["page","link","video"],"audcat");mk("sc_"+c,LBL[c],["image","link","video","audio"],"savecat");});
[["watch","\u{1F441} Watch"],["try","\u{1F3AE} Try"],["read","\u{1F4D6} Read"]].forEach(([k,t])=>mk("q_"+k,t,["page","link"],"queue"));
browser.menus.onClicked.addListener(async(info,tab)=>{const id=info.menuItemId,pageUrl=(tab&&tab.url)||activeUrl,target=info.linkUrl||info.srcUrl||pageUrl;
 if(id==="video"||id==="audio")send({action:"ytdlp",url:target,mode:id,category:"auto",page:pageUrl});
 else if(id.startsWith("vc_"))send({action:"ytdlp",url:target,mode:"video",category:id.slice(3),page:pageUrl});
 else if(id.startsWith("ac_"))send({action:"ytdlp",url:target,mode:"audio",category:id.slice(3),page:pageUrl});
 else if(id.startsWith("sc_")){const url=info.srcUrl||info.linkUrl;if(url){let name=decodeURIComponent((url.split("/").pop()||"file").split("?")[0])||"file";
  name=name.replace(/[\\/:*?"<>|]/g,"_").slice(0,120);browser.downloads.download({url,filename:id.slice(3)+"/"+name,saveAs:false});}}
 else if(id.startsWith("q_")){const url=info.linkUrl||pageUrl,title=info.linkText||(tab&&tab.title)||url;
  const data=await browser.storage.local.get("queues");const q=data.queues||{watch:[],try:[],read:[]};
  q[id.slice(2)].unshift({url,title,ts:Date.now()});await browser.storage.local.set({queues:q});notify("Added to queue",title);}});
browser.runtime.onMessage.addListener(async msg=>{
 if(msg.action==="native")return request(msg.payload);
 if(msg.action==="fire")  {send(msg.payload);return{ok:true};}
 if(msg.action==="getQueues")return(await browser.storage.local.get("queues")).queues||{watch:[],try:[],read:[]};
 if(msg.action==="setQueues"){await browser.storage.local.set({queues:msg.queues});return{ok:true};}
 if(msg.action==="muteAll"){const ts=await browser.tabs.query({audible:true});ts.forEach(t=>browser.tabs.update(t.id,{muted:true}));return{ok:true};}
 if(msg.action==="openGallery"){browser.tabs.create({url:browser.runtime.getURL("gallery.html")});return{ok:true};}
 if(msg.action==="getTiles")return(await browser.storage.local.get("tiles")).tiles||null;
 if(msg.action==="setTiles"){await browser.storage.local.set({tiles:msg.tiles});return{ok:true};}
 if(msg.action==="addToCategory"){
  const [tab]=await browser.tabs.query({active:true,currentWindow:true});
  if(!tab||!tab.url)return{error:"no tab"};
  let domain;try{domain=new URL(tab.url).hostname.replace(/^www\./,"");}catch(e){return{error:"bad url"};}
  send({action:"addDomainToCategory",domain,category:msg.category});
  return{ok:true,domain,category:msg.category};}
 if(msg.action==="addToQueue"){
  const [tab]=await browser.tabs.query({active:true,currentWindow:true});
  if(!tab)return{error:"no tab"};
  const data=await browser.storage.local.get("queues");const q=data.queues||{watch:[],try:[],read:[]};
  q[msg.queue].unshift({url:tab.url,title:tab.title,ts:Date.now()});
  await browser.storage.local.set({queues:q});
  notify("Added to "+msg.queue,tab.title);
  return{ok:true};}
});