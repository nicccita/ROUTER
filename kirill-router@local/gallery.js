
let files=[],filter="all",search="";
const IMG=/\.(jpe?g|png|gif|webp|bmp|avif)$/i,VID=/\.(mp4|webm|mkv|mov|m4v)$/i;
const grid=document.getElementById("grid"),chips=document.getElementById("chips");
document.getElementById("pick").onchange=e=>{files=[...e.target.files].filter(f=>IMG.test(f.name)||VID.test(f.name)).map(f=>{
const p=f.webkitRelativePath.split("/");const cat=p.length>2?p[1]:p[0];return{f,cat,name:f.name,url:URL.createObjectURL(f)};});
document.getElementById("hint").style.display="none";buildChips();render();};
function buildChips(){const cats=[...new Set(files.map(x=>x.cat))].sort();chips.innerHTML="";
const mk=(label,val)=>{const b=document.createElement("button");b.className="btn"+(filter===val?" on":"");b.textContent=label;
b.onclick=()=>{filter=val;buildChips();render();};chips.appendChild(b);};
mk("Все ("+files.length+")","all");cats.forEach(c=>mk(c+" ("+files.filter(x=>x.cat===c).length+")",c));}
function render(){grid.innerHTML="";const q=search.toLowerCase();
const list=files.filter(x=>(filter==="all"||x.cat===filter)&&(!q||x.name.toLowerCase().includes(q)));
document.getElementById("count").textContent=list.length+" файлов";
list.slice(0,800).forEach(x=>{const c=document.createElement("div");c.className="cell";
if(IMG.test(x.name)){const im=document.createElement("img");im.loading="lazy";im.src=x.url;c.appendChild(im);}
else{const v=document.createElement("video");v.src=x.url;v.preload="metadata";v.muted=true;c.appendChild(v);}
const cat=document.createElement("span");cat.className="cat";cat.textContent=x.cat;c.appendChild(cat);
const nm=document.createElement("div");nm.className="nm";nm.textContent=x.name;c.appendChild(nm);
c.onclick=()=>openLb(x);grid.appendChild(c);});}
document.getElementById("q").oninput=e=>{search=e.target.value;render();};
const lb=document.getElementById("lb"),lbc=document.getElementById("lbcontent");
function openLb(x){lbc.innerHTML="";let el;
if(IMG.test(x.name)){el=document.createElement("img");el.src=x.url;}
else{el=document.createElement("video");el.src=x.url;el.controls=true;el.autoplay=true;}
lbc.appendChild(el);lb.querySelector(".cap").textContent=x.cat+" / "+x.name;lb.classList.add("open");}
lb.querySelector(".close").onclick=()=>{lb.classList.remove("open");lbc.innerHTML="";};
lb.onclick=e=>{if(e.target===lb){lb.classList.remove("open");lbc.innerHTML="";}};
document.onkeydown=e=>{if(e.key==="Escape"){lb.classList.remove("open");lbc.innerHTML="";}};
