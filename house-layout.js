import {PADDIES} from './farm-state.js?v=contact21';
import {TOWN_PLACES} from './town-data.js?v=contact21';
// Shared scene and navigation coordinates, in metres.
export const ROOMS=[{id:'bedroom',name:'ห้องนอน',x:-2.5,z:-2.25,color:'#e8d9d2'},{id:'bathroom',name:'ห้องน้ำ',x:2.5,z:-2.25,color:'#d7e6df'},{id:'living',name:'ห้องนั่งเล่น',x:-2.5,z:1.25,color:'#e9dcc3'},{id:'kitchen',name:'ห้องครัว',x:2.5,z:1.25,color:'#e3e5ce'}];
export const WALLS=[[-5.1,-5,-4.1,3.1],[5,5.1,-4.1,3.1],[-5,5,-4.1,-4],[-.07,.07,-4,-2.8],[-.07,.07,-1.2,.4],[-.07,.07,2.1,3],[-5,-3.4,-.57,-.43],[-1.7,1.7,-.57,-.43],[3.4,5,-.57,-.43],[-5,-1,2.94,3.06],[1,5,2.94,3.06]];
export const FIXTURES=[
{id:'bed',name:'เตียงนุ่ม ๆ',action:'นอนพัก',room:'bedroom',x:-3.75,z:-2.6,w:1.65,d:2,anchor:{x:-2.35,z:-2.3},look:{x:-3.75,z:-2.6},mode:'Sleep',duration:18,effects:{energy:38},icon:'☾'},
{id:'shower',name:'มุมอาบน้ำ',action:'อาบน้ำ',room:'bathroom',x:4,z:-2.9,w:1.3,d:1.4,anchor:{x:2.9,z:-2.7},look:{x:4,z:-2.9},mode:'Idle',duration:7,effects:{hygiene:48,joy:4},icon:'🫧'},
{id:'sink',name:'อ่างล้างหน้า',action:'ล้างหน้า',room:'bathroom',x:1.35,z:-3.5,w:1.25,d:.7,anchor:{x:1.35,z:-2.55},look:{x:1.35,z:-3.5},mode:'Idle',duration:4,effects:{hygiene:24},icon:'💧'},
{id:'toilet',name:'ชักโครก',action:'เข้าห้องน้ำ',room:'bathroom',x:1,z:-1.3,w:.7,d:.9,anchor:{x:2.05,z:-1.25},look:{x:1,z:-1.3},mode:'Sit_Test',duration:10,effects:{hygiene:12,joy:5},icon:'🚽'},
{id:'sofa',name:'โซฟาตัวโปรด',action:'นั่งพัก',room:'living',x:-3.7,z:.25,w:2.1,d:.9,anchor:{x:-3.5,z:1.3},look:{x:-3.7,z:.25},mode:'Sit_Test',duration:8,effects:{energy:12,joy:14},icon:'🛋'},
{id:'fridge',name:'ตู้เย็น',action:'กินขนม',room:'kitchen',x:4.2,z:.35,w:.95,d:.9,anchor:{x:3.15,z:.5},look:{x:4.2,z:.35},mode:'Eat',duration:5,effects:{food:30,joy:3},icon:'🍪'},
{id:'counter',name:'เคาน์เตอร์ครัว',action:'เตรียมอาหารง่าย ๆ',room:'kitchen',x:3.8,z:1.95,w:1.9,d:.85,anchor:{x:2.3,z:2},look:{x:3.8,z:2.2},mode:'Eat',duration:8,effects:{food:40,joy:5},icon:'🥣'}];
export const BASE_FIXTURES=JSON.parse(JSON.stringify(FIXTURES));
export const PLOTS=Array.from({length:6},(_,i)=>({id:i,x:1.6+(i%3)*1.35,z:4.1+Math.floor(i/3)*1.8}));
export const OBSTACLES=[...PADDIES.map(p=>[p.x-1,p.x+1,p.z-.65,p.z+.65]),...WALLS,...FIXTURES.map(f=>[f.x-f.w/2,f.x+f.w/2,f.z-f.d/2,f.z+f.d/2]),...PLOTS.map(p=>[p.x-.43,p.x+.43,p.z-.43,p.z+.43]),...TOWN_PLACES.map(p=>[p.x-p.w/2,p.x+p.w/2,p.z-p.d/2,p.z+p.d/2]),[-.85,.85,12.5,14.2],[-5,-.85,7.1,7.3],[.85,5,7.1,7.3]];
export const START={x:-1.1,z:1.55};
const R=.23,STEP=.25,MINX=-8.5,MINZ=-4.5,NX=99,NZ=93;
export function walkable(p){return Number.isFinite(p?.x)&&Number.isFinite(p?.z)&&Math.abs(p.x)<=(p.z>=12.5?15.4-R:p.z>=7.5?8-R:5-R)&&p.z>=-4+R&&p.z<=18-R&&!OBSTACLES.some(([a,b,c,d])=>p.x>a-R&&p.x<b+R&&p.z>c-R&&p.z<d+R);}
export function clearLine(a,b){const n=Math.ceil(Math.hypot(a.x-b.x,a.z-b.z)/.07);for(let i=0;i<=n;i++){const t=n?i/n:0;if(!walkable({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t}))return false;}return true;}
const point=i=>({x:MINX+(i%NX)*STEP,z:MINZ+Math.floor(i/NX)*STEP});
let valid=new Set(Array.from({length:NX*NZ},(_,i)=>i).filter(i=>walkable(point(i))));
function nearest(p){let best=-1,dist=Infinity;for(const i of valid){const q=point(i),d=(p.x-q.x)**2+(p.z-q.z)**2;if(d<dist&&clearLine(p,q)){best=i;dist=d;}}return best;}
export function findPath(from,to){
 if(!walkable(from)||!walkable(to))return null;if(clearLine(from,to))return [{...to}];
 const start=nearest(from),goal=nearest(to);if(start<0||goal<0)return null;
 const open=new Set([start]),came=new Map(),g=new Map([[start,0]]),f=new Map([[start,0]]),closed=new Set();
 while(open.size){let current=-1,best=Infinity;for(const i of open)if(f.get(i)<best){best=f.get(i);current=i;}
  if(current===goal){const path=[{...to},point(current)];while(came.has(current)){current=came.get(current);path.push(point(current));}path.reverse();const smooth=[];let origin=from;for(let i=0;i<path.length;){let j=path.length-1;while(j>i&&!clearLine(origin,path[j]))j--;smooth.push(path[j]);origin=path[j];i=j+1;}return smooth;}
  open.delete(current);closed.add(current);
  for(const offset of [-NX,NX,-1,1]){const next=current+offset;if(!valid.has(next)||closed.has(next)||!clearLine(point(current),point(next)))continue;const cost=g.get(current)+STEP;if(cost<(g.get(next)??Infinity)){came.set(next,current);g.set(next,cost);const p=point(next),q=point(goal);f.set(next,cost+Math.hypot(p.x-q.x,p.z-q.z));open.add(next);}}
 }return null;
}
export function roomAt(p){if(p.z>7.3)return 'เมืองใบชา';if(p.z>3)return 'สวนหลังบ้าน';return ROOMS.find(r=>(r.x<0)===(p.x<0)&&(r.z<-.5)===(p.z<-.5))?.name??'อยู่บ้าน';}

export function rotatePoint(p,f,angle){const c=Math.cos(angle),s=Math.sin(angle),x=p.x-f.x,z=p.z-f.z;return {...p,x:f.x+x*c+z*s,z:f.z-x*s+z*c};}
export function fixtureAngle(id){return FIXTURES.find(f=>f.id===id)?.angle??0;}
OBSTACLES.push([-2.13,-.47,5.02,5.18],[-1.35,-.25,-3.925,-3.475],[-1.2,-.4,-2.9,-2.4],[.75,1.75,1.1,2.2],[8.9,14.95,13.05,17.6]);valid=new Set(Array.from({length:NX*NZ},(_,i)=>i).filter(i=>walkable(point(i))));
const fixedObstacles=OBSTACLES.filter((_,i)=>i<2+WALLS.length||i>=2+WALLS.length+FIXTURES.length);
function installLayout(layout){
 for(let i=0;i<FIXTURES.length;i++){const f=FIXTURES[i],b=BASE_FIXTURES[i],v=layout?.[b.id],angle=((typeof v==='number'?v:v?.angle)??0)*Math.PI/180,dx=typeof v==='object'?(v.x??0):0,dz=typeof v==='object'?(v.z??0):0;Object.assign(f,b,{x:b.x+dx,z:b.z+dz,angle,anchor:rotatePoint({x:b.anchor.x+dx,z:b.anchor.z+dz},{x:b.x+dx,z:b.z+dz},angle),look:rotatePoint({x:b.look.x+dx,z:b.look.z+dz},{x:b.x+dx,z:b.z+dz},angle)});}
 OBSTACLES.splice(0,OBSTACLES.length,...fixedObstacles,...FIXTURES.map(f=>{const w=Math.abs(Math.cos(f.angle))*f.w+Math.abs(Math.sin(f.angle))*f.d,d=Math.abs(Math.sin(f.angle))*f.w+Math.abs(Math.cos(f.angle))*f.d;return [f.x-w/2,f.x+w/2,f.z-d/2,f.z+d/2];}));
 valid=new Set(Array.from({length:NX*NZ},(_,i)=>i).filter(i=>walkable(point(i))));
}
function installAngles(angles){installLayout(angles);}
function validateLayout(layout,actor){
 const rects=OBSTACLES.slice(-FIXTURES.length),overlap=(a,b)=>a[0]<b[1]-.005&&a[1]>b[0]+.005&&a[2]<b[3]-.005&&a[3]>b[2]+.005;
 const collision=rects.some((r,i)=>r[0]<-5||r[1]>5||r[2]<-4||r[3]>3||fixedObstacles.some(b=>overlap(r,b))||rects.some((q,j)=>i<j&&overlap(r,q)));
 const anchors=[...FIXTURES.map(f=>f.anchor),...PLOTS.map(p=>({x:p.x,z:p.z+.7})),...PADDIES.map(p=>p.anchor),{x:0,z:8.1}];
 return !collision&&walkable(actor)&&findPath(actor,START)&&anchors.every(p=>findPath(START,p));
}
export function setFurnitureAngles(angles,actor=START){
 const old=Object.fromEntries(FIXTURES.map(f=>[f.id,(f.angle??0)*180/Math.PI]));
 if(!angles||typeof angles!=='object'||Object.entries(angles).some(([id,a])=>!BASE_FIXTURES.some(f=>f.id===id)||!Number.isFinite(a)||a<0||a>=360||a%15!==0))return false;
 installAngles(angles);
 if(!validateLayout(angles,actor)){installAngles(old);return false;}return true;
}
export function setFurnitureLayout(layout,actor=START){
 const old=Object.fromEntries(FIXTURES.map(f=>[f.id,{x:f.x-BASE_FIXTURES.find(b=>b.id===f.id).x,z:f.z-BASE_FIXTURES.find(b=>b.id===f.id).z,angle:(f.angle??0)*180/Math.PI}]));
 if(!layout||typeof layout!=='object'||Object.entries(layout).some(([id,v])=>!BASE_FIXTURES.some(f=>f.id===id)||typeof v!=='object'||!Number.isFinite(v.x??0)||!Number.isFinite(v.z??0)||!Number.isFinite(v.angle??0)||Math.abs(v.x??0)>.9||Math.abs(v.z??0)>.9||(v.angle??0)<0||(v.angle??0)>=360||(v.angle??0)%15!==0))return false;
 installLayout(layout);if(!validateLayout(layout,actor)){installLayout(old);return false;}return true;
}
