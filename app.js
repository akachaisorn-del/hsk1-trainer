// ====== DATA (precomputed pinyin; no external libs) ======
const RAD = {
  "讠 (คำพูด)": [
    ["说","shuō","พูด"],["请","qǐng","เชิญ/กรุณา"],["让","ràng","ให้/ทำให้"],["讲","jiǎng","เล่า/บรรยาย"],["读","dú","อ่าน"],
    ["记","jì","จำ"],["试","shì","ลอง/ทดสอบ"],["谁","shéi","ใคร"],["诉","sù","บอก/ฟ้อง"],["词","cí","คำศัพท์"],
    ["语","yǔ","ภาษา"],["课","kè","บทเรียน"],["谢","xiè","ขอบคุณ"],["该","gāi","ควรจะ"],["讲课","jiǎng kè","สอน/บรรยาย"]
  ],
  "扌 (มือ/การกระทำ)": [
    ["打","dǎ","ตี/โทร"],["找","zhǎo","หา"],["拿","ná","ถือ/หยิบ"],["换","huàn","เปลี่ยน"],["接","jiē","รับ"],
    ["搬","bān","ขนย้าย"],["拉","lā","ดึง"],["推","tuī","ผลัก"],["打扫","dǎ sǎo","ทำความสะอาด"],["打开","dǎ kāi","เปิด"],
    ["把","bǎ","เอา/คำช่วย"],["报","bào","รายงาน"],["招","zhāo","เชิญ/รับสมัคร"],["抬","tái","ยก"],["捉","zhuō","จับ"]
  ],
  "氵 (น้ำ)": [
    ["河","hé","แม่น้ำ"],["海","hǎi","ทะเล"],["湖","hú","ทะเลสาบ"],["江","jiāng","แม่น้ำ"],["洗","xǐ","ล้าง/ซัก"],
    ["游","yóu","ว่าย/เที่ยว"],["酒","jiǔ","เหล้า"],["汉","hàn","ฮั่น/จีน"],["渴","kě","กระหายน้ำ"],["泳","yǒng","ว่ายน้ำ"],
    ["清","qīng","ใส/ชัดเจน"],["流","liú","ไหล"],["沙","shā","ทราย"],["洗澡","xǐ zǎo","อาบน้ำ"],["港","gǎng","ท่าเรือ"]
  ],
  "忄 (ใจ/อารมณ์)": [
    ["忙","máng","ยุ่ง"],["忘","wàng","ลืม"],["怕","pà","กลัว"],["想","xiǎng","คิด/อยาก"],["情","qíng","ความรู้สึก"],
    ["意","yì","ความหมาย/ตั้งใจ"],["快","kuài","เร็ว"],["慢","màn","ช้า"],["急","jí","รีบ/ด่วน"],["悲","bēi","เศร้า"],
    ["想念","xiǎng niàn","คิดถึง"],["懂","dǒng","เข้าใจ"],["感觉","gǎn jué","ความรู้สึก"],["忍","rěn","อดทน"],["愿","yuàn","ยินดี/เต็มใจ"]
  ],
  "口 (ปาก/เสียง)": [
    ["吃","chī","กิน"],["喝","hē","ดื่ม"],["叫","jiào","เรียก/ชื่อ"],["唱","chàng","ร้องเพลง"],["吗","ma","ไหม"],
    ["呢","ne","ล่ะ"],["吧","ba","เถอะ/สิ"],["品","pǐn","รส/ชนิด"],["味","wèi","รสชาติ"],["吵","chǎo","เสียงดัง/ทะเลาะ"],
    ["哭","kū","ร้องไห้"],["告诉","gào sù","บอก/แจ้ง"],["啊","a","อา"],["哎","āi","อุทาน"],["味道","wèi dào","รสชาติ/กลิ่น"]
  ],
  "木 (ไม้/วัตถุ)": [
    ["树","shù","ต้นไม้"],["林","lín","ป่า"],["森","sēn","ป่าทึบ"],["桌","zhuō","โต๊ะ"],["椅","yǐ","เก้าอี้"],
    ["杯","bēi","ถ้วย"],["极","jí","สุดยอด"],["果","guǒ","ผล/ผลไม้"],["桥","qiáo","สะพาน"],["楼","lóu","อาคาร/ตึก"],
    ["检","jiǎn","ตรวจ"],["机","jī","เครื่อง"],["架","jià","ชั้น/โครง"],["板","bǎn","แผ่น/กระดาน"],["棒","bàng","เยี่ยม/ไม้คทา"]
  ],
  "艹 (พืช/หญ้า)": [
    ["花","huā","ดอกไม้"],["草","cǎo","หญ้า"],["茶","chá","ชา"],["菜","cài","ผัก/อาหาร"],["药","yào","ยา"],
    ["蓝","lán","สีน้ำเงิน"],["菜单","cài dān","เมนู"],["葡萄","pú tao","องุ่น"],["苹果","píng guǒ","แอปเปิล"],["芳","fāng","หอม"],
    ["萝卜","luó bo","หัวไชเท้า"],["香蕉","xiāng jiāo","กล้วย"],["茄子","qié zi","มะเขือยาว"],["菊","jú","เบญจมาศ"],["草莓","cǎo méi","สตรอว์เบอร์รี่"]
  ],
  "钅 (โลหะ/เครื่องมือ)": [
    ["钱","qián","เงิน"],["银","yín","เงิน (โลหะ)"],["钟","zhōng","นาฬิกา/ระฆัง"],["铁","tiě","เหล็ก"],["错","cuò","ผิด"],
    ["钥","yào","กุญแจ"],["锁","suǒ","ล็อก"],["针","zhēn","เข็ม"],["铅","qiān","ตะกั่ว"],["锅","guō","หม้อ"],
    ["键","jiàn","ปุ่ม"],["铃","líng","กระดิ่ง"],["锋","fēng","คม"],["镜","jìng","กระจก"],["链","liàn","โซ่"]
  ],
  "辶 (การเดิน/การเคลื่อนที่)": [
    ["近","jìn","ใกล้"],["远","yuǎn","ไกล"],["进","jìn","เข้า"],["过","guò","ผ่าน/เคย"],["还","huán","คืน/กลับ"],
    ["迟","chí","สาย"],["送","sòng","ส่ง/มอบให้"],["迎","yíng","ต้อนรับ"],["迎接","yíng jiē","รับ/ต้อนรับ"],["逃","táo","หนี"],
    ["迷","mí","หลงทาง/สับสน"],["这边","zhè biān","ทางนี้"],["那边","nà biān","ทางนั้น"],["回去","huí qù","กลับไป"],["回来","huí lái","กลับมา"],
    ["出来","chū lái","ออกมา"],["出去","chū qù","ออกไป"],["来过","lái guò","เคยมา"],["边","biān","ขอบ/ด้าน"],["运动","yùn dòng","กีฬา/ออกกำลัง"]
  ]
};

const DATA = Object.entries(RAD).flatMap(([rad, arr]) => arr.map(([hanzi, pinyin, th]) => ({ hanzi, pinyin, th, radical: rad })));

// ====== helpers ======
function ed(a,b){const d=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));for(let i=0;i<=a.length;i++)d[i][0]=i;for(let j=0;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++){for(let j=1;j<=b.length;j++){const c=a[i-1]===b[j-1]?0:1;d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+c);}}return d[a.length][b.length];}
function normTH(s){return (s||"").toLowerCase().replace(/[\sๆ…!?？、,.。]/g," ").replace(/ครับ|ค่ะ|คะ|นะ|หน่อย|ด้วย|หน่อยนะ/g,"").replace(/\s+/g," ").trim();}
function checkTH(input, targets){const a=normTH(input);let best=targets[0]||"";let bd=1e9;for(const t of targets){const d=ed(a,normTH(t));if(d<bd){bd=d;best=t;}}const m=Math.max(a.length,normTH(best).length)||1;const r=1-bd/m;return {ok:r>=0.72, ratio:r, best};}

// ====== TTS ======
let zhVoice=null;
function initVoices(){ if(!("speechSynthesis" in window)) return; const pick=()=>{ const vs=speechSynthesis.getVoices?.()||[]; zhVoice=vs.find(v=>/zh|cmn|Chinese|Mandarin/i.test((v.lang||"")+" "+(v.name||"")))||vs.find(v=>/zh/i.test(v.lang||""))||null; }; pick(); speechSynthesis.onvoiceschanged=pick; }
function speakZH(text){ if(!("speechSynthesis" in window)) return alert("อุปกรณ์นี้ไม่รองรับเสียงอ่าน"); const u=new SpeechSynthesisUtterance(text); u.lang="zh-CN"; if(zhVoice) u.voice=zhVoice; u.rate=0.95; speechSynthesis.cancel(); speechSynthesis.speak(u); }

// ====== Mic (best-effort notice only; Web Speech API not available in vanilla without SR object) ======
function setupMic(btn, out){
  const SR = window.webkitSpeechRecognition || window.SpeechRecognition;
  if (SR && window.isSecureContext) {
    const rec = new SR();
    rec.lang = "zh-CN";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    btn.disabled = false;
    btn.textContent = "เริ่มอัดไมค์";
    btn.onclick = () => {
      try {
        rec.onresult = (e)=>{ out.textContent = e.results[0][0].transcript; };
        rec.start();
      } catch(e){ out.textContent = "เริ่มไมค์ไม่สำเร็จ: " + (e.message || e); }
    };
  } else {
    btn.disabled = true;
    btn.textContent = "ไมค์ไม่พร้อม";
  }
}

// ====== UI ======
const radicalsDiv = document.getElementById('radicals');
const countEl = document.getElementById('count');
const hanziEl = document.getElementById('hanzi');
const pinyinEl = document.getElementById('pinyin');
const speakBtn = document.getElementById('speakBtn');
const ansInput = document.getElementById('answer');
const checkBtn = document.getElementById('checkBtn');
const resetBtn = document.getElementById('resetBtn');
const fillBtn = document.getElementById('fillBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const resultEl = document.getElementById('result');
const micBtn = document.getElementById('micBtn');
const micOut = document.getElementById('micOut');

let currentRad = "ทั้งหมด";
let list = DATA.slice();
let idx = 0;
let checked = false;

function renderRadicals(){
  radicalsDiv.innerHTML = "";
  const allBtn = document.createElement('button');
  allBtn.textContent = "ทั้งหมด";
  allBtn.className = "px-3 py-1.5 rounded-full border bg-slate-900 text-white";
  allBtn.onclick = () => selectRad("ทั้งหมด");
  radicalsDiv.appendChild(allBtn);

  Object.keys(RAD).forEach(rad => {
    const b = document.createElement('button');
    b.textContent = rad;
    b.className = "px-3 py-1.5 rounded-full border";
    b.onclick = () => selectRad(rad);
    radicalsDiv.appendChild(b);
  });
}

function selectRad(rad){
  currentRad = rad;
  list = rad==="ทั้งหมด" ? DATA.slice() : DATA.filter(x=>x.radical===rad);
  idx = 0;
  updateCard(true);
  Array.from(radicalsDiv.children).forEach(btn=>{
    btn.classList.toggle("bg-slate-900", btn.textContent===rad || (rad==="ทั้งหมด" && btn.textContent==="ทั้งหมด"));
    btn.classList.toggle("text-white", btn.textContent===rad || (rad==="ทั้งหมด" && btn.textContent==="ทั้งหมด"));
  });
}

function updateCard(resetAns=false){
  countEl.textContent = `${list.length} คำ`;
  const item = list[idx];
  hanziEl.textContent = item.hanzi;
  pinyinEl.textContent = item.pinyin;
  pinyinEl.classList.add("hidden");
  if (resetAns) { ansInput.value=""; checked=false; resultEl.textContent=""; }
  speakBtn.onclick = () => speakZH(item.hanzi);
  fillBtn.onclick = () => ansInput.value = Array.isArray(item.th)?item.th[0]:item.th;
}

function onCheck(){
  const item = list[idx];
  const targets = Array.isArray(item.th) ? item.th : [item.th];
  const r = checkTH(ansInput.value, targets);
  resultEl.textContent = (r.ok ? "✅ ถูกต้อง" : "❌ ยังไม่ตรง") + ` (${(r.ratio*100).toFixed(0)}%) · ตัวอย่าง: ${r.best}`;
  pinyinEl.classList.remove("hidden");
  checked = true;
}

function onReset(){
  ansInput.value = "";
  resultEl.textContent = "";
  pinyinEl.classList.add("hidden");
  checked = false;
}

prevBtn.onclick = ()=>{ idx = (idx-1+list.length)%list.length; updateCard(true); };
nextBtn.onclick = ()=>{ idx = (idx+1)%list.length; updateCard(true); };
checkBtn.onclick = onCheck;
resetBtn.onclick = onReset;

initVoices();
renderRadicals();
selectRad("ทั้งหมด");
setupMic(micBtn, micOut);
