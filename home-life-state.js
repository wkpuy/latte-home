export const THEMES={warm:{name:'อบอุ่น',wall:'#e8d9c1',floor:'#dfc5a3',curtain:'#c5a897',bed:'#bca5ac',rug:'#c5cfb0',art:'#d29f73'},garden:{name:'บ้านสวน',wall:'#d5e3cf',floor:'#cbd6bd',curtain:'#829e83',bed:'#a8bf98',rug:'#89ae9a',art:'#5e9278'},bakery:{name:'ร้านขนม',wall:'#f1d8d0',floor:'#e8cda8',curtain:'#d99ea8',bed:'#edc4cc',rug:'#ddaf94',art:'#bb8e68'}};
export const HOME_ACTIONS=[
 {id:'brush',name:'แปรงขน',icon:'🪮',where:'sofa',duration:9,effect:{hygiene:5,joy:6}},
 {id:'ears',name:'เช็ดหู',icon:'🧼',where:'sofa',duration:9,effect:{hygiene:8,joy:4}},
 {id:'mail',name:'อ่านจดหมาย',icon:'💌',where:'sofa',duration:8,effect:{social:7,joy:4}},
 {id:'window',name:'เปิด / ปิดหน้าต่าง',icon:'🪟',where:'window',duration:4,effect:{joy:3}},
 {id:'laundry',name:'ซักและตากผ้า',icon:'👕',where:'garden',duration:12,effect:{hygiene:3}},
 {id:'collect',name:'เก็บผ้าที่แห้งแล้ว',icon:'🧺',where:'garden',duration:6,effect:{joy:3}},
 {id:'nap',name:'งีบสั้นบนโซฟา',icon:'💤',where:'sofa',duration:10,effect:{energy:15}},
 {id:'makebed',name:'จัดเตียง',icon:'🛏️',where:'bed',duration:7,effect:{joy:4}},
 {id:'mop',name:'เช็ดพื้นเปียก',icon:'🧽',where:'shower',duration:7,effect:{hygiene:3}},
 {id:'restock',name:'เติมวัตถุดิบ 6 มื้อ · 5 เหรียญ',icon:'🛒',where:'market',duration:5},
 {id:'store',name:'เก็บอาหารเข้าตู้เย็น',icon:'🥡',where:'fridge',duration:5}
];
const bounded=(n,max=100)=>Number.isFinite(n)?Math.max(0,Math.min(max,n)):0;
export function initialHome(){return {bedMess:0,laundry:0,drying:0,dryClothes:0,wet:0,windowOpen:false,autoPauseClose:true,provisions:6,stored:{},mailDay:0,mailText:'',decor:{theme:'warm',artStyle:'flower',...THEMES.warm},preferences:{meal:{},place:{},friend:{},hobby:{}}};}
export function restoreHome(v){const h=initialHome();if(!v)return h;for(const k of ['bedMess','laundry','drying','dryClothes','wet','provisions','mailDay'])if(k in v)h[k]=bounded(v[k],k==='mailDay'?100000:100);h.windowOpen=!!v.windowOpen;h.autoPauseClose=v.autoPauseClose!==false;if(['flower','sun','mountains'].includes(v.decor?.artStyle))h.decor.artStyle=v.decor.artStyle;h.mailText=typeof v.mailText==='string'?v.mailText.slice(0,200):'';if(THEMES[v.decor?.theme])h.decor.theme=v.decor.theme;for(const k of ['wall','floor','curtain','bed','rug','art'])if(/^#[0-9a-f]{6}$/i.test(v.decor?.[k]))h.decor[k]=v.decor[k];for(const [k,n]of Object.entries(v.stored??{}))if(/^[a-z-]{1,30}$/.test(k))h.stored[k]=Math.floor(bounded(n,100000));for(const type of Object.keys(h.preferences))for(const [id,n]of Object.entries(v.preferences?.[type]??{}))if(/^[a-z-]{1,30}$/.test(id))h.preferences[type][id]=bounded(n);return h;}
export function prefer(s,type,id){if(!id||!s.home?.preferences[type])return;const p=s.home.preferences[type];p[id]=Math.min(100,(p[id]??0)+1);}
export function favorite(s,type){return Object.entries(s.home?.preferences[type]??{}).sort((a,b)=>b[1]-a[1])[0]?.[0]??'';}
export function advanceHome(s,seconds){const h=s.home;if(!h)return;h.wet=Math.max(0,h.wet-seconds/180);if(h.drying>0){h.drying=Math.max(0,h.drying-seconds);if(h.drying===0)h.dryClothes++;}}
export function homeBlock(s,id){const h=s.home;if(id==='laundry')return h.laundry<1?'ยังไม่มีผ้ารอซัก':h.drying>0||h.dryClothes?'ราวตากผ้ายังไม่ว่าง':'';if(id==='collect')return !h.dryClothes?'ผ้ายังไม่แห้งหรือยังไม่ได้ตาก':'';if(id==='restock')return s.coins<5?'ต้องใช้ 5 เหรียญ':h.provisions>94?'ตู้เย็นเต็มแล้ว':'';if(id==='store')return Object.values(s.daily.dishes).some(n=>n>0)?'':'ยังไม่มีอาหารที่ทำไว้';if(id==='mail')return h.mailDay===s.day?'อ่านจดหมายของวันนี้แล้ว':'';if(id==='makebed')return h.bedMess?'':'เตียงเรียบร้อยแล้ว';if(id==='mop')return h.wet>0?'':'พื้นแห้งแล้ว';return '';}
export function doHome(s,id){if(homeBlock(s,id))return false;const h=s.home;
 if(id==='window')h.windowOpen=!h.windowOpen;
 if(id==='laundry'){h.laundry=0;h.drying=60;}
 if(id==='collect')h.dryClothes=0;
 if(id==='makebed')h.bedMess=0;
 if(id==='mop')h.wet=0;
 if(id==='restock'){s.coins-=5;h.provisions+=6;}
 if(id==='store')for(const [m,n]of Object.entries(s.daily.dishes)){h.stored[m]=(h.stored[m]??0)+n;s.daily.dishes[m]=0;}
 if(id==='mail'){h.mailDay=s.day;const who=favorite(s,'friend')==='poppy'?'ป๊อปปี้':'ไมโล';h.mailText=`ถึงลาเต้ วันนี้อากาศดี อย่าลืมพักและหาอะไรกินนะ ว่างแล้วมาเจอกันที่สวน — ${who}`;}
 return true;
}
export function takeStored(s,id){if(!s.home.stored[id]||!(id in s.daily.dishes)||s.daily.dishes[id]>=100000)return false;s.home.stored[id]--;s.daily.dishes[id]++;return true;}
