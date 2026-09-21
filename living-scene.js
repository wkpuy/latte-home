import {propExit} from './character-contact.js?v=contact21';
import * as T from 'three';
import {FISH} from './daily-life-state.js?v=contact21';
export function createLivingScene(d,house,actor){
 const world=house.world,props=new T.Group();props.name='HobbyProps';world.add(props);
 const mat=c=>new T.MeshStandardMaterial({color:c,roughness:.85});
 function mesh(geo,m,p,x=0,y=0,z=0){const o=new T.Mesh(geo,m);o.position.set(x,y,z);p.add(o);o.castShadow=true;return o;}
 const box=(w,h,l,c,p,x=0,y=0,z=0)=>mesh(new T.BoxGeometry(w,h,l),mat(c),p,x,y,z);
 const ball=(r,c,p,x=0,y=0,z=0)=>mesh(new T.SphereGeometry(r,18,12),mat(c),p,x,y,z);
 const book=new T.Group();props.add(book);box(.40,.035,.25,'#899eae',book);box(.18,.04,.22,'#fff5dc',book,-.10,.025);box(.18,.04,.22,'#fff5dc',book,.10,.025);for(let i=0;i<4;i++){box(.12,.002,.005,'#c3b8a4',book,-.1,.047,-.07+i*.035);box(.12,.002,.005,'#c3b8a4',book,.1,.047,-.07+i*.035);}
 const brush=new T.Group();props.add(brush);box(.025,.25,.025,'#ba9571',brush);box(.03,.07,.03,'#809b8c',brush,0,.15);
 const canvas=new T.Group();props.add(canvas);box(.42,.025,.30,'#fff6df',canvas);for(let i=0;i<6;i++){const dot=ball(.032,['#89b3b0','#d5a0ac','#e0c278'][i%3],canvas,Math.sin(i*2)*.13,.03,Math.cos(i*2)*.08);dot.scale.y=.2;}
 const toy=ball(.15,'#c3a9c5',props);box(.05,.26,.05,'#f2dfb6',toy);const basket=new T.Group();props.add(basket);box(.34,.25,.27,'#b5c59d',basket);ball(.07,'#e3b886',basket,.07,.15);
 const broom=new T.Group();props.add(broom);box(.035,.8,.035,'#b69872',broom,0,.22);box(.3,.14,.075,'#cbb88d',broom,0,-.23);
 const sponge=box(.15,.055,.11,'#d3c58b',props);
 const can=new T.Group();props.add(can);mesh(new T.CylinderGeometry(.11,.13,.2,20),mat('#a4b995'),can);const spout=box(.06,.06,.26,'#a4b995',can,0,.04,.19);spout.rotation.x=-.4;
 const crumbs=new T.Group();props.add(crumbs);for(let i=0;i<8;i++)ball(.018,'#d0b684',crumbs);
 const aquarium=new T.Group();aquarium.name='HomeAquarium';aquarium.position.set(-.8,0,-2.65);world.add(aquarium);box(.8,.55,.5,'#b59877',aquarium,0,.275);const glass=new T.MeshStandardMaterial({color:'#bddfdf',transparent:true,opacity:.20,roughness:.1,depthWrite:false});mesh(new T.BoxGeometry(.8,.46,.5),glass,aquarium,0,.82);box(.78,.04,.48,'#d6c7a4',aquarium,0,.605);box(.84,.035,.54,'#8b9c8e',aquarium,0,1.065);for(const x of [-.25,.22])for(let i=0;i<3;i++){const reed=box(.02,.18+i*.035,.02,'#799b6d',aquarium,x+i*.025,.70);reed.rotation.z=i*.15;}
 const aquariumFish=FISH.map(f=>{const g=new T.Group();aquarium.add(g);const body=ball(.065,f.color,g);body.scale.set(1,.5,.45);const tail=mesh(new T.ConeGeometry(.038,.05,3),mat(f.color),g,-.085);tail.rotation.z=Math.PI/2;return {id:f.id,g};});
 let seatedBones=null,standingBones=null;
 let active=null,time=0;const startPos=new T.Vector3(),workPos=new T.Vector3();let startYaw=0;const movable=[book,brush,canvas,toy,basket,broom,sponge,can,crumbs];movable.forEach(o=>o.visible=false);
 const exit=propExit(movable,actor);
 function reset(){exit.reset();active=null;movable.forEach(o=>o.visible=false);}
 function local(x,y,z){return actor.localToWorld(new T.Vector3(x,y,z));}
 function place(o,x,y,z){o.visible=true;o.position.copy(local(x,y,z));o.quaternion.copy(actor.quaternion);}
 function reach(side,target){const a=d.bones['Arm_'+side],b=d.bones['Forearm_'+side],h=d.bones['Hand_'+side];d.model.updateWorldMatrix(true,true);const origin=a.getWorldPosition(new T.Vector3()),elbow=b.getWorldPosition(new T.Vector3()),wrist=h.getWorldPosition(new T.Vector3()),l1=origin.distanceTo(elbow),l2=elbow.distanceTo(wrist),dir=target.clone().sub(origin),dist=Math.min(dir.length(),l1+l2-.005);dir.normalize();const end=origin.clone().addScaledVector(dir,dist),along=(l1*l1-l2*l2+dist*dist)/(2*dist),bend=new T.Vector3(side==='R'?-1:1,0,0).applyQuaternion(actor.quaternion);bend.addScaledVector(dir,-bend.dot(dir)).normalize();const mid=origin.clone().addScaledVector(dir,along).addScaledVector(bend,Math.sqrt(Math.max(0,l1*l1-along*along)));for(const [bone,child,p]of [[a,b,mid],[b,h,end]]){d.model.updateWorldMatrix(true,true);const origin=bone.getWorldPosition(new T.Vector3()),from=child.getWorldPosition(new T.Vector3()).sub(origin).normalize(),to=p.clone().sub(origin).normalize();const q=new T.Quaternion().setFromUnitVectors(from,to).multiply(bone.getWorldQuaternion(new T.Quaternion()));bone.quaternion.copy(bone.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(q));}}
 function update(s,task,dt){time+=dt;aquariumFish.forEach(({id,g},i)=>{g.visible=!!s.living.aquarium[id];g.position.set(Math.sin(time*.5+i)*.25,.79+Math.sin(time+i)*.065,Math.cos(time*.5+i)*.12);g.rotation.y=Math.cos(time*.5+i)>0?0:Math.PI;});
  if(!task||task.phase!=='doing'||!task.id.startsWith('hobby-')&&!task.id.startsWith('shared-')){if(active)reset();return;}
  if(active!==task){reset();active=task;startPos.copy(actor.position);startYaw=actor.rotation.y;d.samplePose('Idle',.2);standingBones=Object.values(d.bones).map(b=>[b,b.position.clone(),b.quaternion.clone()]);d.samplePose('Sit_Test',.65);seatedBones=standingBones.map(([b])=>[b,b.position.clone(),b.quaternion.clone()]);}const shared=task.id.startsWith('shared-'),id=task.id.slice(shared?7:6),t=task.duration-task.remaining,enter=T.MathUtils.smoothstep(t,0,.85),leave=1-T.MathUtils.smoothstep(t,Math.max(.85,task.duration-.85),task.duration),hold=enter*leave;
  const seated=['read','listen','draw','toy','sunbathe','stargaze'].includes(id);d.samplePose('Idle',.2);if(seated&&!shared)standingBones.forEach(([b,p,q],i)=>{b.position.lerpVectors(p,seatedBones[i][1],hold);b.quaternion.slerpQuaternions(q,seatedBones[i][2],hold);});d.model.traverse(o=>{if(o.name.startsWith('Eye')&&o.morphTargetDictionary?.Blink!==undefined)o.morphTargetInfluences[o.morphTargetDictionary.Blink]=Math.sin(t*1.3)>.994?1:0;});
  // Leisure has a visible settle-in and stand-up instead of teleporting Latte to a seat.
  if(!shared&&['read','listen'].includes(id)){const g=house.fixtureGroups.sofa;workPos.copy(g.localToWorld(new T.Vector3(0,.49,.11)));actor.position.lerpVectors(startPos,workPos,hold);actor.rotation.y=startYaw+Math.atan2(Math.sin(g.rotation.y-startYaw),Math.cos(g.rotation.y-startYaw))*hold;}
  else if(!shared&&id==='draw'){workPos.set(1.25,.22,.85);actor.position.lerpVectors(startPos,workPos,hold);actor.rotation.y=startYaw+Math.atan2(Math.sin(-startYaw),Math.cos(-startYaw))*hold;}
  movable.forEach(o=>o.scale.setScalar(Math.max(.04,hold)));const arm=d.bones.Arm_R,fore=d.bones.Forearm_R,head=d.bones.Head;
  if(id==='read'){place(book,0,shared?.59:.42,.43);book.rotateX(.12);book.scale.y=.25+.75*Math.min(1,task.remaining/1.2);reach('R',local(-.18,shared?.59:.42,.43));reach('L',local(.18,shared?.59:.42,.43));head.rotation.x+=.07+Math.sin(t*.8)*.025;}
  if(id==='draw'){canvas.visible=true;if(shared)canvas.position.copy(local(0,.69,.35));else canvas.position.set(1.25,.77,1.36);canvas.quaternion.identity();arm.rotation.z-=.65;fore.rotation.x-=.65;reach('R',shared?local(-.08,.72,.40):new T.Vector3(1.17+Math.sin(t*4)*.07,.82,1.35));d.model.updateMatrixWorld(true);brush.visible=true;brush.position.copy(d.bones.Hand_R.getWorldPosition(new T.Vector3()));brush.rotation.x=Math.PI+Math.sin(t*4)*.15;head.rotation.x+=.16;canvas.children.forEach((o,i)=>o.visible=i===0||t>i*.8);}
  if(id==='listen'){head.rotation.z+=Math.sin(t*2)*.1;d.bones.Arm_L.rotation.z+=Math.sin(t*2)*.08;}
  if(id==='toy'){place(toy,Math.sin(t*2)*.22,.16,.5);toy.rotation.z=t*2;arm.rotation.z-=.3+Math.sin(t*2)*.1;}
  if(id==='tidy'){place(basket,-.1,.25,.4);head.rotation.x+=.18;arm.rotation.z-=.3+Math.sin(t*3)*.18;}
  if(id==='wipe'){place(sponge,Math.sin(t*4)*.17,.76,.52);head.rotation.x+=.16;arm.rotation.z-=.55+Math.sin(t*4)*.14;fore.rotation.x-=.4;reach('R',sponge.position);}
  if(id==='sweep'){place(broom,-.2,.40,.35);broom.rotation.z+=Math.sin(t*3)*.2;arm.rotation.z-=.4+Math.sin(t*3)*.08;reach('R',local(-.2,.65,.35));}
  if(id==='waterplants'){place(can,-.19,.6,.35);can.rotation.x=.55;arm.rotation.z-=.45;reach('R',local(-.19,.6,.35));crumbs.visible=true;crumbs.children.forEach((o,i)=>{o.material.color.set('#b2dce0');o.position.copy(local(-.15,.5-(t+i*.05)%.45,.56));});}
  if(id==='feedfish'){arm.rotation.z-=.4+Math.sin(t*3)*.18;crumbs.visible=true;crumbs.children.forEach((o,i)=>{o.material.color.set('#d0b684');const a=(t*.5+i*.1)%1;o.position.copy(local(Math.sin(i)*.22,.8-a*.8,.4+a*1.5));});}
  if(['stargaze','sunbathe'].includes(id)){head.rotation.x-=.18;head.rotation.y+=Math.sin(t*.4)*.14;}
  if(id==='yawn'){d.setExpression('Wide');head.rotation.x-=.08;reach('R',local(-.08,.90,.30));}
  if(id==='watchrain')head.rotation.y+=Math.sin(t*.5)*.1;
 }
 return {update,reset,aquarium,leave:exit.leave};
}
