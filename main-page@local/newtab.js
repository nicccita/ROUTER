
const CATS=["Games","AI","Base","NSFW"];
const META={Games:["🎮 Игры","#4caf7d"],AI:["🤖 AI","#5b9dff"],Base:["🏠 База","#9aa0aa"],NSFW:["🔞 NSFW","#b06bff"]};
const DEF={Games:[{n:"Steam",u:"https://store.steampowered.com"},{n:"itch.io",u:"https://itch.io"},{n:"r/incremental",u:"https://reddit.com/r/incremental_games"}],
AI:[{n:"SillyTavern",u:"http://localhost:8000"},{n:"HuggingFace",u:"https://huggingface.co"},{n:"Civitai",u:"https://civitai.com"},{n:"OpenRouter",u:"https://openrouter.ai"}],
Base:[{n:"YouTube",u:"https://youtube.com"},{n:"VK",u:"https://vk.com"},{n:"Яндекс",u:"https://yandex.by"},{n:"Reddit",u:"https://reddit.com"}],NSFW:[]};
const send=m=>browser.runtime.sendMessage(m);
let tiles=null,queues=null;
async function load(){tiles=await send({action:"getTiles"})||JSON.parse(JSON.stringify(DEF));queues=await send({action:"getQueues"});render();}
function render(){const g=document.getElementById("groups");g.innerHTML="";
CATS.forEach(c=>{const[icon,col]=META[c];const d=document.createElement("div");d.className="group";
d.innerHTML=`<h3><span class="dot" style="background:${col}"></span>${icon}</h3>`;const t=document.createElement("div");t.className="tiles";
(tiles[c]||[]).forEach((tile,i)=>{const a=document.createElement("a");a.className="tile";a.href=tile.u;a.target="_blank";a.textContent=tile.n;
const x=document.createElement("span");x.className="x";x.textContent="×";x.onclick=e=>{e.preventDefault();tiles[c].splice(i,1);send({action:"setTiles",tiles});render();};
a.appendChild(x);t.appendChild(a);});
const add=document.createElement("span");add.className="tile add";add.textContent="+";add.onclick=()=>{const n=prompt("Название:");if(!n)return;const u=prompt("URL (https://…):");if(!u)return;(tiles[c]=tiles[c]||[]).push({n,u});send({action:"setTiles",tiles});render();};
t.appendChild(add);d.appendChild(t);g.appendChild(d);});
["watch","try","read"].forEach(k=>{const box=document.getElementById("q_"+k);box.innerHTML="";const arr=(queues&&queues[k])||[];
if(!arr.length){box.innerHTML='<div class="empty">пусто — ПКМ по странице → «В очередь»</div>';return;}
arr.forEach((it,i)=>{const row=document.createElement("div");row.className="qitem";const a=document.createElement("a");a.href=it.url;a.target="_blank";a.textContent=it.title||it.url;
const x=document.createElement("span");x.className="x";x.textContent="×";x.onclick=()=>{queues[k].splice(i,1);send({action:"setQueues",queues});render();};
row.append(a,x);box.appendChild(row);});});}
document.getElementById("editbtn").onclick=()=>document.body.classList.toggle("edit");
document.getElementById("gallery").onclick=()=>send({action:"openGallery"});
document.querySelectorAll("[data-folder]").forEach(b=>b.onclick=()=>send({action:"fire",payload:{action:"openFolder",category:b.dataset.folder}}));
const nc=document.getElementById("notecat");CATS.forEach(c=>{const o=document.createElement("option");o.value=c;o.textContent=META[c][0];nc.appendChild(o);});
const notes=document.getElementById("notes");
function loadNotes(){notes.value=localStorage.getItem("notes_"+nc.value)||"";}
nc.onchange=loadNotes;notes.oninput=()=>localStorage.setItem("notes_"+nc.value,notes.value);loadNotes();
const set=document.getElementById("settings");document.getElementById("setbtn").onclick=()=>set.classList.toggle("open");
async function loadMap(){const cfg=await send({action:"native",payload:{action:"getCategories"}});
document.getElementById("map").value=Object.entries(cfg.map||{}).map(([d,c])=>d+"="+c).join("\n");
document.getElementById("defcat").value=cfg.default||"Base";}
document.getElementById("savemap").onclick=async()=>{const map={};document.getElementById("map").value.split("\n").forEach(l=>{const i=l.indexOf("=");if(i>0){const d=l.slice(0,i).trim().replace(/^www\./,""),c=l.slice(i+1).trim();if(d&&CATS.includes(c))map[d]=c;}});
const cfg=await send({action:"native",payload:{action:"getCategories"}});cfg.map=map;cfg.default=document.getElementById("defcat").value;
await send({action:"native",payload:{action:"saveCategories",cfg}});alert("Карта сохранена");};
document.getElementById("upd").onclick=()=>send({action:"fire",payload:{action:"updateYtdlp"}});
load();loadMap();
