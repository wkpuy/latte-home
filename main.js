import {OUTFITS} from './outfits.js?v=contact21';
import {createWardrobe} from './clothing.js?v=contact21';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createExpressiveMouth} from './expressive-mouth.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
const requestedRevision=new URLSearchParams(location.search).get('model');
const revision=['before','r04'].includes(requestedRevision)?requestedRevision:'after';
document.querySelector('#revision').value=revision;document.querySelector('#revision').onchange=e=>{location.search='?model='+e.target.value+'&front=1'};
const stage=document.querySelector('#stage'),status=document.querySelector('#status');
const scene=new T.Scene();scene.background=new T.Color('#f3eee5');
const camera=new T.PerspectiveCamera(35,1,.1,30);
const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;stage.prepend(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.48;controls.minDistance=2;controls.maxDistance=10;
function reset(){camera.position.set(3,2.5,5);controls.target.set(0,.75,0);controls.update()}reset();
scene.add(new T.HemisphereLight(0xfff8ef,0xd5c7b5,2.1));const sun=new T.DirectionalLight(0xfff3e4,1.4);sun.position.set(0,4,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
const faceFill=new T.DirectionalLight(0xfff5ec,.8);faceFill.position.set(0,1,5);scene.add(faceFill);
function box(w,h,d,color,x,y,z,r=0){const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshStandardMaterial({color,roughness:.9}));m.position.set(x,y,z);m.rotation.y=r;m.castShadow=true;m.receiveShadow=true;scene.add(m);return m}
function ball(radius,color,x,y,z,sx=1,sy=1,sz=1){const m=new T.Mesh(new T.SphereGeometry(radius,24,16),new T.MeshStandardMaterial({color,roughness:1}));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;scene.add(m);return m}
box(5,.14,4,'#d7b992',0,-.12,0);box(5,2.9,.12,'#e7dcc7',0,1.3,-2);box(.12,2.9,4,'#d9dfca',-2.5,1.3,0);
for(let x=-2.25;x<2.5;x+=.5)box(.013,.006,4,'#c6a984',x,-.045,0);
const rug=new T.Mesh(new T.CylinderGeometry(1.35,1.35,.016,64),new T.MeshStandardMaterial({color:'#c5cfb0'}));rug.position.set(0,-.027,.2);rug.receiveShadow=true;scene.add(rug);
box(1.35,.75,.06,'#b39575',.55,1.7,-1.9);box(1.2,.62,.075,'#bbd8d3',.55,1.7,-1.85);box(.05,.67,.08,'#faf0d8',.55,1.7,-1.79);box(1.23,.04,.08,'#faf0d8',.55,1.7,-1.79);
box(1.3,.15,.55,'#b89471',-1.4,.63,-1.2);for(const x of [-1.9,-.9])box(.08,.65,.08,'#b89471',x,.28,-1.2);
box(.2,.3,.28,'#7f9474',-1.65,.86,-1.25);box(.15,.24,.28,'#d49e88',-1.42,.83,-1.25);box(.13,.34,.28,'#ecd8aa',-1.23,.88,-1.25);
ball(.22,'#c79475',1.8,.19,-1.1,1,1.1,1);box(.035,.5,.035,'#7e8b60',1.8,.54,-1.1);for(let i=0;i<5;i++)ball(.2,'#899e73',1.8+Math.cos(i*2)*.14,.75+i*.07,-1.1+Math.sin(i*2)*.15,1,.65,1);
const root=new T.Group();scene.add(root);let model,mixer,current,mode='Idle',expression='',elapsed=0,hat,head,hand,forearm,arm,cookie;const clips={},bones={},rests={};const originalMaterials=new Map(),litMaterials=new Map();let meshes=[];let expressiveMouth;
let earsEnabled=true,earBlend=0,earTime=0,worldMode=false,worldFrame=null,poseFrame=null;
const earBase=new Map(),earAxis=new T.Vector3(0,0,1),earRotation=new T.Quaternion();
function setEars(enabled){earsEnabled=enabled;const b=document.querySelector('#ears');b.classList.toggle('active',enabled);b.setAttribute('aria-pressed',String(enabled));b.textContent=enabled?'หูกระดิก · เปิด':'หูกระดิก · ปิด';}
document.querySelector('#ears').onclick=()=>setEars(!earsEnabled);
// Restore the unmodified pose before the mixer; never accumulate rotations.
function clearEarMotion(){for(const [bone,q] of earBase)bone.quaternion.copy(q);earBase.clear();}
const earEvents={L:{next:1.2,start:-10,duration:1,power:0},R:{next:3.5,start:-10,duration:1,power:0}};
function moveEars(dt){
 earTime+=dt;earBlend=T.MathUtils.damp(earBlend,earsEnabled?1:0,7,dt);if(earBlend<.0001)return;
 for(const [side,sign] of [['L',1],['R',-1]]){
  const e=earEvents[side];if(earTime>e.next){e.start=earTime;e.duration=.45+Math.random()*.65;e.power=.08+Math.random()*.14;e.next=earTime+3+Math.random()*7;}
  for(const [part,weight,lag] of [['Ear',1,0],['EarMid',.55,.07],['EarTip',.3,.14]]){const bone=bones[part+'_'+side];if(!bone)continue;earBase.set(bone,bone.quaternion.clone());const age=(earTime-e.start-lag)/e.duration;const twitch=age>0&&age<1?Math.sin(age*Math.PI*2)*Math.exp(-age*3)*e.power:0;const sway=mode==='Walk_Test'?Math.sin(earTime*7+(side==='L'?0:.7)-lag)*.035:0;bone.quaternion.multiply(earRotation.setFromAxisAngle(earAxis,sign*(twitch+sway)*weight*earBlend));}
 }
}

const labels={Idle:'ยืนเล่น',Walk_Test:'เดิน',Sit_Test:'นั่ง',Eat:'กินคุกกี้',Wave_Test:'โบกมือ',Dance:'เต้น',Sleep:'นอน',Sing:'ร้องเพลง'};
function play(name){if(!mixer)return;clearEarMotion();mode=name;elapsed=0;root.position.set(0,0,0);root.rotation.set(0,0,0);const next=clips[name==='Eat'?'Idle':name];if(current!==next){next.reset().fadeIn(.25).play();if(current){const old=current;old.fadeOut(.25);setTimeout(()=>{if(current!==old)old.stop()},300)}current=next}cookie.visible=name==='Eat';document.querySelectorAll('#actions button').forEach(b=>b.classList.toggle('active',b.dataset.mode===name));}
for(const [name,label] of Object.entries(labels)){const b=document.createElement('button');b.textContent=label;b.dataset.mode=name;b.onclick=()=>play(name);document.querySelector('#actions').append(b)}
for(const [name,label] of [['','ปกติ'],['Talk','พูด'],['Laugh','หัวเราะ'],['Happy','ยิ้ม'],['Wide','ตกใจ'],['Shy','เขิน'],['Sad','เศร้า']]){const b=document.createElement('button');b.textContent=label;b.dataset.expression=name;b.onclick=()=>{expression=name;document.querySelectorAll('#faces button').forEach(x=>x.classList.toggle('active',x===b))};document.querySelector('#faces').append(b)}
document.querySelector('#reset').onclick=reset;
function front(){if(!mixer)return;clearEarMotion();setEars(false);earBlend=0;document.querySelectorAll('#actions button').forEach(b=>b.classList.remove('active'));mixer.stopAllAction();current=null;mode='Idle';cookie.visible=false;root.position.set(0,0,0);root.rotation.set(0,0,0);camera.position.set(0,.76,4.5);controls.target.set(0,.76,0);controls.update()}
document.querySelector('#front').onclick=front;
let capVisor;
function setHat(value){if(!hat)return;hat.visible=value!=='none';const baseball=value==='cap';hat.children.forEach(m=>m.material.color.set(baseball?'#729eae':value==='rose'?'#c98988':'#7a9278'));hat.children[1].visible=!baseball;if(capVisor)capVisor.visible=baseball;hat.children[0].scale.y=baseball?.75:.5;}
const clothingOriginals=new Map();let wardrobeLayers;
function setClothes(value='sage'){wardrobeLayers?.set(value);const classic=['sage','rose','denim','cream'].includes(value);model?.traverse(o=>{if(!o.name.startsWith('Outfit_'))return;o.visible=classic;if(o.isMesh&&o.name==='Outfit_Overalls'){if(!clothingOriginals.has(o)){clothingOriginals.set(o,o.material);o.material=o.material.clone();}o.material.color.set({sage:'#a6b8a0',rose:'#d6a3b2',denim:'#819cba',cream:'#ead7ad'}[value]??'#a6b8a0');}});}
document.querySelector('#outfit').onchange=e=>setHat(e.target.value);
document.querySelector('#wardrobe').replaceChildren(...OUTFITS.map(([id,name])=>new Option(name,id)));
document.querySelector('#wardrobe').onchange=e=>setClothes(e.target.value);


function morph(mesh,values){if(!mesh.morphTargetDictionary)return;mesh.morphTargetInfluences.fill(0);for(const [k,v]of Object.entries(values)){const i=mesh.morphTargetDictionary[k];if(i!==undefined)mesh.morphTargetInfluences[i]=v}}
try{const g=await new GLTFLoader().loadAsync(revision==='before'?'./assets/latte-r03.glb':revision==='r04'?'./assets/latte-r04.glb':'./assets/latte-r13.glb?v=ears-minus5mm-13');model=g.scene;root.add(model);
// Ease each hanging ear inward by 7 mm at its tip, preserving its root and rig.
if(revision==='after')model.traverse(o=>{if(!o.isMesh||!/^Ear_[LR](?:_\d+)?$/.test(o.name))return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){const t=T.MathUtils.clamp((1.30-p.getY(i))/.81,0,1);p.setX(i,p.getX(i)-Math.sign(p.getX(i))*.007*t*t*(3-2*t));}p.needsUpdate=true;o.geometry.computeVertexNormals();o.geometry.computeBoundingSphere();o.userData.earInsetMetres=.007;});
model.traverse(o=>{if(o.isBone){bones[o.name]=o;rests[o.name]=o.quaternion.clone()}if(o.isMesh){o.castShadow=true;meshes.push(o);originalMaterials.set(o,o.material);const convert=m=>new T.MeshStandardMaterial({map:m.map,color:m.color,roughness:.95,side:m.side,transparent:m.transparent,opacity:m.opacity});litMaterials.set(o,Array.isArray(o.material)?o.material.map(convert):convert(o.material));if(!o.morphTargetDictionary || !o.name.startsWith('Eye'))o.material=litMaterials.get(o)}});mixer=new T.AnimationMixer(model);for(const clip of g.animations)clips[clip.name]=mixer.clipAction(clip);head=bones.Head;arm=bones.Arm_R;forearm=bones.Forearm_R;hand=bones.Hand_R;
// Rigid accessories attach to bones. They are independent of the body mesh.
model.updateMatrixWorld(true);wardrobeLayers=createWardrobe(model,bones);expressiveMouth=createExpressiveMouth(scene,head);hat=new T.Group();hat.name='LatteHat';const cap=new T.Mesh(new T.SphereGeometry(.27,32,16,0,Math.PI*2,0,Math.PI/2),new T.MeshStandardMaterial({color:'#7a9278'}));cap.scale.set(1,.5,.8);hat.add(cap);const brim=new T.Mesh(new T.CylinderGeometry(.31,.31,.025,32),new T.MeshStandardMaterial({color:'#7a9278'}));brim.scale.z=.8;hat.add(brim);capVisor=new T.Mesh(new T.SphereGeometry(.27,24,12),new T.MeshStandardMaterial({color:'#729eae'}));capVisor.scale.set(1,.08,.75);capVisor.position.set(0,.015,.22);capVisor.visible=false;hat.add(capVisor);scene.add(hat);hat.position.set(0,1.39,0);head.attach(hat);hat.visible=false;
cookie=new T.Group();const biscuit=new T.Mesh(new T.SphereGeometry(.075,18,12),new T.MeshStandardMaterial({color:'#ba8144'}));biscuit.scale.z=.4;cookie.add(biscuit);for(let i=0;i<5;i++){const chip=new T.Mesh(new T.SphereGeometry(.008,8,6),new T.MeshStandardMaterial({color:'#62402c'}));chip.position.set(Math.cos(i*2)*.045,Math.sin(i*2)*.045,.028);cookie.add(chip)}hand.add(cookie);cookie.position.set(0,.035,.015);play('Idle');if(new URLSearchParams(location.search).has('front'))front();if(new URLSearchParams(location.search).get('ears')==='1')setEars(true);window.latteDemo={setClothes,setHat,scene,model,root,bones,clips,play,renderer,camera,controls,front,setWorldFrame(fn){worldMode=true;worldFrame=fn;},get mode(){return mode}};
}catch(e){document.querySelector('#error').textContent='โหลดเดโมไม่สำเร็จ: '+e.message;status.textContent='โหลดไม่สำเร็จ';console.error(e)}
if(window.latteDemo){
 const originalPlay=window.latteDemo.play;
 window.latteDemo.play=name=>{for(const a of Object.values(clips)){a.paused=false;a.setEffectiveTimeScale(1);}originalPlay(name);};
 window.latteDemo.samplePose=(name,time)=>{play(name);mixer.stopAllAction();current.reset().setEffectiveWeight(1).play();current.time=time;current.paused=true;mixer.update(0);};
 window.latteDemo.setPoseFrame=fn=>poseFrame=fn;
 window.latteDemo.setCookie=visible=>cookie.visible=visible;
 window.latteDemo.setExpression=value=>expression=value;
}
function aim(bone,child,target){model.updateWorldMatrix(true,true);const origin=bone.getWorldPosition(new T.Vector3());const from=child.getWorldPosition(new T.Vector3()).sub(origin).normalize();const to=target.clone().sub(origin).normalize();const q=new T.Quaternion().setFromUnitVectors(from,to).multiply(bone.getWorldQuaternion(new T.Quaternion()));bone.quaternion.copy(bone.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(q));model.updateMatrixWorld(true)}
function eatPose(t){model.updateMatrixWorld(true);const shoulder=arm.getWorldPosition(new T.Vector3());const elbow=forearm.getWorldPosition(new T.Vector3());const wrist=hand.getWorldPosition(new T.Vector3());const a=shoulder.distanceTo(elbow),b=elbow.distanceTo(wrist);const target=root.localToWorld(new T.Vector3(-.12,.86+Math.sin(t*3)*.012,.22));const direction=target.clone().sub(shoulder);const distance=Math.min(direction.length(),a+b-.001);direction.normalize();target.copy(shoulder).addScaledVector(direction,distance);const along=(a*a-b*b+distance*distance)/(2*distance);const bend=new T.Vector3(-1,0,0).applyQuaternion(root.getWorldQuaternion(new T.Quaternion()));bend.addScaledVector(direction,-bend.dot(direction)).normalize();const elbowTarget=shoulder.clone().addScaledVector(direction,along).addScaledVector(bend,Math.sqrt(Math.max(0,a*a-along*along)));aim(arm,forearm,elbowTarget);aim(forearm,hand,target);const snackPosition=hand.getWorldPosition(new T.Vector3()).add(new T.Vector3(.035,.035,.09).applyQuaternion(root.getWorldQuaternion(new T.Quaternion())));cookie.position.copy(hand.worldToLocal(snackPosition));cookie.quaternion.copy(hand.getWorldQuaternion(new T.Quaternion()).invert().multiply(root.getWorldQuaternion(new T.Quaternion())))}
document.querySelector('#shading').onchange=e=>{for(const m of meshes)m.material=(e.target.value==='soft'?litMaterials:originalMaterials).get(m)};
let simulationTime=0,prev=performance.now(),frames=0,measure=0,fps=0;
function frame(now){requestAnimationFrame(frame);const realDt=(now-prev)/1000;const dt=Math.min(realDt,.05)*(window.latteDemo?.worldTimeScale?.()??1);simulationTime+=dt;prev=now;worldFrame?.(dt,simulationTime);const speed=+document.querySelector('#speed').value;elapsed+=dt*speed;if(mixer&&(!worldMode||dt>0)){clearEarMotion();mixer.update(dt*speed);if(mode==='Walk_Test'&&!worldMode){root.position.x=Math.sin(elapsed*.65)*.8;root.rotation.y=Math.cos(elapsed*.65)>=0?Math.PI/2:-Math.PI/2}if(mode==='Eat')eatPose(elapsed);
for(const m of meshes){if(!m.morphTargetDictionary)continue;if(mode==='Sleep'||mode==='Sing')continue;const eye=m.name.startsWith('Eye');const eyeExpression={Talk:'',Laugh:'Happy',Shy:'Happy'}[expression]??expression;const blink=Math.pow(Math.max(0,Math.cos(elapsed*1.4)),40)>.75?1:0;if(eye)morph(m,blink?{Blink:1}:eyeExpression?{[eyeExpression]:expression==='Shy'?.35:.8}:{});else morph(m,mode==='Eat'?{Mouth_Open:(.5+.5*Math.sin(elapsed*8))*.65}:expression==='Happy'?{Smile:.8}:expression==='Shy'?{Smile:.35}:expression==='Sad'?{Sad:.7}:{})}
const mouthKind=['Eat','Sing'].includes(mode)?mode:mode==='Sleep'?'':expression;
const openMouth=expressiveMouth.update(mouthKind,elapsed);
for(const m of meshes)if(m.name.startsWith('Face_Mouth'))m.visible=!openMouth;
frames++;measure+=realDt;if(measure>1){fps=Math.round(frames/measure);frames=0;measure=0}status.textContent=`${labels[mode]} · ${fps} FPS บนเครื่องนี้ · หมุนดูได้ 360°`;}
poseFrame?.(dt,simulationTime);if(dt>0)moveEars(dt*speed);controls.update();renderer.render(scene,camera)}
new ResizeObserver(()=>{camera.aspect=stage.clientWidth/stage.clientHeight;camera.updateProjectionMatrix();renderer.setSize(stage.clientWidth,stage.clientHeight)}).observe(stage);requestAnimationFrame(frame);
