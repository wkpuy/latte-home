import {propExit,plantFoot} from './character-contact.js?v=contact21';
import {FISHING_POND,pondEdge} from './pond-layout.js?v=contact21';
import * as T from 'three';
import {feeling,MEALS} from './daily-life-state.js?v=contact21';
export const DINING={x:1.25,z:.85},POND=FISHING_POND.anchor;
export function createDailyScene(d,house,actor){
 const world=house.world,targets=[];const mat=c=>new T.MeshStandardMaterial({color:c,roughness:.8});
 const wood=mat('#b49171'),cream=mat('#fff4db'),water=mat('#82bfcb'),pink=mat('#e4a4b6');
 function mesh(g,m,parent,x=0,y=0,z=0){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 const box=(w,h,l,m,p,x=0,y=0,z=0)=>mesh(new T.BoxGeometry(w,h,l),m,p,x,y,z);
 const ball=(x,y,z,m,p,a=0,b=0,c=0)=>{const o=mesh(new T.SphereGeometry(1,20,12),m,p,a,b,c);o.scale.set(x,y,z);return o;};
 const dining=new T.Group();dining.name='DiningTable';dining.userData.daily='dining';world.add(dining);targets.push(dining);dining.position.set(1.25,0,1.65);
 box(1,.08,1.1,wood,dining,0,.70,0);for(const x of [-.4,.4])for(const z of [-.25,.25])box(.065,.68,.065,wood,dining,x,.34,z);
 box(.52,.08,.5,wood,dining,0,.36,-.8);box(.52,.5,.065,wood,dining,0,.62,-1.03);ball(.25,.045,.23,mat('#b7c6a4'),dining,0,.42,-.8);for(const x of [-.21,.21])for(const z of [-1,-.61])box(.055,.35,.055,wood,dining,x,.175,z);
 const footrest=box(.62,.055,.26,wood,dining,0,.3125,-.50);footrest.name='DiningFootrest';
 const plate=mesh(new T.CylinderGeometry(.23,.20,.035,32),cream,dining,0,.758,-.06);plate.name='MealPlate';plate.position.z=-.31;const food=ball(.17,.055,.15,mat('#e4b674'),dining,0,.80,-.06);food.position.z=-.31;food.visible=plate.visible=false;
 const garnish=new T.Group();dining.add(garnish);garnish.visible=false;garnish.position.z=-.25;for(const x of [-.12,.09])ball(.03,.018,.035,mat('#88a075'),garnish,x,.83,-.05);const lemon=mesh(new T.CylinderGeometry(.055,.055,.018,20),mat('#f0d57b'),garnish,.11,.81,.07);const fishTail=mesh(new T.ConeGeometry(.065,.12,3),mat('#c29b64'),garnish,-.18,.81,-.06);fishTail.rotation.z=Math.PI/2;fishTail.scale.z=.4;
 const pond=new T.Group();pond.name='FishingPond';pond.userData.daily='fish';world.add(pond);targets.push(pond);pond.position.set(FISHING_POND.x,0,FISHING_POND.z);
 // Continue the town lawn eastward without overlapping its existing ground.
 box(7.4,.22,6.4,mat('#aab990'),world,12.2,-.17,15.1);
 const count=96,edgePoints=[];for(let i=0;i<count;i++){const a=i/count*Math.PI*2,r=pondEdge(a);edgePoints.push(new T.Vector2(Math.cos(a)*FISHING_POND.rx*r,-Math.sin(a)*FISHING_POND.rz*r));}
 const shape=new T.Shape(edgePoints),waterMat=new T.MeshStandardMaterial({color:'#648f80',roughness:.27,metalness:.12,transparent:true,opacity:.92,depthWrite:false,side:T.DoubleSide});const surface=mesh(new T.ShapeGeometry(shape),waterMat,pond,0,-.015,0);surface.rotation.x=-Math.PI/2;surface.name='PondWater';surface.castShadow=false;
 function bankRing(inner,outer,low,high,color){const positions=[],indices=[];for(let i=0;i<count;i++){const p=edgePoints[i];positions.push(p.x*inner,low,-p.y*inner,p.x*outer,high,-p.y*outer);}for(let i=0;i<count;i++){const a=i*2,b=((i+1)%count)*2;indices.push(a,b,a+1,b,b+1,a+1);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();const m=mat(color);m.side=T.DoubleSide;mesh(g,m,pond);}
 bankRing(.995,1.10,-.025,.11,'#a48b62');bankRing(1.10,1.22,.11,-.01,'#99ac7b');
 // Untrimmed reed patches and occasional rocks, leaving the west fishing bank clear.
 for(let i=0;i<32;i++){const a=i*.71;if(Math.cos(a)<-.72)continue;const r=pondEdge(a),x=Math.cos(a)*FISHING_POND.rx*r*1.13,z=Math.sin(a)*FISHING_POND.rz*r*1.13;for(let j=0;j<4;j++){const reed=box(.024,.26+(i%4)*.08,.025,mat(j%2?'#738e5a':'#859a61'),pond,x+j*.055,.19,z+(j%2)*.05);reed.rotation.z=(j-1.5)*.12;}if(i%5===0)ball(.16,.09,.12,mat('#aaa58c'),pond,x,.08,z);}
 for(const [x,z]of [[9.1,12.6],[14.8,13.3],[14.7,17.6]]){box(.15,1.15,.15,wood,world,x,.45,z);ball(.65,.95,.65,mat('#8da375'),world,x,1.35,z);ball(.5,.6,.5,mat('#a8b88b'),world,x+.28,1.6,z);}
 // A short timber fishing platform on the near bank.
 for(let i=0;i<6;i++)box(.19,.08,.85,wood,world,8.22+i*.20,.025,15.3);for(const z of [14.96,15.64])box(.09,.35,.09,wood,world,9.20,-.09,z);
 const fishes=[];for(let i=0;i<4;i++){const f=new T.Group();pond.add(f);const fm=new T.MeshBasicMaterial({color:'#415f53',transparent:true,opacity:.26});ball(.14,.013,.045,fm,f);const tail=mesh(new T.ConeGeometry(.04,.07,3),fm,f,-.15,0,0);tail.rotation.z=Math.PI/2;fishes.push(f);}
 const float=ball(.03,.045,.03,mat('#d9a275'),pond,-2.3,.025,0);float.visible=false;
 const ripples=[];for(let i=0;i<3;i++){const r=mesh(new T.RingGeometry(.06,.067,40),new T.MeshBasicMaterial({color:'#d4e3cd',transparent:true,opacity:.24,side:T.DoubleSide,depthWrite:false}),pond,-2.3,-.009+i*.001,0);r.rotation.x=-Math.PI/2;r.visible=false;ripples.push(r);}
 const rod=new T.Group();world.add(rod);const pole=mesh(new T.CylinderGeometry(.013,.023,1.25,12),wood,rod,0,.60,0);pole.rotation.z=-.4;pole.position.z=.05;const lineGeo=new T.BufferGeometry().setFromPoints([new T.Vector3(),new T.Vector3()]),line=new T.Line(lineGeo,new T.LineBasicMaterial({color:'#ded8be'}));world.add(line);rod.visible=line.visible=false;
 const spoon=new T.Group();world.add(spoon);box(.025,.21,.025,wood,spoon,0,.05,0);ball(.045,.016,.06,cream,spoon,0,-.075,0);spoon.visible=false;
 const emotionFX=new T.Group();emotionFX.name='EmotionEffects';d.scene.add(emotionFX);d.bones.Head.attach(emotionFX);
 // Add in the model's neutral coordinates, then attach to the head bone.
 function headObject(o){d.root.updateWorldMatrix(true,true);o.position.copy(d.root.localToWorld(o.position.clone()));d.scene.add(o);d.bones.Head.attach(o);return o;}
 const tears=[-.134,.2].map(x=>headObject(ball(.014,.027,.014,new T.MeshBasicMaterial({color:'#8ed7ed'}),d.scene,x,1,.337)));
 const brows=[-.134,.2].map((x,i)=>{const o=box(.12,.022,.016,mat('#77513b'),d.scene,x,1.14,.327);o.rotation.z=i?-.32:.32;return headObject(o);});
 const hearts=[];for(const x of [-.30,.35]){const shape=new T.Shape();shape.moveTo(0,-.04);shape.bezierCurveTo(-.09,.01,-.03,.08,0,.035);shape.bezierCurveTo(.03,.08,.09,.01,0,-.04);const o=mesh(new T.ShapeGeometry(shape),new T.MeshBasicMaterial({color:'#e98eaf',side:T.DoubleSide}),d.scene,x,1.25,.35);headObject(o);hearts.push(o);}
 for(const o of [...tears,...brows,...hearts])o.visible=false;const tearRest=tears.map(o=>o.position.clone());
 const carried=new T.Group();carried.name='CarriedMeal';world.add(carried);carried.visible=false;
 mesh(new T.CylinderGeometry(.23,.2,.035,24),cream,carried);
 const carriedFood=ball(.16,.05,.13,mat('#e4b674'),carried,0,.045,0);
 const standBones=new Map(),sitBones=new Map(),footOrientation={};
 d.samplePose('Idle',.2);for(const b of Object.values(d.bones))standBones.set(b,{p:b.position.clone(),q:b.quaternion.clone()});
 d.model.updateWorldMatrix(true,true);for(const side of ['L','R'])footOrientation[side]=actor.getWorldQuaternion(new T.Quaternion()).invert().multiply(d.bones['Foot_'+side].getWorldQuaternion(new T.Quaternion()));
 d.samplePose('Sit_Test',.65);for(const b of Object.values(d.bones))sitBones.set(b,{p:b.position.clone(),q:b.quaternion.clone()});
 d.play('Idle');
 const caught=new T.Group();caught.name='CaughtFish';world.add(caught);caught.visible=false;
 const fishMaterial=mat('#abc7b4');
 ball(.22,.10,.065,fishMaterial,caught);
 const caughtTail=mesh(new T.ConeGeometry(.10,.16,3),fishMaterial,caught,-.27,0,0);caughtTail.rotation.z=Math.PI/2;caughtTail.scale.z=.5;
 const fin=mesh(new T.ConeGeometry(.065,.10,3),fishMaterial,caught,0,.1,0);fin.scale.z=.3;
 for(const z of [-.06,.06])ball(.02,.02,.01,mat('#373d38'),caught,.14,.025,z);
 const rack=box(.50,.045,.34,wood,house.fixtureGroups.sink,-.36,.865,.15);rack.name='DishRack';
 const cleanPlate=mesh(new T.CylinderGeometry(.20,.18,.028,24),cream,house.fixtureGroups.sink,-.36,.90,.15);cleanPlate.name='CleanPlate';cleanPlate.visible=false;
 const tote=new T.Group();tote.name='MealCarryBag';world.add(tote);tote.visible=false;
 for(const x of [-.27,.27])box(.025,.35,.24,wood,tote,x,-.15,0);
 for(const z of [-.12,.12])box(.56,.35,.025,wood,tote,0,-.15,z);
 box(.56,.025,.24,wood,tote,0,-.325,0);
 let lastTask=null,leaveFrom=null;
 let active=null,elapsed=0,nextGesture=0,gestureStart=-10;
 const exit=propExit([carried,caught,rod,spoon],actor);
 function reset(){exit.reset();leaveFrom=null;tote.visible=false;active=null;carried.visible=false;caught.visible=false;rod.visible=line.visible=spoon.visible=plate.visible=food.visible=garnish.visible=float.visible=false;ripples.forEach(o=>o.visible=false);d.setCookie(false);}
 function reach(side,target){const a=d.bones['Arm_'+side],b=d.bones['Forearm_'+side],h=d.bones['Hand_'+side];d.model.updateWorldMatrix(true,true);const origin=a.getWorldPosition(new T.Vector3()),elbow=b.getWorldPosition(new T.Vector3()),wrist=h.getWorldPosition(new T.Vector3()),l1=origin.distanceTo(elbow),l2=elbow.distanceTo(wrist),dir=target.clone().sub(origin),dist=Math.min(dir.length(),l1+l2-.005);dir.normalize();const end=origin.clone().addScaledVector(dir,dist),along=(l1*l1-l2*l2+dist*dist)/(2*dist),bend=new T.Vector3(side==='R'?-1:1,0,0).applyQuaternion(actor.quaternion);bend.addScaledVector(dir,-bend.dot(dir)).normalize();const mid=origin.clone().addScaledVector(dir,along).addScaledVector(bend,Math.sqrt(Math.max(0,l1*l1-along*along)));for(const [bone,child,p]of [[a,b,mid],[b,h,end]]){d.model.updateWorldMatrix(true,true);const origin=bone.getWorldPosition(new T.Vector3()),from=child.getWorldPosition(new T.Vector3()).sub(origin).normalize(),to=p.clone().sub(origin).normalize();const q=new T.Quaternion().setFromUnitVectors(from,to).multiply(bone.getWorldQuaternion(new T.Quaternion()));bone.quaternion.copy(bone.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(q));}}
 function update(s,task,dt){lastTask=task;if(active&&active!==task)reset();elapsed+=dt;const mood=feeling(s),express=mood;
 tears.forEach((o,i)=>{o.visible=express?.id==='crying';o.position.copy(tearRest[i]);o.position.y-=((elapsed*1.4+i*.5)%1)*.13;});brows.forEach(o=>o.visible=['angry','furious'].includes(express?.id));hearts.forEach((o,i)=>{o.visible=['love','fascinated','greed'].includes(express?.id);o.scale.setScalar(.85+Math.sin(elapsed*2+i)*.15);});
 if(express)d.setExpression(express.face);
 fishes.forEach((o,i)=>{const a=elapsed*.18+i*1.6;o.position.set(Math.cos(a)*(1+i*.35),-.025,Math.sin(a)*(.5+i*.19));o.rotation.y=-a-Math.PI/2;});
 carried.visible=!!task?.carry&&(task.phase==='walking'||task.id==='sink'&&task.phase==='doing');
 if(carried.visible){const washing=task.id==='sink'&&task.phase==='doing',height=washing?.80:.67;carriedFood.visible=task.carry==='meal';carried.position.copy(actor.localToWorld(new T.Vector3(0,height,.30)));carried.quaternion.copy(actor.quaternion);reach('R',actor.localToWorld(new T.Vector3(washing?Math.sin(elapsed*8)*.07:-.18,height+.02,.30)));reach('L',actor.localToWorld(new T.Vector3(.18,height,.30)));if(washing){const a=T.MathUtils.smoothstep(task.duration-task.remaining,task.duration-1.3,task.duration-.3);carried.position.lerp(cleanPlate.getWorldPosition(new T.Vector3()),a);for(const side of ['L','R'])reach(side,carried.position.clone().add(new T.Vector3(side==='L'?.16:-.16,0,0).applyQuaternion(actor.quaternion)));cleanPlate.visible=a===1;carried.visible=a<1;}}
 // Pick up the prepared dish before leaving the counter, keeping the same prop during the walk.
 if(task?.phase==='doing'&&['counter','fridge'].includes(task.id)&&task.meal){
  const t=task.duration-task.remaining,isFridge=task.id==='fridge',pickup=isFridge?2.35:task.duration-2.4;
  if(t>=pickup){
   carried.visible=true;carriedFood.visible=true;carriedFood.material.color.set(MEALS.find(m=>m.id===task.meal)?.color??'#e4b674');
   const group=house.fixtureGroups[task.id],from=group.localToWorld(isFridge?new T.Vector3(-.18,.91,.23):new T.Vector3(-.08,.97,.40));
   const to=actor.localToWorld(new T.Vector3(isFridge?.18:0,.67,.30)),a=T.MathUtils.smoothstep(t,pickup,pickup+.75);
   carried.position.lerpVectors(from,to,a);carried.quaternion.copy(actor.quaternion);
   for(const side of isFridge?['L']:['L','R'])reach(side,carried.position.clone().add(new T.Vector3(side==='L'?.16:-.16,0,0).applyQuaternion(actor.quaternion)));
  }
 }
 if(!task&&express){d.samplePose('Idle',.2);if(elapsed>nextGesture){gestureStart=elapsed;nextGesture=elapsed+6+Math.random()*9;}const a=elapsed-gestureStart,h=d.bones.Head;if(['sad','regret','crying'].includes(mood.id)){h.rotation.x+=.18;for(const side of ['L','R'])d.bones['Arm_'+side].rotation.z+=(side==='L'?1:-1)*.1;}if(['angry','furious'].includes(mood.id)){h.rotation.y+=Math.sin(elapsed*6)*.035;for(const side of ['L','R'])d.bones['Ear_'+side].rotation.z+=(side==='L'?1:-1)*.14;}if(mood.id==='love')h.rotation.z+=.12;if(mood.id==='happy'&&a<.7&&s.daily.emotion)d.root.position.y=Math.sin(a/.7*Math.PI)*.07;if(s.food<35)h.rotation.y+=.25;}
 if(!task||task.phase!=='doing'||!['dining','fishing','catch-celebrate','emotion'].includes(task.id)){if(active)reset();plate.visible=(s.daily.dirtyDishes??0)>0&&!(task?.carry==='plate');food.visible=false;garnish.visible=false;return;}
 if(active!==task){reset();active=task;}const t=task.duration-task.remaining;
 if(task.id==='emotion'){const h=d.bones.Head;if(['sad','regret','crying'].includes(mood.id))h.rotation.x+=.18+Math.sin(t*3)*.025;if(['angry','furious'].includes(mood.id)){h.rotation.y+=Math.sin(t*(mood.id==='furious'?13:4))*.07;for(const side of ['L','R'])d.bones['Arm_'+side].rotation.z+=(side==='L'?1:-1)*.22;}if(mood.id==='fascinated'||mood.id==='greed')h.rotation.z+=Math.sin(t)*.12;return;}
 if(task.id==='dining'){
 const seating=T.MathUtils.smoothstep(t,1,1.8)*(1-T.MathUtils.smoothstep(t,task.duration-1.6,task.duration-.8));for(const [b,v]of sitBones){const rest=standBones.get(b);b.position.lerpVectors(rest.p,v.p,seating);b.quaternion.slerpQuaternions(rest.q,v.q,seating);}d.model.traverse(o=>{if(o.name.startsWith('Eye')&&o.morphTargetDictionary?.Blink!==undefined)o.morphTargetInfluences[o.morphTargetDictionary.Blink]=Math.sin(t*1.3)>.994?1:0;});actor.position.set(DINING.x,.32*seating,DINING.z+.17*T.MathUtils.smoothstep(t,0,.5)*(1-T.MathUtils.smoothstep(t,task.duration-.5,task.duration)));actor.rotation.set(0,0,0);d.model.updateWorldMatrix(true,true);for(const side of ['L','R']){const p=d.bones['Foot_'+side].getWorldPosition(new T.Vector3()),target=dining.localToWorld(new T.Vector3(side==='L'?.143:-.143,.42,-.50));plantFoot(d,actor,side,p.lerp(target,seating),footOrientation[side]);}const placing=t<1,picking=t>task.duration-1;plate.visible=food.visible=!placing&&!picking;spoon.visible=!placing&&!picking;const dish=MEALS.find(m=>m.id===task.meal);garnish.visible=plate.visible;fishTail.visible=!!dish?.fish;food.material.color.set(dish?.fish?'#d9b37a':dish?.color??'#e4b674');food.scale.set(.17*Math.max(.3,task.remaining/task.duration),.055,.15);if(placing||picking){
  carried.visible=true;carriedFood.visible=placing;
  const table=plate.getWorldPosition(new T.Vector3()),hand=actor.localToWorld(new T.Vector3(0,.67,.30));
  const a=placing?T.MathUtils.smoothstep(t,0,1):1-T.MathUtils.smoothstep(t,task.duration-1,task.duration);
  carried.position.lerpVectors(hand,table,a);carried.quaternion.copy(actor.quaternion);
  for(const side of ['L','R'])reach(side,carried.position.clone().add(new T.Vector3(side==='L'?.16:-.16,0,0)));
  task.detail=placing?'ค่อย ๆ วางจานบนโต๊ะ':'ลุกขึ้นแล้วหยิบจานไปล้าง';return;
 }
 const bite=.5+.5*Math.sin(t*2.8);const p=actor.localToWorld(new T.Vector3(-.12,.62+bite*.24,.46-bite*.15));reach('R',p);d.model.updateMatrixWorld(true);spoon.position.copy(d.bones.Hand_R.getWorldPosition(new T.Vector3()));spoon.quaternion.copy(actor.quaternion);d.setExpression(bite>.65?'Talk':'Happy');task.detail='นั่งตักอาหารทีละคำที่โต๊ะ';return;}
 if(task.id==='catch-celebrate'){
 d.samplePose('Idle',.2);caught.visible=true;fishMaterial.color.set(task.fish.color);
 const lift=T.MathUtils.smoothstep(t,0,1),stow=T.MathUtils.smoothstep(t,4.2,5.5);
 const p=actor.localToWorld(new T.Vector3(0,.48+.36*lift-.5*stow,.47));
 caught.position.copy(p);caught.quaternion.copy(actor.quaternion);caught.rotateZ(Math.sin(t*13)*.08*(1-stow));caught.scale.setScalar(1-.9*stow);
 reach('R',actor.localToWorld(new T.Vector3(-.17,.48+.36*lift-.5*stow,.47)));
 reach('L',actor.localToWorld(new T.Vector3(.17,.48+.36*lift-.5*stow,.47)));
 d.bones.Head.rotation.z+=Math.sin(t*4)*.07*(1-stow);d.setExpression(stow>.5?'Happy':'Laugh');
 task.detail=t<1?'ยกปลาขึ้นมาดู':stow>0?'เก็บปลาเข้ากระเป๋า':'ดีใจจัง! ตกได้'+task.fish.name;return;
 }
 if(task.id==='fishing'){
 d.samplePose('Idle',.2);
 rod.visible=line.visible=float.visible=true;const target=actor.localToWorld(new T.Vector3(-.12,.68,.34));reach('R',target);d.model.updateMatrixWorld(true);rod.position.copy(d.bones.Hand_R.getWorldPosition(new T.Vector3()));rod.quaternion.copy(actor.quaternion);rod.rotation.x+=.45+Math.sin(t)*.035;rod.updateMatrixWorld(true);const tip=rod.localToWorld(new T.Vector3(.47,1.16,.05)),end=float.getWorldPosition(new T.Vector3());line.geometry.attributes.position.setXYZ(0,...tip);line.geometry.attributes.position.setXYZ(1,...end);line.geometry.attributes.position.needsUpdate=true;line.geometry.computeBoundingSphere();float.position.y=.025+Math.sin(t*(t>task.duration-3?15:2))*.025;ripples.forEach((o,i)=>{o.visible=true;o.scale.setScalar(1+((t+i*.7)%2)*2);});task.detail=t<2?'เหวี่ยงเบ็ดลงน้ำ':task.remaining<3?'ทุ่นขยับแล้ว… ค่อย ๆ ดึงเบ็ด':'ถือคันเบ็ด รอปลามากินเหยื่อ';}
 }
 return {targets,update,reset,leave:(a,finished=false)=>{
  line.visible=false;
  if(carried.visible||leaveFrom){
   if(!leaveFrom)leaveFrom=carried.position.clone();
   const continuing=finished&&['counter','fridge','dining'].includes(lastTask?.id);
   const target=actor.localToWorld(new T.Vector3(0,continuing?.67:.40,.30));
   carried.position.lerpVectors(leaveFrom,target,a);carried.quaternion.copy(actor.quaternion);
   if(!continuing){tote.visible=true;tote.position.copy(actor.localToWorld(new T.Vector3(0,.50,.30)));tote.quaternion.copy(actor.quaternion);carried.visible=a<.95;}
   for(const side of ['L','R']){const hand=d.bones['Hand_'+side].getWorldPosition(new T.Vector3()),grip=carried.position.clone().add(new T.Vector3(side==='L'?.16:-.16,0,0).applyQuaternion(actor.quaternion));reach(side,hand.lerp(grip,continuing?1:1-T.MathUtils.smoothstep(a,.8,1)));}
  }else exit.leave(a);
 }};
}
