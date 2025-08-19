import React, {useEffect,useMemo,useRef,useState} from "https://esm.sh/react@18";
import {createRoot} from "https://esm.sh/react-dom@18/client";
import {pinyin as toPinyin} from "https://esm.sh/pinyin-pro@3";

// ---------- helpers ----------
const Category={Travel:"การท่องเที่ยว",Transit:"การเดินทาง",Shopping:"ช็อปปิ้ง",Restaurant:"เข้าร้านอาหาร",Cafe:"ร้านกาแฟ"};
const pin=(s)=>{try{return toPinyin(s,{toneType:"mark",type:"array"}).join(" ");}catch{return s;}};
const ed=(a,b)=>{const d=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));for(let i=0;i<=a.length;i++)d[i][0]=i;for(let j=0;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++){const c=a[i-1]===b[j-1]?0:1;d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+c);}return d[a.length][b.length];};
const norTH=(s)=>s.toLowerCase().replace(/[\sๆ…!?？、,.。]/g," ").replace(/ครับ|ค่ะ|คะ|นะ|หน่อย|ด้วย|หน่อยนะ/g,"").replace(/หรือเปล่า|หรือป่าว|หรือเปล่/g,"ไหม").replace(/เท่าไหร่|เท่าไร/g,"เท่าไหร่").replace(/\s+/g," ").trim();
const checkTH=(inp,targets)=>{const a=norTH(inp);let best=targets[0]||"",bd=1e9;for(const t of targets){const v=ed(a,norTH(t));if(v<bd){bd=v;best=t;}}const m=Math.max(a.length,norTH(best).length)||1;const r=1-bd/m;return {ok:r>=0.7,ratio:r,best};};
const simPin=(a,b)=>{try{const pa=pin(a).toLowerCase(),pb=pin(b).toLowerCase();const d=ed(pa,pb);return 1-d/Math.max(pa.length,pb.length||1);}catch{return 0;}};

// ---------- TTS & mic ----------
let zhVoice=null;
function initVoices(){if(!("speechSynthesis" in window))return;const pick=()=>{const vs=speechSynthesis.getVoices?.()||[];zhVoice=vs.find(v=>/zh|cmn|Chinese|Mandarin/i.test(v.lang+" "+v.name))||vs.find(v=>/zh/i.test(v.lang))||null;};pick();speechSynthesis.onvoiceschanged=pick;}
function speakZH(t){if(!("speechSynthesis" in window))return alert("อุปกรณ์นี้ไม่รองรับเสียงอ่าน");const u=new SpeechSynthesisUtterance(t);u.lang="zh-CN";if(zhVoice)u.voice=zhVoice;u.rate=0.95;speechSynthesis.cancel();speechSynthesis.speak(u);}
function useSR(onRes){const [ok,setOk]=useState(false),[err,setErr]=useState(null);const ref=useRef(null);useEffect(()=>{const SR=window.webkitSpeechRecognition||window.SpeechRecognition;if(SR&&window.isSecureContext){const r=new SR();r.lang="zh-CN";r.interimResults=false;r.maxAlternatives=1;r.onerror=(e)=>setErr(e?.error||"mic error");ref.current=r;setOk(true);} },[]);
  const start=()=>{try{ref.current.onresult=(e)=>onRes(e.results[0][0].transcript);ref.current.start();}catch(e){setErr(e?.message||String(e));}};
  const stop=()=>ref.current?.stop?.();
  return {ok,start,stop,err};
}

// ---------- dataset generators ----------
const LOCS=[["洗手间","ห้องน้ำ"],["地铁站","สถานีรถไฟใต้ดิน"],["火车站","สถานีรถไฟ"],["机场","สนามบิน"],["酒店","โรงแรม"],["银行","ธนาคาร"],["商店","ร้านค้า"],["超市","ซูเปอร์มาร์เก็ต"]];
const ITEMS=[["水","น้ำ"],["茶","ชา"],["米饭","ข้าวสวย"],["面条","ก๋วยเตี๋ยว"],["咖啡","กาแฟ"],["牛奶","นม"]];
function base100(){const out=[];for(const [z,t] of LOCS){out.push({zh:`请问，${z}在哪里？`,cat:Category.Travel,th:[`ขอถามหน่อย ${t}อยู่ที่ไหน`,`${t}อยู่ที่ไหน`,`${t}อยู่ตรงไหน`],words:[["请问","ขอถามหน่อย"],[z,t],["在","อยู่"],["哪里","ที่ไหน"]]});out.push({zh:`${z}在这里吗？`,cat:Category.Transit,th:[`${t}อยู่ที่นี่ไหม`,`${t}อยู่นี่ไหม`],words:[[z,t],["在","อยู่"],["这里","ที่นี่"],["吗","ไหม"]]});}
for(const [z,t] of ITEMS){out.push({zh:`${z}多少钱？`,cat:Category.Shopping,th:[`${t}ราคาเท่าไหร่`,`${t}เท่าไร`],words:[[z,t],["多少","เท่าไหร่"],["钱","เงิน/ราคา"]]});out.push({zh:`我想要一杯${z}。`,cat:Category.Cafe,th:[`ฉันต้องการ${t}หนึ่งแก้ว`,`ขอ${t} 1 แก้ว`],words:[["我","ฉัน"],["想要","อยากได้"],["一","หนึ่ง"],["杯","แก้ว"],[z,t]]});}
out.push({zh:`请给我菜单。`,cat:Category.Restaurant,th:["ขอเมนูหน่อย","ขอดูเมนู"],words:[["请","กรุณา/ขอ"],["给","ให้"],["我","ฉัน"],["菜单","เมนู"]]});return out.slice(0,100);}
function harder200(){const out=[];const times=[["今天","วันนี้"],["明天早上","พรุ่งนี้เช้า"],["晚上","ตอนเย็น"],["现在","ตอนนี้"],["中午","ตอนเที่ยง"],["周末","สุดสัปดาห์"]];const places=[["机场","สนามบิน"],["火车站","สถานีรถไฟ"],["地铁站","สถานีรถไฟใต้ดิน"],["商场","ห้าง"],["商店","ร้านค้า"],["超市","ซูเปอร์มาร์เก็ต"],["饭店","ร้านอาหาร"],["咖啡店","ร้านกาแฟ"]];
for(const [pz,pt] of places.slice(0,5)){out.push({zh:`因为${pz}很远，所以我们要打车。`,cat:Category.Transit,th:[`เพราะ${pt}ไกล จึงต้องเรียกแท็กซี่`,`เพราะ${pt}อยู่ไกลเลยต้องนั่งแท็กซี่`],words:[["因为","เพราะ"],[pz,pt],["很远","ไกลมาก"],["所以","ดังนั้น"],["我们","พวกเรา"],["要","ต้อง"],["打车","เรียกแท็กซี่"]]});}
const pats=[(s)=>[`${s}，是不是？`,t=>`${t}ใช่ไหม`],(s)=>[`${s}，好不好？`,t=>`${t}ดีไหม`],(s)=>[`能不能${s}？`,t=>`ทำ${t}ได้ไหม`],(s)=>[`要不要${s}？`,t=>`เอา${t}ไหม`]];
for(const [tz,tt] of times){for(const [iz,it] of [["面包","ขนมปัง"],["牛奶","นม"],["鸡蛋","ไข่"],["水","น้ำ"],["咖啡","กาแฟ"],["衣服","เสื้อผ้า"]]){for(const p of pats){const [zf,tf]=p(`${tz}我们在超市买${iz}`);out.push({zh:zf,cat:Category.Shopping,th:[`${tt}พวกเรา${tf("ไปซื้อ"+it)}ที่ซูเปอร์มาร์เก็ต`,`${tt}ไปซื้อ${it}ที่ซูเปอร์มาร์เก็ตกันไหม`],words:[[tz,tt],["我们","พวกเรา"],["在","ที่"],["超市","ซูเปอร์มาร์เก็ต"],["买","ซื้อ"],[iz,it]]});}}}
for(const [pz,pt] of places){out.push({zh:`请问，从这里到${pz}怎么走？`,cat:Category.Travel,th:[`จากที่นี่ไป${pt}ยังไง`,`จากตรงนี้จะไป${pt}ยังไง`],words:[["请问","ขอถามหน่อย"],["从这里","จากที่นี่"],["到","ถึง"],[pz,pt],["怎么走","ไปยังไง"]]});}
while(out.length<200){const [tz,tt]=times[out.length%times.length];const [pz,pt]=places[out.length%places.length];out.push({zh:`${tz}我们在${pz}见面，好不好？`,cat:Category.Transit,th:[`${tt}เจอกันที่${pt}ดีไหม`,`${tt}นัดเจอที่${pt}ได้ไหม`],words:[[tz,tt],["我们","พวกเรา"],["在","ที่"],[pz,pt],["见面","เจอกัน"],["好不好","ดีไหม"]]});}
return out.slice(0,200);}
const DATA=base100().concat(harder200()).map((x,i)=>({...x,id:i}));

// ---------- App ----------
function App(){
  const [cat,setCat]=useState("ทั้งหมด");
  const list=useMemo(()=>cat==="ทั้งหมด"?DATA:DATA.filter(x=>x.cat===cat),[cat]);
  const [i,setI]=useState(0);
  const item=list[(i%list.length+list.length)%list.length];

  const [ans,setAns]=useState("");
  const [reveal,setReveal]=useState(false); // เฉลยศัพท์
  const [checked,setChecked]=useState(false); // เฉลยคำตอบไทย
  const [result,setResult]=useState(null);
  const [micOut,setMicOut]=useState("");
  const mic=useSR((t)=>setMicOut(t));

  useEffect(()=>{initVoices();setAns("");setReveal(false);setChecked(false);setResult(null);setMicOut("");},[cat,i]);

  function onCheck(){
    const r=checkTH(ans,item.th);
    setResult(r); setChecked(true);
  }
  function onReset(){
    setAns(""); setChecked(false); setResult(null);
  }

  return React.createElement("div",{className:"grid gap-4"},
    React.createElement("header",{className:"flex items-center gap-3"},
      React.createElement("h1",{className:"text-xl font-semibold"},"HSK1 Trainer · 中文→ไทย"),
      React.createElement("span",{className:"ml-auto text-sm text-slate-500"}, list.length," ข้อ")
    ),
    React.createElement("div",{className:"flex flex-wrap gap-2"},
      ...["ทั้งหมด",...new Set(Object.values(Category))].map(c=>React.createElement("button",{key:c,onClick:()=>setCat(c),className:`px-3 py-1.5 rounded-full border ${cat===c?"bg-slate-900 text-white":""}`},c))
    ),
    React.createElement("section",{className:"grid gap-3 rounded-2xl border p-4 bg-white"},
      React.createElement("div",{className:"flex items-start justify-between gap-2"},
        React.createElement("div",null,
          React.createElement("div",{className:"text-sm text-slate-500"},"ประโยคภาษาจีน"),
          React.createElement("div",{className:"text-2xl font-medium tracking-wide"}, item.zh),
          reveal && React.createElement("div",{className:"text-sm text-slate-500 mt-1 select-text"}, pin(item.zh))
        ),
        React.createElement("div",{className:"flex gap-2"},
          React.createElement("button",{onClick:()=>speakZH(item.zh),className:"px-3 py-1.5 rounded-xl border"},"ฟังเสียง"),
          React.createElement("button",{onClick:()=>setReveal(v=>!v),className:"px-3 py-1.5 rounded-xl border"}, reveal?"ซ่อนคำเฉลย":"เฉลยคำศัพท์")
        )
      ),
      reveal && React.createElement("div",{className:"grid gap-2 sm:grid-cols-2 lg:grid-cols-3"},
        ...item.words.map(([h,m],k)=>React.createElement("div",{key:k,className:"rounded-xl border p-3 bg-white"},
          React.createElement("div",{className:"text-lg"},h),
          React.createElement("div",{className:"text-sm text-slate-500"}, pin(h)),
          React.createElement("div",{className:"text-sm"},"ความหมาย: ",m),
          React.createElement("button",{onClick:()=>speakZH(h),className:"mt-2 text-xs px-2 py-1 rounded-lg border"},"ฟังคำนี้")
        ))
      ),
      React.createElement("div",{className:"grid gap-2"},
        React.createElement("label",{className:"text-sm"},"พิมพ์คำแปลเป็นภาษาไทย"),
        React.createElement("input",{value:ans,onChange:e=>{setAns(e.target.value);setChecked(false);setResult(null);},placeholder:"เช่น: ขอถามหน่อย ห้องน้ำอยู่ที่ไหน",className:"w-full rounded-xl border px-3 py-2"}),
        React.createElement("div",{className:"flex gap-2 items-center"},
          React.createElement("button",{onClick:onCheck,className:"px-4 py-2 rounded-xl bg-slate-900 text-white"},"ตรวจคำตอบ"),
          React.createElement("button",{onClick:onReset,className:"px-4 py-2 rounded-xl border"},"พิมพ์ใหม่"),
          React.createElement("button",{onClick:()=>setAns(item.th[0]||""),className:"px-4 py-2 rounded-xl border"},"ใส่ตัวอย่างคำตอบ"),
          React.createElement("button",{onClick:()=>setI(x=>(x-1+list.length)%list.length),className:"ml-auto px-3 py-2 rounded-xl border"},"ก่อนหน้า"),
          React.createElement("button",{onClick:()=>setI(x=>(x+1)%list.length),className:"px-3 py-2 rounded-xl border"},"ข้อต่อไป")
        ),
        checked && result && React.createElement("div",{className:"text-sm"}, result.ok?"✅ ถูกต้อง":"❌ ยังไม่ตรง", " (", (result.ratio*100).toFixed(0),"%) · ตัวอย่าง: ", result.best)
      ),
      React.createElement("div",{className:"grid gap-2 border-t pt-4"},
        React.createElement("div",{className:"flex items-center gap-2"},
          React.createElement("div",{className:"font-medium"},"ฝึกพูด (จีนกลาง)"),
          React.createElement("div",{className:"text-xs text-slate-500"},"* ต้องเปิดผ่าน HTTPS/Chrome")
        ),
        React.createElement("div",{className:"flex gap-2 items-center"},
          React.createElement("button",{onClick:()=>mic.ok&&mic.start(),disabled:!mic.ok,className:"px-3 py-2 rounded-xl border"}, mic.ok?"เริ่มอัดไมค์":"ไมค์ไม่พร้อม"),
          React.createElement("button",{onClick:()=>speakZH(item.zh),className:"px-3 py-2 rounded-xl border"},"ฟังอีกครั้ง"),
          mic.err && React.createElement("span",{className:"text-xs text-red-600"}, String(mic.err))
        ),
        React.createElement("div",{className:"rounded-xl border p-3 bg-white min-h-[44px]"}, micOut || React.createElement("span",{className:"text-slate-400"},"(ผลจากไมค์จะแสดงที่นี่)")),
        micOut && React.createElement("div",{className:"text-sm"},"ความใกล้เคียงคำอ่าน: ", (simPin(micOut,item.zh)*100).toFixed(0), "%")
      )
    ),
    React.createElement("div",{className:"text-xs text-slate-500"},"* พินอินจะแสดงเฉพาะตอนกดเฉลย เพื่อให้ฝึกจำตัวจีนก่อน")
  );
}

createRoot(document.getElementById("root")).render(React.createElement(App));
