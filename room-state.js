import {initialHome,restoreHome,advanceHome} from './home-life-state.js?v=contact21';
import {initialLiving,restoreLiving} from './living-state.js?v=contact21';
import {initialDaily,restoreDaily} from './daily-life-state.js?v=contact21';
import {OUTFITS} from './outfits.js?v=contact21';
import {RICE,initialFarm,restoreFarm,advanceFarm} from './farm-state.js?v=contact21';
import {START,walkable} from './house-layout.js?v=contact21';
import {INGREDIENTS,RECIPES,NEIGHBORS,ordersFor} from './town-data.js?v=contact21';
export const SAVE_KEY='latte-little-room-v1';
export const NEEDS=['food','joy','energy','hygiene','social'];
export const CROPS=[RICE,{id:'carrot',name:'แครอท',icon:'🥕',seed:3,price:5,seconds:60,yield:2,color:'#edaa5d'},{id:'lettuce',name:'ผักกาด',icon:'🥬',seed:5,price:7,seconds:100,yield:2,color:'#99b66d'},{id:'pumpkin',name:'ฟักทอง',icon:'🎃',seed:8,price:12,seconds:150,yield:2,color:'#d99751'}];
export const ITEMS=[{id:'sage',name:'หมวกใบชา',kind:'hat',price:20,icon:'👒',description:'หมวกนุ่ม ๆ สีเดียวกับสวน'},{id:'rose',name:'หมวกชมพู',kind:'hat',price:35,icon:'🎀',description:'เติมสีหวานให้วันธรรมดา'},{id:'peach',name:'พรมพีช',kind:'rug',price:30,icon:'🌸',description:'มุมโปรดที่อุ่นขึ้นอีกนิด'},{id:'lamp',name:'โคมไฟดวงจันทร์',kind:'lamp',price:45,icon:'🌙',description:'แสงนวลข้างเพื่อนตัวเล็ก'}];
const clamp=(n,max=100)=>Math.max(0,Math.min(max,n));
const count=(n,fallback=0)=>Number.isFinite(n)?Math.floor(clamp(n,1000000)):fallback;
export function initial(now=Date.now()){return {version:4,home:initialHome(),living:initialLiving(),daily:initialDaily(),clothes:'sage',rotations:{},furniture:{},farm:initialFarm(),food:78,joy:75,energy:82,hygiene:85,social:80,coins:25,owned:[],hat:'none',rug:'sage',lamp:false,sleeping:false,last:now,best:0,visits:1,autoLife:true,timeScale:1,minute:480,day:1,position:{...START},seeds:{rice:2,carrot:3,lettuce:1,pumpkin:1},produce:{rice:0,carrot:0,lettuce:0,pumpkin:0},plots:Array.from({length:6},()=>null),ingredients:{flour:4,butter:2,sugar:2,egg:2},pastries:Object.fromEntries(RECIPES.map(r=>[r.id,0])),friendship:Object.fromEntries(NEIGHBORS.map(n=>[n.id,0])),talkedDay:{},ordersDone:[],bakedTotal:0,salesTotal:0};}
export function restore(raw,now=Date.now()){
 let v;try{v=JSON.parse(raw);}catch{return initial(now);}if(!v||![1,2,3,4,5].includes(v.version))return initial(now);
 const s=initial(now);s.home=restoreHome(v.home);s.daily=restoreDaily(v.daily);s.living=restoreLiving(v.living);for(const k of NEEDS)if(Number.isFinite(v[k]))s[k]=clamp(v[k]);
 for(const k of ['coins','best','visits'])if(Number.isFinite(v[k]))s[k]=Math.max(0,Math.min(1000000,Math.floor(v[k])));
 s.owned=Array.isArray(v.owned)?[...new Set(v.owned.filter(id=>ITEMS.some(i=>i.id===id)))]:[];
 s.hat=s.owned.includes(v.hat)&&['sage','rose'].includes(v.hat)?v.hat:'none';s.rug=v.rug==='peach'&&s.owned.includes('peach')?'peach':'sage';s.lamp=!!v.lamp&&s.owned.includes('lamp');s.sleeping=v.sleeping===true;
 s.autoLife=v.autoLife!==false;s.timeScale=[0,.5,1,2].includes(v.timeScale)?v.timeScale:1;s.clothes=OUTFITS.some(([id])=>id===v.clothes)?v.clothes:'sage';if(v.hat==='cap')s.hat='cap';
 if(v.version>=2){
  s.minute=Number.isFinite(v.minute)?clamp(v.minute,1439.999):480;s.day=Math.max(1,count(v.day,1));
  if(walkable(v.position))s.position={x:v.position.x,z:v.position.z};
  for(const crop of CROPS){s.seeds[crop.id]=count(v.seeds?.[crop.id],s.seeds[crop.id]);s.produce[crop.id]=count(v.produce?.[crop.id]);}
  s.plots=s.plots.map((_,i)=>{const p=v.plots?.[i],c=CROPS.find(c=>c.id===p?.crop);return c&&!c.paddy?{crop:c.id,watered:p.watered===true,growth:Number.isFinite(p.growth)?clamp(p.growth,c.seconds):0}:null;});
 }
 if(v.version>=3){
  for(const i of INGREDIENTS)s.ingredients[i.id]=count(v.ingredients?.[i.id],s.ingredients[i.id]);
  for(const r of RECIPES)s.pastries[r.id]=count(v.pastries?.[r.id]);
  for(const n of NEIGHBORS){s.friendship[n.id]=clamp(count(v.friendship?.[n.id]));s.talkedDay[n.id]=Math.min(s.day,count(v.talkedDay?.[n.id]));}
  s.ordersDone=Array.isArray(v.ordersDone)?[...new Set(v.ordersDone.filter(id=>ordersFor(s.day).some(o=>o.id===id)))]:[];s.bakedTotal=count(v.bakedTotal);s.salesTotal=count(v.salesTotal);
 }
 if(v.version>=4){s.farm=restoreFarm(v.farm);for(const id of ['bed','sofa','shower','sink','toilet','fridge','counter']){const a=v.rotations?.[id];if(Number.isFinite(a)&&a>=0&&a<360&&a%15===0)s.rotations[id]=a;const p=v.furniture?.[id];if(p&&Number.isFinite(p.x)&&Number.isFinite(p.z)&&Number.isFinite(p.angle)&&Math.abs(p.x)<=.9&&Math.abs(p.z)<=.9&&p.angle>=0&&p.angle<360&&p.angle%15===0)s.furniture[id]={x:p.x,z:p.z,angle:p.angle};}}
 const seconds=Math.min(8*3600,Math.max(0,(now-(Number.isFinite(v.last)?v.last:now))/1000));
 advance(s,seconds);s.last=now;s.visits++;return s;
}
export function advance(s,seconds){if(!Number.isFinite(seconds)||seconds<=0)return;seconds*=s.timeScale??1;advanceFarm(s,seconds);advanceHome(s,seconds);s.living.tidiness=Math.max(0,s.living.tidiness-seconds*.008);for(const [key,rate] of Object.entries({food:.025,joy:.015,energy:.018,hygiene:.02,social:.018}))s[key]=Math.max(15,s[key]-seconds*rate*.5);if(s.sleeping)s.energy=clamp(s.energy+seconds*1.6);const total=s.minute+seconds;if(total>=1440)s.ordersDone=[];s.day+=Math.floor(total/1440);s.minute=total%1440;for(const p of s.plots){if(!p?.watered)continue;const c=CROPS.find(c=>c.id===p.crop);p.growth=Math.min(c.seconds,p.growth+seconds);}}
export function applyEffects(s,effects){for(const key of NEEDS)if(Number.isFinite(effects[key]))s[key]=clamp(s[key]+effects[key]);}
export function purchase(s,id){const item=ITEMS.find(i=>i.id===id);if(!item)return false;if(!s.owned.includes(id)){if(s.coins<item.price)return false;s.coins-=item.price;s.owned.push(id);}if(item.kind==='hat')s.hat=id;if(item.kind==='rug')s.rug=id;if(item.kind==='lamp')s.lamp=!s.lamp;return true;}
export function reward(s,score){score=count(score);const coins=Math.min(50,score*2);s.coins=clamp(s.coins+coins,1000000);s.best=Math.max(s.best,score);applyEffects(s,{joy:12+score,energy:-6,social:8});return coins;}
export function buySeed(s,id){const c=CROPS.find(c=>c.id===id);if(!c||s.coins<c.seed||s.seeds[id]>=1000000)return false;s.coins-=c.seed;s.seeds[id]++;return true;}
export function plant(s,index,id){const c=CROPS.find(c=>c.id===id);if(!Number.isInteger(index)||index<0||index>=s.plots.length||!c||c.paddy||s.plots[index]||s.seeds[id]<1)return false;s.seeds[id]--;s.plots[index]={crop:id,watered:false,growth:0};applyEffects(s,{energy:-2,hygiene:-2,joy:2});return true;}
export function water(s,index){const p=s.plots[index];if(!p||p.watered)return false;p.watered=true;applyEffects(s,{energy:-1,joy:2});return true;}
export function harvest(s,index){const p=s.plots[index],c=CROPS.find(c=>c.id===p?.crop);if(!c||!p.watered||p.growth<c.seconds)return false;s.produce[c.id]=clamp(s.produce[c.id]+c.yield,1000000);s.plots[index]=null;applyEffects(s,{joy:6,energy:-2,hygiene:-2});return true;}
export function sellProduce(s,id){const c=CROPS.find(c=>c.id===id);if(!c||!s.produce[id])return 0;const value=s.produce[id]*c.price;s.coins=clamp(s.coins+value,1000000);s.produce[id]=0;return value;}
export function plotStatus(p){if(!p)return 'แปลงว่าง';const c=CROPS.find(c=>c.id===p.crop);return !p.watered?'รอรดน้ำ':p.growth>=c.seconds?'เก็บได้แล้ว':`โตอีก ${Math.ceil(c.seconds-p.growth)} วินาที`;}
