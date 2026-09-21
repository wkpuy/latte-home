import {propExit,reachHand,plantFoot} from './character-contact.js?v=contact21';
import {BASE_FIXTURES,fixtureAngle,FIXTURES} from './house-layout.js?v=contact21';
import * as T from 'three';

// Furniture interactions own a sampled pose, props and contact points. The
// approach position stays in the navigation state; only the visible actor moves.
export function createActivityMotion(d,house,actor){
 const groups=house.fixtureGroups,props=new T.Group();house.world.add(props);
 const mat=color=>new T.MeshStandardMaterial({color,roughness:.8});
 const cream=mat('#faf4e4'),wood=mat('#b59877'),metal=mat('#a6aaa2'),green=mat('#8fa779'),pink=mat('#c3a1a8');
 function mesh(geo,m,parent,pos){const o=new T.Mesh(geo,m);o.position.set(...pos);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 const box=(w,h,z,m,p,x=0,y=0,zz=0)=>mesh(new T.BoxGeometry(w,h,z),m,p,[x,y,zz]);
 const ell=(w,h,z,m,p,x=0,y=0,zz=0)=>{const o=mesh(new T.SphereGeometry(1,24,16),m,p,[x,y,zz]);o.scale.set(w/2,h/2,z/2);return o;};
 const cylinder=(r,h,m,p,x,y,z)=>mesh(new T.CylinderGeometry(r,r,h,24),m,p,[x,y,z]);
 // A real cavity and a hinged door replace the solid refrigerator block.
 const fridge=groups.fridge;fridge.children.forEach(o=>o.visible=false);
 box(.95,.1,.9,cream,fridge,0,.06,0);box(.95,.1,.9,cream,fridge,0,1.53,0);box(.08,1.5,.9,cream,fridge,-.435,.78,0);box(.08,1.5,.9,cream,fridge,.435,.78,0);box(.85,1.5,.06,cream,fridge,0,.78,-.42);
 for(const y of [.4,.8,1.16])box(.81,.035,.75,cream,fridge,0,y,.02);
 const foodTray=new T.Group();fridge.add(foodTray);ell(.3,.07,.23,wood,foodTray,-.18,.88,.15);box(.15,.24,.15,green,fridge,.2,1.3,.13);box(.16,.2,.16,pink,fridge,-.22,.53,.1);
 const door=new T.Group();door.position.set(.475,0,.49);fridge.add(door);box(.95,1.5,.07,cream,door,-.475,.78,0);const handle=box(.04,.38,.07,wood,door,-.82,.87,.08);handle.name='FridgeHandle';const gripPoint=new T.Object3D();gripPoint.name='FridgeGrip';gripPoint.position.y=-.07;handle.add(gripPoint);door.name='FridgeDoor';box(.83,.018,.01,wood,door,-.475,1.14,.045);
 const toilet=groups.toilet;toilet.clear();ell(.44,.42,.5,cream,toilet,0,.22,.08);ell(.7,.25,.85,cream,toilet,0,.46,.05);ell(.48,.04,.57,mat('#afd1ce'),toilet,0,.58,.06);const seat=mesh(new T.TorusGeometry(.245,.055,12,40),cream,toilet,[0,.6,.06]);seat.rotation.x=Math.PI/2;seat.scale.y=1.25;box(.65,.6,.22,cream,toilet,0,.63,-.34);box(.13,.04,.08,metal,toilet,.2,.96,-.34);
 const lid=new T.Group();lid.position.set(0,.61,-.23);toilet.add(lid);ell(.64,.07,.76,cream,lid,0,0,.3);lid.rotation.x=-1.5;
 // Soft quilt is a raised surface over the torso; face remains above the fold.
 const blanketGeo=new T.PlaneGeometry(1.56,.95,24,20);const points=blanketGeo.attributes.position;
 const quiltHeight=(x,z)=>.66+.5*Math.exp(-x*x*5)+.009*Math.cos(x*25+z*12);
 for(let i=0;i<points.count;i++){const x=points.getX(i),z=points.getY(i);points.setXYZ(i,x,quiltHeight(x,z),z);}
 blanketGeo.computeVertexNormals();const blanket=mesh(blanketGeo,new T.MeshStandardMaterial({color:'#bda0ab',roughness:1,side:T.DoubleSide}),groups.bed,[0,0,.61]);blanket.visible=false;blanket.userData.decorKey='bed';
 const foldGeo=new T.PlaneGeometry(1.56,.12,24,2),fp=foldGeo.attributes.position;for(let i=0;i<fp.count;i++){const x=fp.getX(i),z=fp.getY(i);fp.setXYZ(i,x,quiltHeight(x,z)+.014,z);}foldGeo.computeVertexNormals();const fold=mesh(foldGeo,new T.MeshStandardMaterial({color:'#e1c5cd',roughness:1,side:T.DoubleSide}),groups.bed,[0,0,.19]);fold.visible=false;fold.userData.decorKey='bed';
 const shower=groups.shower;shower.children[2].scale.y=1.3;shower.children[2].position.y+=.16;shower.children[3].position.y+=.37;shower.children[4].position.y+=.37;
 // Visible preparation and cooking equipment.
 const counter=groups.counter;counter.children.slice(-2).forEach(o=>o.visible=false);
 box(.5,.045,.65,wood,counter,-.66,.93,0);const carrot=ell(.25,.1,.1,mat('#e9a15a'),counter,-.67,1.0,-.09);
 const hob=cylinder(.24,.035,metal,counter,.3,.93,.27),pot=cylinder(.21,.2,mat('#987d66'),counter,.3,1.04,.27);ell(.37,.035,.37,mat('#d6ac70'),counter,.3,1.15,.27);box(.2,.045,.06,wood,counter,.59,1.07,.27);
 const step=box(1.7,.16,.38,wood,props,3.32,.08,2.64);step.visible=false;
 const ovenWindow=box(.74,.48,.025,new T.MeshStandardMaterial({color:'#41392d',emissive:'#e78b35',emissiveIntensity:0}),counter,.3,.4,.455);
 const ovenDoor=new T.Group();ovenDoor.position.set(.3,.16,.49);counter.add(ovenDoor);box(.79,.48,.04,metal,ovenDoor,0,.24,0);box(.63,.33,.045,new T.MeshStandardMaterial({color:'#4c4639',transparent:true,opacity:.75}),ovenDoor,0,.24,.025);box(.58,.045,.08,wood,ovenDoor,0,.42,.07);
 for(const x of [.06,.29,.53])cylinder(.035,.035,wood,counter,x,.7,.47).rotation.x=Math.PI/2;
 const bakingTray=new T.Group();counter.add(bakingTray);box(.49,.035,.38,metal,bakingTray);for(const x of [-.13,.13])ell(.19,.11,.18,mat('#ddbd88'),bakingTray,x,.07,0);bakingTray.visible=false;
 const knife=new T.Group();props.add(knife);box(.03,.18,.08,metal,knife,0,.08,0);box(.045,.13,.055,wood,knife,0,-.05,0);knife.visible=false;
 const spoon=new T.Group();props.add(spoon);box(.03,.3,.03,wood,spoon);ell(.09,.035,.13,wood,spoon,0,-.17,0);spoon.visible=false;
 const can=new T.Group();props.add(can);cylinder(.13,.2,green,can,0,0,0);const spout=box(.08,.08,.3,green,can,0,.02,.18);spout.rotation.x=-.4;can.visible=false;
 const trowel=new T.Group();props.add(trowel);box(.06,.22,.05,wood,trowel);ell(.13,.24,.035,metal,trowel,0,-.19,0);trowel.visible=false;
 const produce=ell(.2,.22,.17,mat('#e7a45a'),props);produce.visible=false;
 const waterMaterial=new T.MeshBasicMaterial({color:'#a6e2e9',transparent:true,opacity:.62,depthWrite:false});
 const streams=new T.Group();house.world.add(streams);for(let i=0;i<14;i++){const drop=box(.015,.16,.015,waterMaterial,streams);drop.castShadow=false;}
 const faucet=box(.025,.27,.025,waterMaterial,groups.sink,0,.97,-.04);faucet.visible=false;
 const steam=new T.Group();counter.add(steam);for(let i=0;i<6;i++){const b=ell(.08,.12,.08,new T.MeshBasicMaterial({color:'#fff9e7',transparent:true,opacity:.5,depthWrite:false}),steam);b.castShadow=false;}steam.visible=false;
 const foam=new T.Group();house.world.add(foam);for(let i=0;i<14;i++)ell(.12,.12,.12,cream,foam);foam.visible=false;
 const footOrientation={};d.samplePose('Idle',.2);d.model.updateWorldMatrix(true,true);for(const side of ['L','R'])footOrientation[side]=actor.getWorldQuaternion(new T.Quaternion()).invert().multiply(d.bones['Foot_'+side].getWorldQuaternion(new T.Quaternion()));d.play('Idle');
 for(const [id,height]of [['sofa',.4],['toilet',.39]]){const support=box(.72,height,.44,wood,groups[id],0,height/2,.43);support.name=id+'Footrest';ell(.76,.08,.48,id==='sofa'?green:cream,groups[id],0,height-.02,.43);}
 let leaveDoor=null;let startYaw=0,active=null,start=new T.Vector3(),baseBones=new Map(),standingBones=new Map(),baseVisible=[];
 const smooth=t=>T.MathUtils.smoothstep(t,0,1),lerp=T.MathUtils.lerp;
 function sample(name,time){d.samplePose(name,time);baseBones=new Map(Object.values(d.bones).map(b=>[b,{p:b.position.clone(),q:b.quaternion.clone()}]));}
 function enter(task){active=task;start.copy(actor.position);startYaw=actor.rotation.y;baseVisible=[];d.model.traverse(o=>{if(o.name.startsWith('Outfit_'))baseVisible.push([o,o.visible]);});sample('Idle',.2);standingBones=baseBones;const seated=['sofa','toilet','plant','water','harvest'].includes(task.id);if(seated)sample('Sit_Test',.65);}
 const exit=propExit([knife,spoon,can,trowel,produce],actor);
 function reset(){leaveDoor=null;exit.reset();undoProps();active=null;const forward=new T.Vector3(0,0,1).applyQuaternion(actor.quaternion);actor.rotation.set(0,Math.atan2(forward.x,forward.z),0);d.root.rotation.set(0,0,0);for(const [o,v] of baseVisible)o.visible=v;baseVisible=[];door.rotation.y=0;foodTray.visible=true;lid.rotation.x=-1.5;step.visible=blanket.visible=fold.visible=streams.visible=foam.visible=faucet.visible=steam.visible=knife.visible=spoon.visible=can.visible=trowel.visible=produce.visible=false;groups.bed.children[2].visible=true;d.setCookie(false);}
 function aim(bone,child,target){d.model.updateWorldMatrix(true,true);const origin=bone.getWorldPosition(new T.Vector3()),from=child.getWorldPosition(new T.Vector3()).sub(origin).normalize(),to=target.clone().sub(origin).normalize();const q=new T.Quaternion().setFromUnitVectors(from,to).multiply(bone.getWorldQuaternion(new T.Quaternion()));bone.quaternion.copy(bone.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(q));}
 function reach(side,target){const a=d.bones['Arm_'+side],b=d.bones['Forearm_'+side],h=d.bones['Hand_'+side];d.model.updateWorldMatrix(true,true);const origin=a.getWorldPosition(new T.Vector3()),elbow=b.getWorldPosition(new T.Vector3()),wrist=h.getWorldPosition(new T.Vector3()),l1=origin.distanceTo(elbow),l2=elbow.distanceTo(wrist),dir=target.clone().sub(origin),dist=Math.min(dir.length(),l1+l2-.005);dir.normalize();const end=origin.clone().addScaledVector(dir,dist),along=(l1*l1-l2*l2+dist*dist)/(2*dist),bend=new T.Vector3(side==='R'?-1:1,0,0).applyQuaternion(actor.quaternion);bend.addScaledVector(dir,-bend.dot(dir)).normalize();aim(a,b,origin.clone().addScaledVector(dir,along).addScaledVector(bend,Math.sqrt(Math.max(0,l1*l1-along*along))));aim(b,h,end);return h.getWorldPosition(new T.Vector3());}
 const local=(x,y,z)=>actor.localToWorld(new T.Vector3(x,y,z));
 const shiftFor=id=>{const f=FIXTURES.find(x=>x.id===id),b=BASE_FIXTURES.find(x=>x.id===id);return f&&b?{x:f.x-b.x,z:f.z-b.z}:{x:0,z:0};};
 const world=(p,shift)=>new T.Vector3(p.x+shift.x,p.y,p.z+shift.z);
 function held(o,side,offset=new T.Vector3()){d.model.updateWorldMatrix(true,true);o.visible=true;o.position.copy(d.bones['Hand_'+side].getWorldPosition(new T.Vector3())).add(offset);o.quaternion.copy(actor.quaternion);}
 function updatePose(task){
  if(!task||task.phase!=='doing'||!['bed','sofa','toilet','shower','sink','fridge','counter','plant','water','harvest','stretch','lookaround'].includes(task.id)){if(active)reset();ovenDoor.rotation.x=0;ovenWindow.material.emissiveIntensity=0;bakingTray.visible=false;return;}if(active!==task)enter(task);
  const t=task.duration-task.remaining,inT=smooth(t/.9),outT=smooth((t-(task.duration-1))/.9),hold=inT*(1-outT);task.detail='';
  for(const [b,v] of baseBones){const rest=standingBones.get(b);b.position.lerpVectors(rest.p,v.p,hold);b.quaternion.slerpQuaternions(rest.q,v.q,hold);}
  const id=task.id,shift=shiftFor(id);
  if(id==='stretch'){for(const side of ['L','R']){const b=d.bones['Arm_'+side];if(b)b.rotation.z+=(side==='L'?1:-1)*.85*hold;}if(d.bones.Head)d.bones.Head.rotation.x-=.12*hold;task.detail='ยืดแขน สูดหายใจ แล้วผ่อนคลาย';return;}
  if(id==='lookaround'){if(d.bones.Head)d.bones.Head.rotation.y+=Math.sin(t*.8)*.35*hold;task.detail='มองซ้ายขวาอย่างสนใจ';return;}

  let dest=start.clone(),yaw=actor.rotation.y;
  if(id==='bed'){dest.set(-3.75,.82,-1.85);yaw=0;d.root.rotation.x=-Math.PI/2*hold;blanket.visible=fold.visible=t>.7&&outT<.2;groups.bed.children[2].visible=!blanket.visible;task.detail=outT>0?'ลุกจากเตียง':inT<1?'เอนตัวบนหมอน':'นอนหงายใต้ผ้าห่ม';}
  if(id==='sofa'){dest.set(-3.7,.49,.36);yaw=0;task.detail=outT>0?'ลุกจากโซฟา':'นั่งพักบนเบาะ';}
  if(id==='toilet'){dest.set(1,.48,-1.2);yaw=0;task.detail=t<7?'เข้าห้องน้ำ':'กดชักโครก';lid.rotation.x=-1.5;}
  if(id==='shower'){dest.set(4,.1,-2.83);yaw=0;task.detail=t<1?'เข้าฝักบัว':t>task.duration-2?'ล้างฟองออก':'สระผมและถูตัว';baseVisible.forEach(([o,v])=>o.visible=hold>.8?false:v);}
  if(id==='sink'){dest.set(1.35,0,-2.93);yaw=Math.PI;task.detail='เปิดน้ำ ล้างมือและล้างหน้า';}
  if(id==='fridge'){dest.set(3.87,0,1.13);yaw=Math.PI;task.detail=t<2?'เปิดตู้เย็น':t<3.8?'หยิบขนมจากชั้น':'ปิดตู้เย็น แล้วกินขนม';}
  if(id==='counter'){step.position.set(3.32+shift.x,.08,2.64+shift.z);step.visible=true;dest.set(task.pickupOnly?3.72:lerp(2.82,3.72,smooth((t-3.5)/.8)),.16,2.64);yaw=Math.PI;task.detail=t<4?'หั่นส่วนผสม':t<task.duration-2?'คนอาหารบนเตา':'ตักอาหารชิม';}
  dest.x+=shift.x;dest.z+=shift.z;actor.position.lerpVectors(start,dest,hold);actor.rotation.set(0,startYaw+Math.atan2(Math.sin(yaw-startYaw),Math.cos(yaw-startYaw))*hold,0);
  if(id==='bed'){d.model.traverse(o=>{if(o.name.startsWith('Eye')&&o.morphTargetDictionary){o.morphTargetInfluences.fill(0);o.morphTargetInfluences[o.morphTargetDictionary.Blink]=hold;}});return;}
  streams.visible=id==='shower'&&hold>.9;foam.visible=id==='shower'&&hold>.9&&t<task.duration-2;faucet.visible=id==='sink'&&hold>.8;steam.visible=id==='counter'&&t>3.5&&outT<.3;
  if(streams.visible){streams.children.forEach((o,i)=>o.position.set(4+shift.x+Math.sin(i*7)*.24,1.95-((t*1.9+i*.13)%1.82),-2.9+shift.z+Math.cos(i*7)*.24));}
  if(foam.visible){foam.children.forEach((o,i)=>o.position.set(4+shift.x+Math.sin(i*2.4+t)*.3,.45+(i%4)*.19,-2.83+shift.z+Math.cos(i*2.4+t)*.22));}
  steam.children.forEach((o,i)=>o.position.set(.3+Math.sin(t+i)*.1,1.2+((t*.25+i*.08)%.55),.27+Math.cos(i)*.1));
  if(id==='shower'){reach('R',local(-.23,.85+Math.sin(t*5)*.13,.29));reach('L',local(.2,.75+Math.cos(t*5)*.12,.31));}
  if(id==='sink'){reach('R',local(-.15,t%3>1.8?.92:.69,.35));reach('L',local(.12,t%3>1.8?.92:.69,.33));}
  if(id==='toilet'&&t>7){reach('L',world(new T.Vector3(1.2,.96,-1.57),shift));streams.visible=true;streams.children.forEach((o,i)=>{o.position.set(1+shift.x+Math.sin(t*8+i)*.16,.59,-1.24+shift.z+Math.cos(t*8+i)*.2);});}
  if(id==='fridge'){
   door.rotation.y=1.7*smooth(t/1.3)*(1-smooth((t-3.2)/1));foodTray.visible=t<3.2;
   if(t<3.8)reach('R',world(new T.Vector3(4.03,.92,.73),shift));else{reach('R',local(-.12,.86+Math.sin(t*7)*.035,.27));d.setCookie(!task.meal);d.setExpression(task.meal?'Happy':'Talk');}if(outT>.5)d.setCookie(false);
  }
  if(id==='counter'){
   if(task.pickupOnly){task.detail='หยิบอาหารที่เตรียมไว้';return;}
   if(t<4){reach('R',world(new T.Vector3(3.14,1.04+Math.sin(t*9)*.06,2.12),shift));reach('L',world(new T.Vector3(3.12,.99,2.06),shift));held(knife,'R');knife.rotation.x=Math.PI*.25;carrot.scale.y=.05;}
   else if(!task.recipe||t<8){knife.visible=false;const target=world(new T.Vector3(4.1+Math.sin(t*5)*.06,1.17,2.26+Math.cos(t*5)*.06),shift);reach('R',target);held(spoon,'R');spoon.position.copy(target);spoon.rotation.x=-.3;if(t>task.duration-2&&!task.recipe&&!task.meal){reach('R',local(-.13,.86,.3));held(spoon,'R');d.setExpression('Talk');}}
  if(task.recipe){task.detail=t<4?'เตรียมส่วนผสม':t<8?'ผสมแป้งและขึ้นรูป':t<10?'นำถาดเข้าเตาอบ':t<16?'กำลังอบขนม':t<18?'นำขนมออกจากเตา':'พักขนมบนถาด';steam.visible=t>16;const transferIn=smooth((t-8)/2),transferOut=smooth((t-16)/2);ovenDoor.rotation.x=1.4*(smooth((t-7.8)/.4)*(1-smooth((t-9.6)/.4))+smooth((t-15.8)/.4)*(1-smooth((t-17.6)/.4)));ovenWindow.material.emissiveIntensity=t>10&&t<16?1.6:0;bakingTray.visible=t<10||t>16;bakingTray.position.set(.3,lerp(1.01,.43,transferIn*(1-transferOut)),lerp(.22,.64,transferIn*(1-transferOut)));if(t>=8){spoon.visible=false;knife.visible=false;if(t<10||t>16&&t<18){reach('R',world(new T.Vector3(4.1,.67,2.53),shift));reach('L',world(new T.Vector3(3.93,.67,2.5),shift));}}}
  }
  if(['plant','water','harvest'].includes(id)){const p=local(-.18,.24,.38);reach('R',p);reach('L',local(.17,.28,.35));task.detail=task.rice?({plant:'ปักดำต้นข้าว',water:'เติมน้ำเข้านา',harvest:'เกี่ยวรวงข้าวใส่กระเป๋า'}[id]):id==='plant'?'พรวนดินและวางเมล็ด':id==='water'?'เทน้ำลงโคนต้น':'เด็ดผลผลิตใส่กระเป๋า';if(id==='plant'){held(trowel,'R');trowel.rotation.x=Math.sin(t*7)*.4;}if(id==='water'){held(can,'R');can.rotation.x=.55;streams.visible=true;streams.children.forEach((o,i)=>o.position.copy(local(-.13,.3-((t+i*.1)% .3),.55)));}if(id==='harvest'){held(produce,'R');}}
 }
 let transformed=null;
 const movable=[...props.children,streams,foam];
 function transformObject(o,f,angle){const x=o.position.x-f.x,z=o.position.z-f.z,c=Math.cos(angle),s=Math.sin(angle);o.position.x=f.x+x*c+z*s;o.position.z=f.z-x*s+z*c;o.quaternion.premultiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),angle));}
 function undoProps(){if(transformed){for(const o of movable)transformObject(o,transformed.f,-transformed.angle);transformed=null;}}
 function update(task){undoProps();const f=FIXTURES.find(f=>f.id===task?.id),angle=f?fixtureAngle(f.id):0;
  if(f&&task.phase==='doing'&&angle){transformObject(actor,f,-angle);updatePose(task);transformObject(actor,f,angle);for(const o of movable)transformObject(o,f,angle);transformed={f,angle};}
  else updatePose(task);
 }
 function contacts(task,feetOnly=false){
  if(task?.phase!=='doing')return;
  const id=task.fixtureId??task.id,t=task.duration-task.remaining,f=groups[id];if(!f)return;
  const blend=smooth(t/.9)*(1-smooth((t-(task.duration-1))/.9));
  if(id==='sofa'||['toilet','shower'].includes(task.id)){
   for(const side of ['L','R']){
    const point=id==='shower'?new T.Vector3(side==='L'?.143:-.143,.20,.07):new T.Vector3(side==='L'?.143:-.143,id==='sofa'?.48:.47,.30);
    const current=d.bones['Foot_'+side].getWorldPosition(new T.Vector3()),target=current.lerp(f.localToWorld(point),blend);
    plantFoot(d,actor,side,target,footOrientation[side]);
   }
  }
  if(task.id==='fridge'&&!feetOnly){
   const open=smooth((t-1)/.9)*(1-smooth((t-3.15)/.85));door.rotation.y=.68*open;
   f.updateWorldMatrix(true,true);const grip=gripPoint.getWorldPosition(new T.Vector3());
   const destination=f.worldToLocal(grip.clone()).add(new T.Vector3(-.27,-.80,-.45));destination.y=0;
   const approach=smooth(t/.8),departure=smooth((t-4.1)/.9);
   const origin=new T.Vector3(task.anchor.x,0,task.anchor.z);
   actor.position.lerpVectors(origin,f.localToWorld(destination),approach*(1-departure));
   actor.rotation.set(0,fixtureAngle('fridge')+Math.PI/2,0);d.model.updateWorldMatrix(true,true);
   const weight=smooth((t-.65)/.35)*(1-smooth((t-4)/.25));
   const hand=d.bones.Hand_R.getWorldPosition(new T.Vector3());reachHand(d,actor,'R',hand.lerp(grip,weight));
   const pickup=f.localToWorld(new T.Vector3(-.18,.91,.23)),carry=actor.localToWorld(new T.Vector3(.18,.65,.30));
   const take=smooth((t-2.15)/.6);if(t>1.9)reachHand(d,actor,'L',pickup.lerp(carry,take));
   foodTray.visible=t<2.4;
   task.detail=t<1?'เอื้อมจับมือเปิดตู้เย็น':t<1.9?'จับมือเปิดและดึงประตู':t<2.8?'หยิบอาหารออกจากชั้น':t<4.1?'ถืออาหารแล้วปิดประตู':'ถืออาหารไปที่โต๊ะ';
  }
 }
 const poseUpdate=update;
 return {update(task){poseUpdate(task);contacts(task);},contacts,reset,leave(a){exit.leave(a);if(leaveDoor===null)leaveDoor=door.rotation.y;door.rotation.y=leaveDoor*(1-smooth(a/.55));if(active?.id==='fridge'&&a<.65){const p=d.bones.Hand_R.getWorldPosition(new T.Vector3()),grip=gripPoint.getWorldPosition(new T.Vector3());reachHand(d,actor,'R',p.lerp(grip,1-smooth((a-.45)/.20)));}},get active(){return active?.id??null;},props:{door,blanket,streams,foam,knife,spoon,lid}};
}
