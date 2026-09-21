import {weatherFor} from './weather-state.js?v=contact21';

export const FRIEND_PREFS={milo:{name:'ไมโล',likes:'cookie',likeName:'คุกกี้เนย',hobby:'read',hobbyName:'อ่านหนังสือ'},poppy:{name:'ป๊อปปี้',likes:'carrotCake',likeName:'มัฟฟินแครอท',hobby:'draw',hobbyName:'วาดรูป'}};
export const HOBBIES=[
 {id:'read',name:'อ่านหนังสือ',icon:'📖',where:'sofa',joy:9},
 {id:'waterplants',name:'รดน้ำต้นไม้',icon:'💧',where:'garden',joy:7},
 {id:'feedfish',name:'ให้อาหารปลา',icon:'🐟',where:'pond',joy:8},
 {id:'draw',name:'วาดรูป',icon:'🎨',where:'table',joy:12},
 {id:'listen',name:'ฟังเพลง',icon:'🎵',where:'sofa',joy:10},
 {id:'watchrain',name:'ดูฝนริมหน้าต่าง',icon:'🌧️',where:'window',joy:9},
 {id:'toy',name:'เล่นของเล่น',icon:'🧸',where:'rug',joy:12},
 {id:'tidy',name:'เก็บของเข้าที่',icon:'🧺',where:'rug',joy:6},
 {id:'wipe',name:'เช็ดโต๊ะ',icon:'🧽',where:'table',joy:5},
 {id:'sweep',name:'กวาดบ้าน',icon:'🧹',where:'rug',joy:5},
 {id:'sunbathe',name:'นั่งรับแดดเช้า',icon:'🌤️',where:'garden',joy:9},
 {id:'stargaze',name:'ดูดาว',icon:'✨',where:'garden',joy:10}
];
export const RODS=[{id:'bamboo',name:'เบ็ดไม้ไผ่',level:1,bonus:0},{id:'river',name:'เบ็ดสายน้ำ',level:3,bonus:.05},{id:'master',name:'เบ็ดชำนาญ',level:6,bonus:.10}];
export const SEASONS=['ฤดูใบไม้ผลิ','ฤดูร้อน','ฤดูใบไม้ร่วง','ฤดูหนาว'];
const count=n=>Number.isFinite(n)?Math.max(0,Math.min(100000,Math.floor(n))):0;
export const seasonFor=day=>SEASONS[Math.floor((Math.max(1,day)-1)/7)%4];
export const skillLevel=x=>Math.min(10,1+Math.floor(Math.sqrt(count(x)/3)));
export function initialLiving(){return {memories:[],caught:{},recipes:[],aquarium:{},rod:'bamboo',audio:{enabled:false,music:.18,effects:.45},lastVisitDay:0,sharedDay:{},tidiness:85};}
export function restoreLiving(v){const a=initialLiving();if(!v||typeof v!=='object')return a;
 a.memories=Array.isArray(v.memories)?v.memories.filter(e=>Number.isFinite(e.day)&&Number.isFinite(e.minute)&&typeof e.text==='string'&&typeof e.kind==='string').slice(-80).map(e=>({day:Math.max(1,count(e.day)),minute:Math.min(1439,count(e.minute)),kind:e.kind.slice(0,30),text:e.text.slice(0,160),ref:typeof e.ref==='string'?e.ref.slice(0,40):''})):[];
 for(const id of ['tilapia','carp','catfish','perch']){a.caught[id]=count(v.caught?.[id]);a.aquarium[id]=Math.min(1,count(v.aquarium?.[id]));}
 a.recipes=Array.isArray(v.recipes)?[...new Set(v.recipes.filter(x=>typeof x==='string'&&x.length<50))].slice(0,30):[];
 if(RODS.some(r=>r.id===v.rod))a.rod=v.rod;
 if(v.audio){a.audio.enabled=v.audio.enabled===true;for(const k of ['music','effects'])if(Number.isFinite(v.audio[k]))a.audio[k]=Math.max(0,Math.min(1,v.audio[k]));}
 a.lastVisitDay=count(v.lastVisitDay);for(const id of Object.keys(FRIEND_PREFS))a.sharedDay[id]=count(v.sharedDay?.[id]);a.tidiness=Number.isFinite(v.tidiness)?Math.max(0,Math.min(100,v.tidiness)):85;return a;
}
export function remember(s,kind,text,ref=''){if(!s.living)return;const list=s.living.memories,last=list.at(-1);if(last&&last.day===s.day&&last.kind===kind&&last.ref===ref&&s.minute-last.minute<2)return;list.push({day:s.day,minute:Math.floor(s.minute),kind,text,ref});s.living.memories=list.filter(e=>e.day>=s.day-6).slice(-80);}
export function memoryLine(s){const today=s.living.memories.filter(e=>e.day===s.day);const fish=today.filter(e=>e.kind==='fish').length,meal=today.filter(e=>e.kind==='meal').at(-1),friend=today.filter(e=>e.kind==='friend').at(-1);if(friend)return friend.text;if(fish)return `วันนี้ตกปลาได้ ${fish} ตัวแล้ว`;if(meal)return meal.text;const yesterday=s.living.memories.filter(e=>e.day===s.day-1).at(-1);return yesterday?`เมื่อวาน${yesterday.text}`:'วันนี้ยังมีเวลาให้ลองทำอะไรเพลิน ๆ อีกนะ';}
export function sleptLate(s){return s.living.memories.some(e=>e.kind==='sleep'&&((e.day===s.day-1&&e.minute>=1380)||(e.day===s.day&&e.minute<300)));}
export function didRecently(s,ref,minutes=75){return s.living.memories.some(e=>e.ref===ref&&e.day===s.day&&s.minute-e.minute<minutes);}
export function favoriteHobby(s){const counts={};for(const e of s.living.memories)if(e.kind==='hobby'&&HOBBIES.some(h=>h.id===e.ref))counts[e.ref]=(counts[e.ref]??0)+1;return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0]??'';}
export function autonomy(s){
 if(s.energy<35)return {kind:'fixture',id:'bed',reason:sleptLate(s)?'เมื่อคืนพักดึก วันนี้ขอนอนเติมพลัง':'ง่วงมาก อยากนอนพัก'};
 if(s.food<45)return {kind:'meal',reason:'ท้องเริ่มร้อง อยากทำอาหารแล้วนั่งกิน'};
 if(s.hygiene<40)return {kind:'fixture',id:'shower',reason:'ตัวไม่สดชื่น ขออาบน้ำก่อนออกไปหาเพื่อน'};
 if(s.social<40)return {kind:'friend',reason:'คิดถึงเพื่อน อยากมีคนคุยด้วย'};
 if(s.joy<35)return {kind:'hobby',id:'read',reason:'ใจไม่ค่อยดี ขอนั่งอ่านหนังสือเงียบ ๆ'};
 if(s.living.tidiness<40)return {kind:'hobby',id:'sweep',reason:'บ้านเริ่มรก อยากเก็บให้สบายตา'};
 const h=s.minute/60;if(h>=22||h<6){if(s.energy<90)return {kind:'fixture',id:'bed',reason:'ดึกแล้ว ไปพักบนเตียงดีกว่า'};return {kind:'hobby',id:'stargaze',reason:'ยังไม่ง่วง ขอออกไปดูดาวสักครู่'};}
 if(weatherFor(s.day).rain&&h>=7&&h<19&&!didRecently(s,'watchrain'))return {kind:'hobby',id:'watchrain',reason:'ฝนกำลังตก อยากนั่งฟังเสียงฝนริมหน้าต่าง'};
 if(h>=7&&h<10&&s.energy<75)return {kind:'hobby',id:'sunbathe',reason:'แสงเช้าอุ่นดี ขอออกไปรับแดด'};
 return null;
}
export function dialogue(s,id){const p=FRIEND_PREFS[id];if(!p)return '';if(s.joy<35)return `${p.name}: วันนี้ดูเงียบ ๆ นะ มานั่งด้วยกันได้นะ`;if(s.energy<35)return `${p.name}: ดูง่วงแล้ว พักก่อนก็ได้ เดี๋ยวค่อยคุยกัน`;if((s.friendship[id]??0)>=40)return `${p.name}: จำได้ไหม ${memoryLine(s)} วันนี้อยาก${p.hobbyName}ด้วยกันไหม`;return `${p.name}: เราชอบ${p.likeName}กับ${p.hobbyName}นะ วันนี้เธอทำอะไรมาบ้าง`;
}
export function shareFriend(s,id){if(!FRIEND_PREFS[id])return false;if(s.living.sharedDay[id]!==s.day){s.friendship[id]=Math.min(100,s.friendship[id]+8);s.living.sharedDay[id]=s.day;}s.social=Math.min(100,s.social+18);s.joy=Math.min(100,s.joy+10);remember(s,'friend',`ได้ใช้เวลาด้วยกันกับ${FRIEND_PREFS[id].name}`,id);return true;}
export function exchangeFish(s,id){if(!FRIEND_PREFS[id])return null;const fish=Object.keys(s.daily.fish).find(k=>s.daily.fish[k]>0);if(!fish||s.ingredients.flour>999998||s.ingredients.egg>999999)return null;s.daily.fish[fish]--;s.ingredients.flour+=2;s.ingredients.egg++;s.friendship[id]=Math.min(100,s.friendship[id]+3);remember(s,'trade',`แลกปลากับ${FRIEND_PREFS[id].name} ได้แป้งและไข่`,fish);return fish;}
export function keepFish(s,id){if(!Object.hasOwn(s.daily.fish,id)||s.daily.fish[id]<1||s.living.aquarium[id])return false;s.daily.fish[id]--;s.living.aquarium[id]=1;remember(s,'aquarium','ย้ายปลาที่จับได้มาเลี้ยงในตู้',id);return true;}
export function releaseAquarium(s,id){if(!s.living.aquarium[id])return false;s.living.aquarium[id]=0;s.daily.fish[id]++;return true;}
export function rodFor(s){const selected=RODS.find(r=>r.id===s.living?.rod);return selected&&skillLevel(s.daily.fishingXP)>=selected.level?selected:RODS[0];}
export function fishingConditions(s){const h=s.minute/60,season=seasonFor(s.day),rain=weatherFor(s.day).rain;return {season,rain,h,bonus:rodFor(s).bonus+(rain?.05:0),weights:[h<10?1.35:1,season===SEASONS[0]?1.5:1,(h>=18||h<6?1.8:1)*(rain?1.6:1),season===SEASONS[1]?2:season===SEASONS[3]?.6:1]};}
export function specialMenu(s){return ['fish-tilapia','fish-carp','fish-catfish','fish-perch'][(s.day-1)%4];}
export function sellSpecial(s){const id=specialMenu(s);if(!s.daily.dishes[id]||s.coins>999950)return 0;s.daily.dishes[id]--;const value=30+skillLevel(s.daily.cookingXP)*2;s.coins+=value;remember(s,'sale',`ขายเมนูพิเศษได้ ${value} เหรียญ`,id);return value;}
