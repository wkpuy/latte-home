import {prefer} from './home-life-state.js?v=contact21';
import {remember,fishingConditions} from './living-state.js?v=contact21';
export const FISH=[{id:'tilapia',name:'ปลานิล',color:'#829c9c',weight:55},{id:'carp',name:'ปลาตะเพียน',color:'#d2b978',weight:30},{id:'catfish',name:'ปลาดุก',color:'#7b8582',weight:12},{id:'perch',name:'ปลากะพง',color:'#b6ccd1',weight:3}];
export const MEALS=[
 {id:'porridge',name:'โจ๊กไข่นุ่ม',slot:0,color:'#ecddbc',food:32},
 {id:'toast',name:'ขนมปังไข่คน',slot:0,color:'#eac875',food:30},
 {id:'rice',name:'ข้าวผัดผัก',slot:1,color:'#e4b674',food:38},
 {id:'noodles',name:'บะหมี่ผัก',slot:1,color:'#d6b579',food:36},
 {id:'soup',name:'ซุปฟักทอง',slot:2,color:'#e2a760',food:34},
 {id:'omelet',name:'ข้าวไข่เจียว',slot:2,color:'#e8c36f',food:38},
 ...FISH.map((f,i)=>({id:'fish-'+f.id,name:['ปลานิลนึ่งขิง','ปลาตะเพียนทอด','ข้าวปลาดุกย่าง','ซุปปลากะพง'][i],fish:f.id,color:f.color,food:44+i*3}))
];
export const EMOTIONS={
 love:{name:'รัก',icon:'💕',face:'Shy',mode:'Wave_Test',reason:'ได้รับความใส่ใจและอยากอยู่ใกล้'},
 greed:{name:'อยากได้อีก',icon:'🤩',face:'Wide',mode:'Idle',reason:'มีของที่อยากได้ กำลังคิดถึงมันอยู่'},
 angry:{name:'โกรธ',icon:'😠',face:'Sad',mode:'Idle',reason:'มีเรื่องขัดใจ อยากมีเวลาสงบใจ'},
 fascinated:{name:'หลงใหล',icon:'✨',face:'Happy',mode:'Idle',reason:'เจอสิ่งที่ชอบจนละสายตาไม่ได้'},
 regret:{name:'เสียใจ',icon:'💔',face:'Sad',mode:'Idle',reason:'ผิดหวังกับสิ่งที่ตั้งใจไว้'},
 crying:{name:'ร้องไห้',icon:'💧',face:'Sad',mode:'Idle',reason:'เศร้าจนน้ำตาไหล อยากได้การปลอบใจ'},
 furious:{name:'โมโห',icon:'💢',face:'Sad',mode:'Idle',reason:'หงุดหงิดมาก ขอพักหายใจสักหน่อย'},
 sad:{name:'เศร้า',icon:'😔',face:'Sad',mode:'Idle',reason:'เหงาและคิดถึงช่วงเวลาดี ๆ'},
 happy:{name:'ดีใจ',icon:'😊',face:'Happy',mode:'Dance',reason:'ได้ทำสิ่งที่ชอบ รู้สึกสดใส'}
};
const count=n=>Number.isFinite(n)?Math.max(0,Math.min(100000,Math.floor(n))):0;
export const level=xp=>Math.min(10,1+Math.floor(Math.sqrt(count(xp)/3)));
export function initialDaily(){return {fish:Object.fromEntries(FISH.map(f=>[f.id,0])),dishes:Object.fromEntries(MEALS.map(m=>[m.id,0])),fishingXP:0,cookingXP:0,lastMeal:'',dirtyDishes:0,emotion:null};}
export function restoreDaily(v){const d=initialDaily();for(const f of FISH)d.fish[f.id]=count(v?.fish?.[f.id]);for(const m of MEALS)d.dishes[m.id]=count(v?.dishes?.[m.id]);for(const k of ['fishingXP','cookingXP','dirtyDishes'])d[k]=count(v?.[k]);d.dirtyDishes=Math.min(12,d.dirtyDishes);if(typeof v?.lastMeal==='string')d.lastMeal=v.lastMeal.slice(0,30);if(EMOTIONS[v?.emotion?.id]&&Number.isFinite(v.emotion.until))d.emotion={id:v.emotion.id,until:v.emotion.until,reason:typeof v.emotion.reason==='string'?v.emotion.reason.slice(0,120):EMOTIONS[v.emotion.id].reason};return d;}
export function mealSlot(s){return s.minute<660?0:s.minute<960?1:2;}
export function mealKey(s){return `${s.day}-${mealSlot(s)}`;}
export function menuFor(s){return MEALS.filter(m=>m.slot===mealSlot(s))[(s.day-1)%2];}
export function feel(s,id,reason){if(!EMOTIONS[id])return;s.daily.emotion={id,reason:reason??EMOTIONS[id].reason,until:s.day*1440+s.minute+90};}
export function feeling(s){
 const critical=s.social<22&&s.joy<30?'crying':s.food<22&&s.energy<25?'furious':s.energy<18?'furious':s.food<20?'angry':s.joy<30?'sad':null;
 // A pleasant moment can linger, but it must not hide hunger, exhaustion or loneliness.
 if(critical)return {id:critical,...EMOTIONS[critical],reason:critical==='crying'?'เหงาและใจไม่ค่อยไหว อยากได้การปลอบใจ':critical==='furious'?'เหนื่อยมากจนเริ่มไม่ไหว ขอพักก่อน':'หิวมากจนเริ่มหงุดหงิด'};
 const e=s.daily.emotion;if(e&&e.until>s.day*1440+s.minute)return {...EMOTIONS[e.id],...e};
 const id=s.food<30?'angry':'happy';return {id,...EMOTIONS[id],reason:id==='happy'?'สบายใจ พร้อมใช้ชีวิตวันนี้':'หิวจนเริ่มหงุดหงิด'};
}
export function canCook(s,id){const m=MEALS.find(m=>m.id===id);return !!m&&(m.fish||!s.home||s.home.provisions>0)&&(!m.fish||s.daily.fish[m.fish]>0)&&s.daily.dishes[id]<100000;}
export function cookMeal(s,id){if(!canCook(s,id))return false;const m=MEALS.find(m=>m.id===id);if(m.fish)s.daily.fish[m.fish]--;else if(s.home)s.home.provisions--;s.daily.dishes[id]++;s.daily.cookingXP=Math.min(100000,s.daily.cookingXP+3);if(s.living&&!s.living.recipes.includes(id))s.living.recipes.push(id);remember(s,'cook',`ทำ${m.name}สำเร็จ`,id);feel(s,'happy',`ทำ${m.name}สำเร็จ ฝีมือดีขึ้นอีกนิด`);return true;}
export function eatMeal(s,id){const m=MEALS.find(m=>m.id===id);if(!m||!s.daily.dishes[id])return false;s.daily.dishes[id]--;prefer(s,'meal',id);s.daily.dirtyDishes=Math.min(12,(s.daily.dirtyDishes??0)+1);s.food=Math.min(100,s.food+m.food+level(s.daily.cookingXP));s.joy=Math.min(100,s.joy+8);s.daily.lastMeal=mealKey(s);remember(s,'meal',`ได้กิน${m.name}`,id);feel(s,'happy',`อิ่มอร่อยกับ${m.name}`);return true;}
export function cleanDishes(s){if(!s.daily.dirtyDishes)return false;s.daily.dirtyDishes--;remember(s,'home','ล้างจานและเก็บโต๊ะให้เรียบร้อย','dishes');return true;}
export function catchFish(s,random=Math.random){const skill=level(s.daily.fishingXP),conditions=fishingConditions(s);s.daily.fishingXP=Math.min(100000,s.daily.fishingXP+1);if(random()>Math.min(.97,.72+skill*.022+conditions.bonus)){remember(s,'fish-miss','ปลาหลุดไป แต่ได้ฝึกตกปลา');feel(s,'regret','ปลาว่ายหลุดไป คราวหน้าค่อยลองใหม่');return null;}const weights=FISH.map((f,i)=>(f.weight+(i>1?skill*2:0))*conditions.weights[i]),total=weights.reduce((a,b)=>a+b,0);let n=random()*total,index=0;while(index<weights.length-1&&n>=weights[index])n-=weights[index++];const f=FISH[index];s.daily.fish[f.id]=Math.min(100000,s.daily.fish[f.id]+1);if(s.living)s.living.caught[f.id]=Math.min(100000,(s.living.caught[f.id]??0)+1);remember(s,'fish',`ตกได้${f.name}`,f.id);feel(s,index>1?'fascinated':'happy',`ตกได้${f.name}! เอาไปทำอาหารได้แล้ว`);return f;}
