// Minimal but full-featured version
import React, { useEffect, useMemo, useState, useRef } from "https://esm.sh/react@18";
import { createRoot } from "https://esm.sh/react-dom@18/client";
import { pinyin as toPinyin } from "https://esm.sh/pinyin-pro@3";

const Category = { Travel:"การท่องเที่ยว", Transit:"การเดินทาง", Shopping:"ช็อปปิ้ง", Restaurant:"เข้าร้านอาหาร", Cafe:"ร้านกาแฟ" };

// ---------- helpers ----------
function pinyinSentence(s){ try{ return toPinyin(s,{toneType:"mark",type:"array"}).join(" "); }catch{return s;} }
function ed(a,b){ const dp=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0)); for(let i=0;i<=a.length;i++) dp[i][0]=i; for(let j=0;j<=b.length;j++) dp[0][j]=j; for(let i=1;i<=a.length;i++){ for(let j=1;j<=b.length;j++){ const c=a[i-1]===b[j-1]?0:1; dp[i][j]=Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+c);} } return dp[a.length][b.length]; }
function norTH(s){ return s.toLowerCase().replace(/[\sๆ…!?？、,.。]/g," ").replace(/ครับ|ค่ะ|คะ|นะ|หน่อย|ด้วย|หน่อยนะ/g,"").replace(/หรือเปล่า|หรือป่าว|หรือเปล่/g,"ไหม").replace(/เท่าไหร่|เท่าไร/g,"เท่าไหร่").replace(/\s+/g," ").trim(); }
function checkTH(input,targets){ const a=norTH(input); let best=targets[0]||""; let bestD=1e9; for(const t of targets){ const d=ed(a,norTH(t)); if(d<bestD){bestD=d; best=t;} } const maxLen=Math.max(a.length,norTH(best).length)||1; const ratio=1-bestD/maxLen; return {ok:ratio>=0.7, ratio, best}; }
function simPron(a,b){ try{ const pa=pinyinSentence(a).toLowerCase(); const pb=pinyinSentence(b).toLowerCase(); const d=ed(pa,pb); const max=Math.max(pa.length,pb.length)||1; return 1-d/max; }catch{return 0;} }

// ---------- TTS & Mic ----------
let zhVoice=null;
function initVoices(){ if(!("speechSynthesis" in window)) return; const pick=()=>{ const vs=speechSynthesis.getVoices?.()||[]; zhVoice=vs.find(v=>/zh|cmn|Chinese|Mandarin/i.test(v.lang+" "+v.name))||vs.find(v=>/zh/i.test(v.lang))||null; }; pick(); speechSynthesis.onvoiceschanged=pick; }
function speakZH(text){ if(!("speechSynthesis" in window)) return alert("เบราว์เซอร์นี้ไม่รองรับเสียงอ่าน"); const u=new SpeechSynthesisUtterance(text); u.lang="zh-CN"; if(zhVoice) u.voice=zhVoice; u.rate=0.95; speechSynthesis.cancel(); speechSynthesis.speak(u); }
function useSpeechRecognition(onResult){ const [ok,setOk]=useState(false); const [err,setErr]=useState(null); const recRef=useRef(null); useEffect(()=>{ const SR=window.webkitSpeechRecognition||window.SpeechRecognition; if(SR && window.isSecureContext){ setOk(true); const r=new SR(); r.lang="zh-CN"; r.interimResults=false; r.maxAlternatives=1; r.onerror=(e)=>setErr(e?.error||"mic error"); recRef.current=r; } },[]); return { ok, start:()=>{ try{ recRef.current.onresult=e=>onResult(e.results[0][0].transcript); recRef.current.start(); }catch(e){ setErr(String(e)); } }, err }; }

// ---------- dataset generators (compact) ----------
const LOCS=[["洗手间","ห้องน้ำ"],["地铁站","สถานีรถไฟใต้ดิน"],["火车站","สถานีรถไฟ"],["机场","สนามบิน"],["酒店","โรงแรม"],["银行","ธนาคาร"],["商店","ร้านค้า"],["超市","ซูเปอร์มาร์เก็ต"]];
const ITEMS=[["水","น้ำ"],["茶","ชา"],["米饭","ข้าวสวย"],["面条","ก๋วยเตี๋ยว"],["咖啡","กาแฟ"],["牛奶","นม"]];
function base100(){ const out=[]; for(const [zh,th] of LOCS){ out.push({zh:`请问，${zh}在哪里？`, cat:Category.Travel, th:[`ขอถามหน่อย ${th}อยู่ที่ไหน`, `${th}อยู่ที่ไหน`, `${th}อยู่ตรงไหน`], words:[["请问","ขอถามหน่อย"],[zh,th],["在","อยู่"],["哪里","ที่ไหน"]]}); out.push({zh:`${zh}在这里吗？`, cat:Category.Transit, th:[`${th}อยู่ที่นี่ไหม`,`${th}อยู่นี่ไหม`], words:[[zh,th],["在","อยู่"],["这里","ที่นี่"],["吗","ไหม"]]}); }
for(const [zh,th] of ITEMS){ out.push({zh:`${zh}多少钱？`, cat:Category.Shopping, th:[`${th}ราคาเท่าไหร่`,`${th}เท่าไร`], words:[[zh,th],["多少","เท่าไหร่"],["钱","เงิน/ราคา"]]}); out.push({zh:`我想要一杯${zh}。`, cat:Category.Cafe, th:[`ฉันต้องการ${th}หนึ่งแก้ว`,`ขอ${th} 1 แก้ว`], words:[["我","ฉัน"],["想要","อยากได้"],["一","หนึ่ง"],["杯","แก้ว"],[zh,th]]}); }
out.push({zh:`请给我菜单。`, cat:Category.Restaurant, th:["ขอเมนูหน่อย","ขอดูเมนู"], words:[["请","กรุณา/ขอ"],["给","ให้"],["我","ฉัน"],["菜单","เมนู"]]}); return out.slice(0,100); }

function harder200(){ const out=[]; const times=[["今天","วันนี้"],["明天早上","พรุ่งนี้เช้า"],["晚上","ตอนเย็น"],["现在","ตอนนี้"],["中午","ตอนเที่ยง"],["周末","สุดสัปดาห์"]]; const places=[["机场","สนามบิน"],["火车站","สถานีรถไฟ"],["地铁站","สถานีรถไฟใต้ดิน"],["商场","ห้าง"],["商店","ร้านค้า"],["超市","ซูเปอร์มาร์เก็ต"],["饭店","ร้านอาหาร"],["咖啡店","ร้านกาแฟ"]];
// cause-effect
for(const [plZ,plT] of places.slice(0,5)){ out.push({zh:`因为${plZ}很远，所以我们要打车。`, cat:Category.Transit, th:[`เพราะ${plT}ไกล จึงต้องเรียกแท็กซี่`,`เพราะ${plT}อยู่ไกลเลยต้องนั่งแท็กซี่`], words:[["因为","เพราะ"],[plZ,plT],["很远","ไกลมาก"],["所以","ดังนั้น"],["我们","พวกเรา"],["要","ต้อง"],["打车","เรียกแท็กซี่"]]}); }
// yes/no pattern
const patterns=[(s)=>[`${s}，是不是？`,t=>`${t}ใช่ไหม`],(s)=>[`${s}，好不好？`,t=>`${t}ดีไหม`],(s)=>[`能不能${s}？`,t=>`ทำ${t}ได้ไหม`],(s)=>[`要不要${s}？`,t=>`เอา${t}ไหม`]];
for(const [tZ,tT] of times){ for(const [itZ,itT] of [["面包","ขนมปัง"],["牛奶","นม"],["鸡蛋","ไข่"],["水","น้ำ"],["咖啡","กาแฟ"],["衣服","เสื้อผ้า"]]){ for(const p of patterns){ const [zF,thF]=p(`${tZ}我们在超市买${itZ}`); out.push({zh:zF, cat:Category.Shopping, th:[`${tT}พวกเรา${thF("ไปซื้อ"+itT)}ที่ซูเปอร์มาร์เก็ต`,`${tT}ไปซื้อ${itT}ที่ซูเปอร์มาร์เก็ตกันไหม`], words:[[tZ,tT],["我们","พวกเรา"],["在","ที่"],["超市","ซูเปอร์มาร์เก็ต"],["买","ซื้อ"],[itZ,itT]]}); } } }
for(const [plZ,plT] of places){ out.push({zh:`请问，从这里到${plZ}怎么走？`, cat:Category.Travel, th:[`จากที่นี่ไป${plT}ยังไง`,`จากตรงนี้จะไป${plT}ยังไง`], words:[["请问","ขอถามหน่อย"],["从这里","จากที่นี่"],["到","ถึง"],[plZ,plT],["怎么走","ไปยังไง"]]}); }
while(out.length<200){ const [tZ,tT]=times[out.length%times.length]; const [plZ,plT]=places[out.length%places.length]; out.push({zh:`${tZ}我们在${plZ}见面，好不好？`, cat:Category.Transit, th:[`${tT}เจอกันที่${plT}ดีไหม`,`${tT}นัดเจอที่${plT}ได้ไหม`], words:[[tZ,tT],["我们","พวกเรา"],["在","ที่"],[plZ,plT],["见面","เจอกัน"],["好不好","ดีไหม"]]}); }
return out.slice(0,200); }

function buildData(){ const base=base100(); const hard=harder200(); return base.concat(hard).map((x,i)=>({...x,id:i})); }

// ---------- app ----------
const DATA = buildData();
function App(){
  const [cat,setCat]=useState("ทั้งหมด");
  const [idx,setIdx]=useState(0);
  const [ans,setAns]=useState("");
  const [reveal,setReveal]=useState(false);
  const [micOut,setMicOut]=useState("");
  const mic=useSpeechRecognition((t)=>setMicOut(t));

  const list = useMemo(()=> cat==="ทั้งหมด"?DATA:DATA.filter(x=>x.cat===cat),[cat]);
  const item = list[(idx%list.length+list.length)%list.length];

  useEffect(()=>{ initVoices(); setAns(""); setReveal(false); setMicOut(""); },[idx,cat]);

  const res = ans ? checkTH(ans,item.th) : null;

  return React.createElement("div",{className:"grid gap-4"},
    React.createElement("header",{className:"flex items-center gap-3"},
      React.createElement("h1",{className:"text-xl font-semibold"},"HSK1 Trainer · 中文→ไทย"),
      React.createElement("span",{className:"ml-auto text-sm text-slate-500"}, list.length," ข้อ")
    ),
    React.createElement("div",{className:"flex flex-wrap gap-2"},
      ...["ทั้งหมด", ...new Set(Object.values(Category))].map(c=>React.createElement("button",{key:c,onClick:()=>setCat(c),className:`px-3 py-1.5 rounded-full border ${cat===c?"bg-slate-900 text-white":""}`},c))
    ),
    React.createElement("section",{className:"grid gap-3 rounded-2xl border p-4 bg-white"},
      React.createElement("div",{className:"flex items-start justify-between gap-2"},
        React.createElement("div",null,
          React.createElement("div",{className:"text-sm text-slate-500"},"ประโยคภาษาจีน"),
          React.createElement("div",{className:"text-2xl font-medium tracking-wide"}, item.zh),
          reveal && React.createElement("div",{className:"text-sm text-slate-500 mt-1 select-text"}, pinyinSentence(item.zh))
        ),
        React.createElement("div",{className:"flex gap-2"},
          React.createElement("button",{onClick:()=>speakZH(item.zh),className:"px-3 py-1.5 rounded-xl border"},"ฟังเสียง"),
          React.createElement("button",{onClick:()=>setReveal(v=>!v),className:"px-3 py-1.5 rounded-xl border"}, reveal?"ซ่อนคำเฉลย":"เฉลยคำศัพท์")
        )
      ),
      reveal && React.createElement("div",{className:"grid gap-2 sm:grid-cols-2 lg:grid-cols-3"},
        ...item.words.map(([h,mean],i)=>React.createElement("div",{key:i,className:"rounded-xl border p-3 bg-white"},
          React.createElement("div",{className:"text-lg"},h),
          React.createElement("div",{className:"text-sm text-slate-500"}, pinyinSentence(h)),
          React.createElement("div",{className:"text-sm"},"ความหมาย: ",mean),
          React.createElement("button",{onClick:()=>speakZH(h),className:"mt-2 text-xs px-2 py-1 rounded-lg border"},"ฟังคำนี้")
        ))
      ),
      React.createElement("div",{className:"grid gap-2"},
        React.createElement("label",{className:"text-sm"},"พิมพ์คำแปลเป็นภาษาไทย"),
        React.createElement("input",{value:ans,onChange:e=>setAns(e.target.value),placeholder:"เช่น: ขอถามหน่อย ห้องน้ำอยู่ที่ไหน",className:"w-full rounded-xl border px-3 py-2"}),
        React.createElement("div",{className:"flex gap-2 items-center"},
          React.createElement("button",{onClick:()=>setIdx(i=>(i-1+list.length)%list.length),className:"ml-auto px-3 py-2 rounded-xl border"},"ก่อนหน้า"),
          React.createElement("button",{onClick:()=>setIdx(i=>(i+1)%list.length),className:"px-3 py-2 rounded-xl border"},"ข้อต่อไป")
        ),
        res && React.createElement("div",{className:"text-sm"}, res.ok?"✅ ถูกต้อง":"❌ ยังไม่ตรง", " (", (res.ratio*100).toFixed(0),"%) · ตัวอย่าง: ", res.best)
      ),
      React.createElement("div",{className:"grid gap-2 border-t pt-4"},
        React.createElement("div",{className:"flex items-center gap-2"},
          React.createElement("div",{className:"font-medium"},"ฝึกพูด (จีนกลาง)"),
          !mic.ok && React.createElement("span",{className:"text-xs text-slate-500"},"*ต้องเปิดผ่าน HTTPS/Chrome")
        ),
        React.createElement("div",{className:"flex gap-2 items-center"},
          React.createElement("button",{onClick:()=>mic.ok && mic.start(),disabled:!mic.ok,className:"px-3 py-2 rounded-xl border"}, mic.ok?"เริ่มอัดไมค์":"ไมค์ไม่พร้อม"),
          React.createElement("button",{onClick:()=>speakZH(item.zh),className:"px-3 py-2 rounded-xl border"},"ฟังอีกครั้ง"),
          mic.err && React.createElement("span",{className:"text-xs text-red-600"}, String(mic.err))
        ),
        React.createElement("div",{className:"rounded-xl border p-3 bg-white min-h-[44px]"}, micOut || React.createElement("span",{className:"text-slate-400"},"(ผลจากไมค์จะแสดงที่นี่)")),
        micOut && React.createElement("div",{className:"text-sm"},"ความใกล้เคียงคำอ่าน: ", (simPron(micOut,item.zh)*100).toFixed(0), "%")
      )
    ),
    React.createElement("div",{className:"text-xs text-slate-500"},"* พินอินจะแสดงเฉพาะตอนกดเฉลย เพื่อให้ฝึกจำตัวจีนก่อน")
  );
}

createRoot(document.getElementById("root")).render(React.createElement(App));
