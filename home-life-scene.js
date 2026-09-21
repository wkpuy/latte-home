import * as T from 'three';
import {reachHand,propExit} from './character-contact.js?v=contact21';
export function createHomeLifeScene(d,house,actor){
 const world=house.world,props=new T.Group();props.name='EverydayProps';world.add(props);
 const mat=c=>new T.MeshStandardMaterial({color:c,roughness:.85});
 function mesh(g,c,p,x=0,y=0,z=0){const m=new T.Mesh(g,mat(c));m.position.set(x,y,z);m.castShadow=true;p.add(m);return m;}
 const box=(w,h,l,c,p,x=0,y=0,z=0)=>mesh(new T.BoxGeometry(w,h,l),c,p,x,y,z);
 const ball=(w,h,l,c,p,x=0,y=0,z=0)=>{const o=mesh(new T.SphereGeometry(1,20,12),c,p,x,y,z);o.scale.set(w,h,l);return o;};
 const paint=(o,key)=>{o.userData.decorKey=key;return o;};
 const curtains=[],windows=[];for(const x of [-2.1,2.1]){
  for(const side of [-1,1]){const g=new T.Group();world.add(g);g.position.set(x+side*.73,1.12,-3.72);curtains.push(g);for(let i=0;i<5;i++)paint(box(.045,.9,.05,'#c5a897',g,(i-2)*.055,0,Math.sin(i)*.035),'curtain');}
  const g=new T.Group();g.name='WindowSash';g.userData.homeAction='window';house.targets.push(g);g.position.set(x-.7,1.1,-3.73);world.add(g);windows.push(g);box(1.4,.045,.045,'#f5efdd',g,.7,.32);box(1.4,.045,.045,'#f5efdd',g,.7,-.32);for(const dx of [0,.7,1.4])box(.04,.64,.04,'#f5efdd',g,dx);const glass=box(1.36,.61,.014,'#bdd9d7',g,.7);glass.material.transparent=true;glass.material.opacity=.22;glass.material.depthWrite=false;
 }
 const art=box(.62,.52,.045,'#fff1d3',world,-4.45,1.06,-3.87);const pictures={};for(const kind of ['flower','sun','mountains']){const g=new T.Group();g.name='WallArt-'+kind;art.add(g);pictures[kind]=g;if(kind==='sun')paint(ball(.16,.16,.018,'#d29f73',g,0,0,.03),'art');if(kind==='flower'){for(let i=0;i<6;i++)paint(ball(.075,.075,.018,'#d29f73',g,Math.sin(i*Math.PI/3)*.1,Math.cos(i*Math.PI/3)*.1,.03),'art');ball(.048,.048,.019,'#e9c67a',g,0,0,.055);}if(kind==='mountains')for(const x of [-.12,.1]){const o=paint(mesh(new T.ConeGeometry(.13,.28,3),'#d29f73',g,x,-.02,.03),'art');o.scale.z=.12;}}
 const wrinkles=new T.Group();wrinkles.name='UnmadeBed';house.fixtureGroups.bed.add(wrinkles);for(let i=0;i<5;i++){const fold=paint(ball(.55,.09,.10,'#bca5ac',wrinkles,Math.sin(i)*.2,.67,.05+i*.2),'bed');fold.rotation.z=Math.sin(i)*.12;}
 const laundry=new T.Group();laundry.name='LaundryPile';laundry.userData.homeAction='laundry';house.targets.push(laundry);world.add(laundry);laundry.position.set(-.9,.05,-3.32);for(let i=0;i<6;i++)ball(.16,.05,.11,['#bbcbb6','#e2b7ba','#a6bfcb'][i%3],laundry,Math.sin(i)*.14,i*.045,Math.cos(i)*.11);
 const wet=mesh(new T.CircleGeometry(.59,40),'#9cbcbc',house.fixtureGroups.shower,0,.073,.36);wet.name='WetFloor';wet.userData.homeAction='mop';house.targets.push(wet);wet.rotation.x=-Math.PI/2;wet.material.transparent=true;wet.material.opacity=.42;wet.material.depthWrite=false;
 const line=new T.Group();line.name='Clothesline';line.userData.homeAction='clothesline';house.targets.push(line);line.position.set(-1.3,0,5.1);world.add(line);for(const x of [-.75,.75])box(.04,1.3,.04,'#a68d70',line,x,.65);box(1.5,.025,.025,'#c5b69c',line,0,1.27);const hanging=new T.Group();line.add(hanging);for(const x of [-.38,.32]){box(.4,.45,.025,'#bdd0c2',hanging,x,1.03);box(.6,.15,.03,'#bdd0c2',hanging,x,1.18);}
 const washTub=mesh(new T.CylinderGeometry(.24,.2,.22,24),'#c8d9d2',line,-.45,.14,-.40);const washWater=mesh(new T.CylinderGeometry(.21,.21,.015,24),'#99c3c5',line,-.45,.245,-.40);washWater.name='LaundryWater';
 const supplies=new T.Group();supplies.name='FridgeProvisions';house.fixtureGroups.fridge.add(supplies);for(let i=0;i<6;i++)box(.13,.14,.14,i%2?'#e1bd85':'#b7c89c',supplies,-.25+(i%3)*.24,.5+Math.floor(i/3)*.37,.22);
 const brush=new T.Group();props.add(brush);box(.05,.22,.05,'#b5947b',brush,0,-.10);ball(.08,.11,.04,'#d5bfaa',brush);for(let i=0;i<5;i++)box(.018,.12,.02,'#795f4c',brush,(i-2)*.025,0,.05);
 const cloth=box(.17,.15,.04,'#ffedd6',props),letter=box(.30,.23,.01,'#fff6df',props);letter.name='LetterInHand';box(.2,.008,.012,'#af9e8b',letter,0,.045,.012);box(.16,.008,.012,'#af9e8b',letter,0,0,.012);box(.18,.008,.012,'#af9e8b',letter,0,-.045,.012);
 const mop=new T.Group();props.add(mop);box(.04,.68,.04,'#b79971',mop,0,.26);box(.23,.04,.12,'#d3c2a7',mop,0,-.08);
 const folded=box(.35,.08,.26,'#bdd0c2',props),basket=new T.Group();props.add(basket);box(.38,.025,.29,'#c4b28b',basket,0,-.1);for(const z of [-.14,.14])box(.38,.2,.025,'#c4b28b',basket,0,0,z);for(const x of [-.18,.18])box(.025,.2,.29,'#c4b28b',basket,x);
 const quilt=paint(ball(.35,.08,.25,'#bca5ac',house.fixtureGroups.sofa,0,.83,.34),'bed');quilt.name='NapQuilt';
 const movable=[brush,cloth,letter,mop,folded,basket];let active=null,start=new T.Vector3(),startYaw=0,stand=[],sit=[];
 const exit=propExit(movable,actor);
 function reset(){exit.reset();active=null;movable.forEach(o=>o.visible=false);quilt.visible=false;}
 reset();const local=(x,y,z)=>actor.localToWorld(new T.Vector3(x,y,z));
 function place(o,p){o.visible=true;o.position.copy(p);o.quaternion.copy(actor.quaternion);}
 function hold(o,side,p){reachHand(d,actor,side,p);d.model.updateWorldMatrix(true,true);place(o,d.bones['Hand_'+side].getWorldPosition(new T.Vector3()));}
 function applyDecor(s){for(const [kind,g]of Object.entries(pictures))g.visible=kind===(s.home.decor.artStyle??'flower');world.traverse(o=>{if(o.userData.decorKey)o.material.color.set(s.home.decor[o.userData.decorKey]);});}
 function update(s,task,dt,time){
  applyDecor(s);
  wrinkles.visible=!!s.home.bedMess&&task?.id!=='bed';laundry.visible=s.home.laundry>0;laundry.children.forEach((o,i)=>o.visible=i<s.home.laundry);wet.visible=s.home.wet>0;wet.material.opacity=.42*s.home.wet;hanging.visible=s.home.drying>0||s.home.dryClothes>0;hanging.rotation.z=Math.sin(time*1.3)*.035;supplies.children.forEach((o,i)=>o.visible=i<Math.min(6,s.home.provisions));windows.forEach(o=>o.rotation.y=s.home.windowOpen?-.85:0);curtains.forEach((o,i)=>o.rotation.z=s.home.windowOpen?Math.sin(time*1.8+i)*.07:0);
  if(task?.phase!=='doing'||!task.id.startsWith('home-')){if(active)reset();return;}
  if(active!==task){reset();active=task;start.copy(actor.position);startYaw=actor.rotation.y;d.samplePose('Idle',.2);stand=Object.values(d.bones).map(b=>[b,b.position.clone(),b.quaternion.clone()]);d.samplePose('Sit_Test',.65);sit=stand.map(([b])=>[b,b.position.clone(),b.quaternion.clone()]);}
  const id=task.id.slice(5),t=task.duration-task.remaining,a=T.MathUtils.smoothstep(t,0,.9)*(1-T.MathUtils.smoothstep(t,task.duration-.9,task.duration)),seated=['brush','ears','mail','nap'].includes(id);
  d.samplePose('Idle',.2);d.model.traverse(o=>{if(o.name.startsWith('Eye')&&o.morphTargetDictionary?.Blink!==undefined)o.morphTargetInfluences[o.morphTargetDictionary.Blink]=Math.sin(time*.8)>.996?1:0;});if(seated)stand.forEach(([b,p,q],i)=>{b.position.lerpVectors(p,sit[i][1],a);b.quaternion.slerpQuaternions(q,sit[i][2],a);});
  if(seated){const sofa=house.fixtureGroups.sofa,dest=sofa.localToWorld(new T.Vector3(0,.49,.12));actor.position.lerpVectors(start,dest,a);actor.rotation.y=startYaw+Math.atan2(Math.sin(sofa.rotation.y-startYaw),Math.cos(sofa.rotation.y-startYaw))*a;}
  movable.forEach(o=>{o.visible=false;o.scale.setScalar(Math.max(.05,a));});
  if(id==='brush'){hold(brush,'R',local(-.30,.70+Math.sin(t*4)*.08,.55));brush.rotateY(Math.PI);d.bones.Head.rotation.z+=.08*a;}
  if(id==='ears'){hold(cloth,'R',local(-.46,.83+Math.sin(t*3)*.07,.34));reachHand(d,actor,'L',local(.35,.79,.16));d.bones.Head.rotation.z-=.13*a;}
  if(id==='mail'){place(letter,local(0,.56,.38));reachHand(d,actor,'R',local(-.13,.55,.38));reachHand(d,actor,'L',local(.13,.55,.38));d.bones.Head.rotation.x+=.12*a;}
  if(id==='nap'){d.root.rotation.z=.16*a;d.bones.Head.rotation.x+=.14*a;quilt.visible=a>.6;d.model.traverse(o=>{if(o.name.startsWith('Eye')&&o.morphTargetDictionary?.Blink!==undefined)o.morphTargetInfluences[o.morphTargetDictionary.Blink]=a;});}
  if(id==='window'){reachHand(d,actor,'R',local(-.12,1.0,.4));windows.forEach(o=>o.rotation.y=(s.home.windowOpen?-.85:0)+(s.home.windowOpen?.85:-.85)*T.MathUtils.smoothstep(t,1,3));}
  if(id==='laundry'||id==='collect'){const washing=id==='laundry'&&t<5,height=washing?.34+Math.sin(t*7)*.04:.68+Math.sin((t-5)*.6)*.34;place(basket,local(.1,.17,.32));hold(folded,'R',local(-.14,height,.4));reachHand(d,actor,'L',local(.13,height,.38));washWater.scale.y=washing?1+Math.sin(t*8)*.25:1;if(!washing&&id==='laundry')hanging.visible=true;task.detail=washing?'ขยี้ผ้าในอ่างน้ำ':id==='collect'?'พับผ้าแห้งใส่ตะกร้า':'ยกผ้าขึ้นตากบนราว';}
  if(id==='makebed'){const bed=house.fixtureGroups.bed;actor.position.lerpVectors(start,bed.localToWorld(new T.Vector3(.98,0,.25)),a);reachHand(d,actor,'R',bed.localToWorld(new T.Vector3(.62,.68,Math.sin(t*2)*.35)));reachHand(d,actor,'L',bed.localToWorld(new T.Vector3(.60,.69,.32)));wrinkles.scale.y=1-T.MathUtils.smoothstep(t,0,task.duration)*.8;}
  if(id==='mop'){actor.position.lerpVectors(start,house.fixtureGroups.shower.localToWorld(new T.Vector3(-.70,0,.6)),a);hold(mop,'R',local(-.1,.48,.4+Math.sin(t*4)*.14));mop.rotation.x=.4;reachHand(d,actor,'L',local(.04,.54,.35));}
  if(id==='store'||id==='restock'){hold(basket,'R',local(-.12,.59,.35));reachHand(d,actor,'L',local(.13,.6,.35));}
  if(task.remaining<.9)task.detail='เก็บของและกลับมายืน';
 }
 return {update,reset,applyDecor,leave:exit.leave};
}
