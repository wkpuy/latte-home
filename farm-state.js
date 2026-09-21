export const RICE={id:'rice',name:'ข้าว',icon:'🌾',seed:6,price:9,seconds:180,yield:3,color:'#d8be69',paddy:true};
export const PADDIES=[{id:0,x:-3.15,z:4.25,anchor:{x:-1.85,z:4.25},price:0},{id:1,x:-3.15,z:6.15,anchor:{x:-1.85,z:6.15},price:60}];
const count=(n,max=1000000)=>Number.isFinite(n)?Math.max(0,Math.min(max,Math.floor(n))):0;
export function initialFarm(){return {unlocked:1,auto:false,harvested:0,paddies:[null,null]};}
export function restoreFarm(v){const f=initialFarm();if(!v||typeof v!=='object')return f;f.unlocked=v.unlocked===2?2:1;f.auto=v.auto===true;f.harvested=count(v.harvested);f.paddies=f.paddies.map((_,i)=>{const p=v.paddies?.[i];return i<f.unlocked&&p?.crop==='rice'?{crop:'rice',growth:Number.isFinite(p.growth)?Math.max(0,Math.min(RICE.seconds,p.growth)):0,water:Number.isFinite(p.water)?Math.max(0,Math.min(90,p.water)):0}:null;});return f;}
export function advanceFarm(s,seconds){if(!Number.isFinite(seconds)||seconds<=0)return;for(const p of s.farm.paddies){if(!p)continue;const delta=Math.min(seconds,p.water,RICE.seconds-p.growth);p.growth+=delta;p.water-=delta;}}
export function expandFarm(s){if(s.farm.unlocked!==1||s.coins<PADDIES[1].price)return false;s.coins-=PADDIES[1].price;s.farm.unlocked=2;return true;}
function valid(s,i){return Number.isInteger(i)&&i>=0&&i<s.farm.unlocked;}
export function plantRice(s,i){if(!valid(s,i)||s.farm.paddies[i]||s.seeds.rice<1)return false;s.seeds.rice--;s.farm.paddies[i]={crop:'rice',growth:0,water:0};s.energy=Math.max(0,s.energy-2);return true;}
export function waterRice(s,i){const p=valid(s,i)&&s.farm.paddies[i];if(!p||p.growth>=RICE.seconds||p.water>0)return false;p.water=90;return true;}
export function harvestRice(s,i){const p=valid(s,i)&&s.farm.paddies[i];if(!p||p.growth<RICE.seconds||s.produce.rice>1000000-RICE.yield)return false;s.produce.rice+=RICE.yield;s.farm.harvested=Math.min(1000000,s.farm.harvested+RICE.yield);s.farm.paddies[i]=null;s.joy=Math.min(100,s.joy+6);return true;}
export function riceAction(s,i){if(!valid(s,i))return 'locked';const p=s.farm.paddies[i];return !p?'plant':p.growth>=RICE.seconds?'harvest':p.water<=0?'water':'growing';}
export function nextFarmAction(s){if(!s.farm.auto)return -1;for(const action of ['harvest','water','plant']){const i=s.farm.paddies.findIndex((_,i)=>riceAction(s,i)===action&&(action!=='plant'||s.seeds.rice>0));if(i>=0)return i;}return -1;}
