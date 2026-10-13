import {remember} from './living-state.js?v=contact21';
import {setupHomeLife} from './home-life-play.js?v=contact21';
import {radialMenu} from './radial-menu.js?v=contact21';
import {setupLiving} from './living-play.js?v=contact21';
import {setupLivingCamera} from './living-camera.js?v=contact21';
import {setupDailyLife} from './daily-life-play.js?v=contact21';
import {feel,feeling} from './daily-life-state.js?v=contact21';
import {OUTFITS} from './outfits.js?v=contact21';
import {setupFurniture} from './furniture-play.js?v=contact21';
import {moodlets,scheduledNeed,scheduleFor} from './life-state.js?v=contact21';
import {weatherFor} from './weather-state.js?v=contact21';
import {setupFarm} from './farm-play.js?v=contact21';
import './main.js?v=contact21';
import * as T from 'three';
import {initial,restore,advance,syncClock,purchase,ITEMS,SAVE_KEY,NEEDS,CROPS,applyEffects,buySeed,plant,water,harvest,sellProduce,plotStatus} from './room-state.js?v=real-time1';
import {ROOMS,FIXTURES,BASE_FIXTURES,PLOTS,setFurnitureAngles,setFurnitureLayout,walkable,findPath,roomAt} from './house-layout.js?v=contact21';
import {createHouse} from './house-scene.js?v=contact21';
import {setupCookieGame} from './cookie-game.js?v=contact21';
import {createActivityMotion} from './activity-motion.js?v=contact21';
import {createTown} from './town-scene.js?v=contact21';
import {setupTownPlay} from './town-play.js?v=contact21';
const $=id=>document.getElementById(id),d=window.latteDemo;
if(!d)throw new Error('Latte could not load');
let s;try{s=restore(localStorage.getItem(SAVE_KEY),Date.now(),{realTime:true});}catch{s=initial();}syncClock(s);
if(!setFurnitureLayout(Object.fromEntries(FIXTURES.map(f=>[f.id,{...(s.furniture?.[f.id]??{}),angle:s.rotations[f.id]??s.furniture?.[f.id]?.angle??0}])),s.position)){s.rotations={};s.furniture={};setFurnitureAngles({});}
s.furniture=Object.fromEntries(FIXTURES.map(f=>{const b=BASE_FIXTURES.find(x=>x.id===f.id);return [f.id,{x:f.x-b.x,z:f.z-b.z,angle:(f.angle??0)*180/Math.PI}]}));
const house=createHouse(d),actor=new T.Group();d.scene.add(actor);actor.add(d.root);actor.position.set(s.position.x,0,s.position.z);
const motion=createActivityMotion(d,house,actor);
const town=createTown(house);let townPlay,farm,furniture,daily,living,homeLife;
let task=null,manualUntil=Date.now()+18000,nextAuto=Date.now()+18000,bubbleTimer,uiElapsed=0,saveElapsed=0,follow=false,lastTick=Date.now();
let selectedCrop='carrot',chaining=false,exitMotion=null;
const actionQueue=[];
const queuePanel=document.createElement('details');queuePanel.className='panel';queuePanel.id='action-queue';queuePanel.open=true;
queuePanel.innerHTML='<summary>กิจกรรมถัดไป <span id="queue-count">0</span></summary><p class="panel-note">เลือกกิจกรรมเพิ่มเพื่อทำต่อกัน · กด × เพื่อลบออกจากคิว</p><div id="queue-items"></div>';
document.querySelector('.wellbeing').after(queuePanel);
function nextQueued(){if(task||!actionQueue.length||document.querySelector('dialog[open]')||furniture?.open||document.hidden)return;const next=actionQueue.shift();if(!start(next,true))nextQueued();}
function leaveActivity(callback){
 if(task?.phase==='exiting')return;if(!task||task.phase!=='doing'&&!(task.phase==='walking'&&task.carry)){callback();return;}
 if(task.phase==='walking')task.anchor={x:actor.position.x,z:actor.position.z};
 exitMotion={finished:callback===complete,elapsed:0,position:actor.position.clone(),root:d.root.quaternion.clone(),bones:Object.values(d.bones).map(b=>[b,b.position.clone(),b.quaternion.clone()]),callback};
 task.phase='exiting';pose('Idle');render();
}
function stopCurrent(){leaveActivity(()=>{cancel();nextQueued();});}

function save(){s.last=Date.now();try{localStorage.setItem(SAVE_KEY,JSON.stringify(s));$('save-state').textContent='✓ บันทึกไว้ในเครื่องแล้ว';}catch{$('save-state').textContent='บันทึกไม่ได้ · เล่นได้ในรอบนี้';}}
function say(text){clearTimeout(bubbleTimer);$('bubble').textContent=text;$('bubble').classList.add('visible');bubbleTimer=setTimeout(()=>$('bubble').classList.remove('visible'),3200);}
function pose(mode,emotion=''){d.play(mode);document.querySelector(`[data-expression="${emotion}"]`)?.click();const e=$('ears');if((e.getAttribute('aria-pressed')==='true')!==(mode!=='Sleep'))e.click();}
function equip(){const bathing=task?.id==='shower'&&task.phase==='doing';d.setClothes(bathing?'none':s.clothes);d.setHat(bathing?'none':s.hat);}
function syncPosition(){s.position={x:actor.position.x,z:actor.position.z};}
function cancel(manual=true){const old=task;exitMotion=null;town.hold(null);if(manual)manualUntil=Date.now()+18000;if(old&&['doing','exiting'].includes(old.phase)){const returnTo=old.anchor;actor.position.set(returnTo.x,0,returnTo.z);}motion.reset();daily?.reset();living?.reset();homeLife?.reset();task=null;equip();s.sleeping=false;d.root.position.set(0,0,0);actor.position.y=0;house.marker.visible=false;pose('Idle');syncPosition();render();save();}
function start(spec,manual=true){
 if(game.open||townPlay?.open||furniture?.open||document.querySelector('#closet-dialog')?.open)return false;
 if(task&&!chaining&&manual){if(actionQueue.length>=8){say('คิวเต็มแล้ว รอให้น้องทำเสร็จสักอย่างก่อนนะ');return false;}actionQueue.push({...spec,anchor:{...spec.anchor}});say('เพิ่มในคิว: '+spec.action);render();return true;}
 if(spec.inPlace)spec={...spec,anchor:{...s.position}};
 if(spec.validate&&!spec.validate()){say('ตอนนี้ยังทำกิจกรรมนี้ไม่ได้ ลองตรวจของที่ต้องใช้ก่อนนะ');return false;}
 const fixture=FIXTURES.find(f=>f.id===(spec.fixtureId??spec.id));if(fixture)spec={...spec,anchor:{...fixture.anchor},look:{...fixture.look}};
 const path=findPath(s.position,spec.anchor);if(!path){say('ตรงนี้เดินไปไม่ถึง ลองเลือกพื้นว่างใกล้ ๆ นะ');return false;}
 cancel(manual);task={...spec,origin:{x:actor.position.x,z:actor.position.z},phase:'walking',path,remaining:spec.duration??0,manual};house.marker.position.set(spec.anchor.x,.08,spec.anchor.z);house.marker.visible=true;pose('Walk_Test');render();return true;
}
function begin(){if(!task)return;if(task.validate&&!task.validate()){say('ของที่ต้องใช้เปลี่ยนไปแล้ว ข้ามกิจกรรมนี้ก่อนนะ');cancel(false);nextQueued();return;}task.phase='doing';task.onBegin?.();if(task.neighborId)town.hold(task.neighborId);$('bubble').classList.remove('visible');house.marker.visible=false;const f=task.look??{x:actor.position.x,z:actor.position.z+1};actor.rotation.set(0,Math.atan2(f.x-actor.position.x,f.z-actor.position.z),0);pose(task.mode??'Idle',task.emotion??'Happy');
 if(task.id==='bed')s.sleeping=true;if(task.id==='shower')equip();
 save();if(!task.duration)complete();
}
function complete(){const done=task;if(!done)return;const ok=done.complete?done.complete():true;if(ok){living?.completed(done);homeLife?.completed(done);}if(ok&&done.effects)applyEffects(s,done.effects);if(ok&&done.id==='pet')feel(s,'love','ได้รับการลูบหัว รู้สึกอบอุ่นและเป็นที่รัก');if(ok&&done.neighborId)feel(s,'love','ได้ใช้เวลาดี ๆ กับเพื่อน');if(ok&&done.id==='stretch'&&['angry','furious'].includes(feeling(s).id))feel(s,'happy','หายใจลึก ๆ แล้วยืดตัว รู้สึกสงบลง');if(ok&&done.id==='shower')feel(s,'happy','อาบน้ำสะอาด สดชื่นแล้ว');cancel(false);nextAuto=Date.now()+10000+Math.random()*6000;if(ok&&done.message)say(done.message);render();save();if(ok&&done.next){chaining=true;try{done.next();}finally{chaining=false;}}nextQueued();}
function useFixture(id,manual=true,reason=''){if(daily&&id==='counter')return daily.cook(undefined,manual,reason);if(daily&&id==='fridge')return daily.snack(manual);const f=FIXTURES.find(f=>f.id===id);return f&&start({...f,reason,duration:{sofa:20,shower:14,sink:8,fridge:9,counter:14}[id]??f.duration,message:`${f.action}เสร็จแล้ว สบายตัวขึ้นเลย ♡`},manual);}
function showObjectMenu(id){const f=FIXTURES.find(x=>x.id===id);if(!f)return;const actions=[{label:f.action,run:()=>useFixture(id)}];
 if(id==='sofa')actions.push({label:'📖 อ่าน',run:()=>living.hobby('read')},{label:'🎵 ฟังเพลง',run:()=>living.hobby('listen')},{label:'💤 งีบสั้น',run:()=>homeLife.act('nap')});
 if(id==='bed')actions.push({label:'🛏️ จัดเตียง',run:()=>homeLife.act('makebed')});
 if(id==='shower')actions.push({label:'🧽 เช็ดพื้น',run:()=>homeLife.act('mop')});
 if(id==='sink')actions.push({label:'🍽️ ล้างจาน',run:()=>start({...f,action:'ล้างจาน',carry:'plate',duration:8,validate:()=>s.daily.dirtyDishes>0,complete:()=>daily.clean()})});
 if(id==='counter')actions.push({label:'🍳 เลือกเมนู',run:()=>daily.openMenu()});
 if(id==='fridge')actions.splice(0,actions.length,{label:'🥪 ของว่าง',run:()=>daily.snack()},{label:'🍳 ทำอาหาร',run:()=>daily.openMenu()},{label:'🥡 เก็บอาหาร',run:()=>homeLife.act('store')},{label:'🧊 ของในตู้',run:()=>homeLife.openPantry()},{label:'🛒 เติมของ',run:()=>homeLife.act('restock')});
 radialMenu(f.name,actions);
}
function showActorMenu(){radialMenu('ลาเต้',[{label:'♡ ลูบหัว',run:pet},{label:'💭 อารมณ์',run:()=>{$('emotion-panel').open=true;$('emotion-panel').scrollIntoView({block:'nearest'});}},{label:'👕 เปลี่ยนชุด',run:openWardrobe},{label:'🪮 แปรงขน',run:()=>homeLife.act('brush')},{label:'🧼 เช็ดหู',run:()=>homeLife.act('ears')},{label:'💌 จดหมาย',run:()=>homeLife.act('mail')}]);}
function plotAction(index,manual=true){const p=s.plots[index],c=CROPS.find(c=>c.id===p?.crop),layout=PLOTS[index];if(!layout)return;
 const id=!p?'plant':!p.watered?'water':p.growth>=c.seconds?'harvest':'inspect';
 if(id==='inspect'){say(`${c.name}กำลังโต อีก ${Math.ceil(c.seconds-p.growth)} วินาทีนะ`);return;}
 const crop=selectedCrop;if(id==='plant'&&!s.seeds[crop]){say('เมล็ดหมดแล้ว ซื้อเพิ่มในร้านเมล็ดได้เลย');return;}
 start({id,name:`แปลง ${index+1}`,action:id==='plant'?'ปลูกผัก':id==='water'?'รดน้ำ':'เก็บผลผลิต',anchor:{x:layout.x,z:layout.z+.7},look:layout,mode:'Idle',duration:3,complete:()=>id==='plant'?plant(s,index,crop):id==='water'?water(s,index):harvest(s,index),message:id==='plant'?'ปลูกแล้ว! รดน้ำอีกครั้งให้น้องผักโตนะ 🌱':id==='water'?'ชุ่มฉ่ำแล้ว รอเก็บผักกันได้เลย 💧':'เก็บผักเข้ากระเป๋าแล้ว เอาไปขายได้เลย 🧺'},manual);
}
function pet(){if(game.open)return;start({id:'pet',name:'อยู่ด้วยกัน',action:'รับความรัก',anchor:{...s.position},mode:'Wave_Test',emotion:'Shy',duration:3,effects:{joy:8,social:15},message:'อยู่ด้วยกันแล้วอุ่นใจจัง ♡'});}
function runAuto(){if(!s.autoLife||task||game.open||townPlay?.open||furniture?.open||document.hidden||document.querySelector('#closet-dialog')?.open||Date.now()<manualUntil||Date.now()<nextAuto)return;nextAuto=Date.now()+14000;
 if(homeLife?.auto())return;
 if(living?.auto())return;
 const low=[['energy',35,'bed'],['food',45,'fridge'],['hygiene',45,'shower'],['joy',45,'sofa']].filter(([k,n])=>s[k]<n).sort((a,b)=>s[a[0]]-s[b[0]]);
 if(low.length&&low[0][0]==='food'&&daily?.auto())return;
 if(low.length){useFixture(low[0][2],false);return;}
 if(daily?.auto())return;
 const emotion=feeling(s);if(['angry','furious'].includes(emotion.id)){moment('stretch',false);return;}
 const planned=scheduledNeed(s);
 if(planned==='social'&&!townPlay?.open&&s.position.z<=7.3){townPlay?.talkTo('milo',false,'อยากไปคุยกับเพื่อนช่วงบ่าย');return;}
 if(['bed','fridge','shower','sofa'].includes(planned)&&s[planned==='bed'?'energy':planned==='fridge'?'food':planned==='shower'?'hygiene':'joy']<72){useFixture(planned,false);return;}
 if(s.social<55){start({id:'hello',name:'ทักทายคุณ',action:'ชวนคุย',anchor:{...s.position},mode:'Wave_Test',emotion:'Talk',duration:4,effects:{social:22,joy:4},message:'วันนี้เป็นยังไงบ้าง มาอยู่ด้วยกันนะ ♡'},false);return;}
 if(farm?.runAuto())return;
 const thirsty=s.plots.findIndex(p=>p&&!p.watered);if(thirsty>=0){plotAction(thirsty,false);return;}
 const ready=s.plots.findIndex(p=>p&&p.growth>=CROPS.find(c=>c.id===p.crop).seconds);if(ready>=0){plotAction(ready,false);return;}
 const night=s.minute<360||s.minute>1260;if(night&&s.energy<90){useFixture('bed',false);return;}
 const choices=[()=>daily.fish(false),()=>moment('stretch',false),()=>moment('lookaround',false),()=>moment('hum',false),()=>moment('cheer',false),()=>useFixture('sofa',false),()=>start({id:'dance',name:'มุมโปรด',action:'เต้นเล่น',anchor:{x:-1.1,z:1.55},mode:'Dance',duration:6,effects:{joy:9,energy:-2}},false),()=>start({id:'stroll',name:'สวน',action:'เดินชมสวน',anchor:{x:-1.4,z:5},mode:'Idle',duration:5,effects:{joy:7}},false)];choices[Math.floor(Math.random()*choices.length)]();
}
function home(){follow=false;$('camera-follow').setAttribute('aria-pressed','false');const center=s.position.z>7.3?13:1.15;d.controls.target.set(0,0,center);const narrow=$('stage').clientWidth/$('stage').clientHeight<1;d.camera.fov=narrow?48:35;d.camera.updateProjectionMatrix();d.camera.position.set(narrow?10:9,narrow?24:15,(narrow?26:18)+center-1.15);d.controls.update();}
function focus(x,z){follow=false;$('camera-follow').setAttribute('aria-pressed','false');d.controls.target.set(x,.2,z);d.camera.position.set(x+3,8,z+8);d.controls.update();if(innerWidth<=720)$('stage').scrollIntoView({block:'start',behavior:'smooth'});}
function followTrip(){follow=true;$('camera-follow').setAttribute('aria-pressed','true');d.controls.target.set(actor.position.x,.5,actor.position.z);d.camera.position.set(actor.position.x+4,9,actor.position.z+10);d.controls.update();}
d.controls.zoomToCursor=true;d.controls.screenSpacePanning=true;d.controls.minDistance=2.5;d.controls.maxDistance=38;d.controls.minPolarAngle=.3;d.controls.maxPolarAngle=1.35;home();$('view-navigation').append($('room-nav'));$('camera-focus').onclick=()=>{follow=false;$('camera-follow').setAttribute('aria-pressed','false');const p=actor.position,n=['milo','poppy'].map(id=>town.neighborPosition(id)).find(n=>n&&Math.hypot(n.x-p.x,n.z-p.z)<2.2);if(n){const dx=n.x-p.x,dz=n.z-p.z,length=Math.hypot(dx,dz)||1,mx=(p.x+n.x)/2,mz=(p.z+n.z)/2;d.controls.target.set(mx,.8,mz);d.camera.position.set(mx+dz/length*4.5,3,mz-dx/length*4.5+1);}else{d.controls.target.set(p.x,.8,p.z);d.camera.position.set(p.x+1.1,2.5,p.z+4.2);}d.controls.update();};$('camera-home').onclick=home;$('camera-follow').onclick=()=>{follow=!follow;$('camera-follow').setAttribute('aria-pressed',String(follow));if(follow){const {x,z}=s.position;d.controls.target.set(x,.5,z);d.camera.position.set(x+2.5,5,z+6);}};
matchMedia('(max-width:720px)').addEventListener('change',home);
for(const r of [...ROOMS,{id:'garden',name:'สวน',x:1.5,z:4.8},{id:'rice',name:'นาข้าว',x:-2.6,z:5.1}]){const b=document.createElement('button');b.textContent=r.name;b.onclick=()=>{focus(r.x,r.z);if(r.id==='garden')$('garden-panel').open=true;if(r.id==='rice'){$('rice-panel').open=true;$('rice-panel').scrollIntoView({block:'nearest',behavior:'smooth'});}};$('room-nav').append(b);}
for(const [label,anchor] of [['🏘 ไปเมือง',{x:0,z:8.1}],['🏠 กลับบ้าน',{x:-1.1,z:1.55}]]){const b=document.createElement('button');b.textContent=label;b.dataset.travel=anchor.z>7?'town':'home';b.onclick=()=>{if(start({id:'walk',name:anchor.z>7?'เมืองใบชา':'บ้านเรา',action:'เดิน',anchor,duration:0}))followTrip();};$('room-nav').append(b);}
for(const f of FIXTURES){const b=document.createElement('button');b.dataset.fixture=f.id;b.innerHTML=`<span>${f.icon}</span><span><strong>${f.action}</strong><small>${ROOMS.find(r=>r.id===f.room).name}</small></span><span>↗</span>`;b.onclick=()=>useFixture(f.id);$('fixture-actions').append(b);}
const washDishesButton=document.createElement('button');washDishesButton.id='wash-dishes';washDishesButton.innerHTML='<span>🍽️</span><span><strong>ล้างจาน</strong><small>จานที่ใช้แล้ว</small></span><span>↗</span>';washDishesButton.onclick=()=>{const f=FIXTURES.find(f=>f.id==='sink');start({...f,action:'ล้างจาน',carry:'plate',duration:8,validate:()=>s.daily.dirtyDishes>0,complete:()=>daily.clean()});};$('fixture-actions').append(washDishesButton);
const careToggle=$('care-toggle'),careDock=$('care-dock');function closeCare(){careDock.hidden=true;careToggle.setAttribute('aria-expanded','false');}careToggle.onclick=()=>{careDock.hidden=!careDock.hidden;careToggle.setAttribute('aria-expanded',String(!careDock.hidden));};careDock.addEventListener('click',e=>{if(e.target.closest('button'))closeCare();});document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeCare();$('object-menu').hidden=true;}});$('stage').addEventListener('pointerdown',()=>{closeCare();$('object-menu').hidden=true;});
$('cancel-action').onclick=()=>{stopCurrent();say('พักไว้ก่อน ไปทำอย่างอื่นกัน');};$('feed').onclick=()=>useFixture('fridge');$('pet').onclick=pet;$('sleep').onclick=()=>task?.id==='bed'?stopCurrent():useFixture('bed');
 $('time-controls').addEventListener('click',e=>{const b=e.target.closest('[data-speed]');if(!b)return;s.timeScale=Number(b.dataset.speed);document.querySelectorAll('#time-controls [data-speed]').forEach(x=>x.setAttribute('aria-pressed',String(Number(x.dataset.speed)===s.timeScale)));save();say(s.timeScale?'เริ่มเวลาชีวิตจริงแล้ว':'พักการจำลองไว้ก่อน');});
$('auto-life').onclick=()=>{s.autoLife=!s.autoLife;if(!s.autoLife&&task&&!task.manual)cancel(false);nextAuto=Date.now()+3000;render();save();};
for(const item of ITEMS){const row=document.createElement('div');row.className='item';row.innerHTML=`<span class="item-icon">${item.icon}</span><div class="item-info"><strong>${item.name}</strong><small>${item.description}</small></div><button data-buy="${item.id}"></button>`;$('shop-items').append(row);row.querySelector('button').onclick=()=>{if(purchase(s,item.id)){equip();render();save();say('ของขวัญชิ้นนี้น่ารักจัง ♡');}};}
$('remove-hat').onclick=()=>{s.hat='none';equip();render();save();};
for(const c of CROPS){const option=document.createElement('option');option.value=c.id;option.textContent=`${c.icon} ${c.name} · ${c.seconds} วินาที`;if(!c.paddy)$('crop-choice').append(option);const row=document.createElement('div');row.className='crop-row';row.innerHTML=`<span class="crop-icon">${c.icon}</span><div><strong>${c.name}</strong><small id="stock-${c.id}"></small></div><button data-seed="${c.id}" aria-label="ซื้อเมล็ด${c.name}">+ เมล็ด ✦${c.seed}</button><button data-sell="${c.id}" aria-label="ขาย${c.name}ทั้งหมด"></button>`;row.querySelector('[data-seed]').onclick=()=>{if(buySeed(s,c.id)){render();save();say(`ได้เมล็ด${c.name}เพิ่มแล้ว 🌱`);}};row.querySelector('[data-sell]').onclick=()=>{const earned=sellProduce(s,c.id);if(earned){render();save();say(`ขาย${c.name}ได้ ${earned} เหรียญ ✦`);}};$('crop-shop').append(row);}
$('crop-choice').onchange=e=>selectedCrop=e.target.value;
PLOTS.forEach(p=>{const b=document.createElement('button');b.dataset.plot=p.id;b.onclick=()=>plotAction(p.id);$('plots').append(b);});
function render(){
 syncClock(s);
 if($('wash-dishes'))$('wash-dishes').disabled=!s.daily.dirtyDishes;
 townPlay?.render();farm?.render();daily?.render();living?.render();homeLife?.render();
 $('queue-count').textContent=actionQueue.length;queuePanel.hidden=!actionQueue.length;
 const rows=$('queue-items');rows.replaceChildren();actionQueue.forEach((item,i)=>{const row=document.createElement('div');row.className='leisure-actions';const text=document.createElement('span');text.textContent=(i+1)+'. '+item.action;const remove=document.createElement('button');remove.textContent='×';remove.setAttribute('aria-label','ยกเลิก '+item.action);remove.onclick=()=>{actionQueue.splice(i,1);render();};row.append(text,remove);rows.append(row);});
 for(const key of NEEDS){$(key+'-bar').value=s[key];$(key+'-value').textContent=Math.round(s[key])+' / 100';}
 $('coins').textContent=s.coins;$('best').textContent=s.best;$('sleep-label').textContent=task?.id==='bed'?'ปลุกน้อง':'เข้านอน';$('location').textContent=roomAt(s.position);const moodRoot=$('moodlets');if(moodRoot){moodRoot.replaceChildren();for(const m of moodlets(s)){const row=document.createElement('div');row.className=`moodlet ${m.type}`;row.innerHTML=`<span>${m.icon}</span><div><strong>${m.name}</strong><small>${m.text}</small></div>`;moodRoot.append(row);}const plan=scheduleFor(s);$('schedule-label').textContent=plan.label;$('schedule-reason').textContent=plan.reason;}$('auto-life').setAttribute('aria-pressed',String(s.autoLife));$('auto-life').textContent=s.autoLife?'✦ ใช้ชีวิตเอง · เปิด':'✦ ใช้ชีวิตเอง · ปิด';
 const hour=Math.floor(s.minute/60),minute=Math.floor(s.minute%60);$('clock').textContent=`${hour>=6&&hour<18?'☀':'☾'} วันที่ ${s.day} · ${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`;$('weather-label').textContent=`${weatherFor(s.day).icon} ${weatherFor(s.day).name}`;
 $('activity-title').textContent=task?`${task.manual?'':'น้องเลือกเอง · '}${task.phase==='exiting'?'กำลังเก็บของและลุกขึ้น':task.phase==='walking'?'กำลังเดินไป':task.action} ${task.phase==='walking'?task.name:''}`:'กำลังพักผ่อน';$('activity-detail').textContent=task?task.phase==='walking'?(task.reason||'เลือกกิจกรรมเพิ่มเพื่อเข้าคิวถัดไป'):`${task.reason?task.reason+' · ':''}${task.detail??task.action} · อีก ${Math.ceil(task.remaining)} วินาที`:'แตะพื้นเพื่อเดิน หรือเลือกกิจกรรม';$('cancel-action').hidden=!task;$('activity-progress').hidden=!task||task.phase==='walking';$('activity-progress').value=task?.duration?100*(1-task.remaining/task.duration):0;
 document.querySelectorAll('#time-controls [data-speed]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.speed)===s.timeScale)));
 for(const item of ITEMS){const b=document.querySelector(`[data-buy="${item.id}"]`),owned=s.owned.includes(item.id),selected=item.kind==='hat'?s.hat===item.id:item.kind==='rug'?s.rug===item.id:s.lamp;b.textContent=selected?(item.kind==='lamp'?'ปิดไฟ':'ใช้อยู่'):owned?'เลือกใช้':`✦ ${item.price}`;b.disabled=!owned&&s.coins<item.price;b.classList.toggle('equipped',selected);}
 $('remove-hat').disabled=s.hat==='none';
 for(const c of CROPS){$(`stock-${c.id}`).textContent=`เมล็ด ${s.seeds[c.id]} · ผลผลิต ${s.produce[c.id]} · ขายชิ้นละ ${c.price}`;document.querySelector(`[data-seed="${c.id}"]`).disabled=s.coins<c.seed;const b=document.querySelector(`[data-sell="${c.id}"]`);b.disabled=!s.produce[c.id];b.textContent=`ขาย ✦${s.produce[c.id]*c.price}`;}
 PLOTS.forEach(p=>{const state=s.plots[p.id],c=CROPS.find(c=>c.id===state?.crop);const b=document.querySelector(`[data-plot="${p.id}"]`);b.innerHTML=`<span>${c?.icon??'🌱'}</span><strong>แปลง ${p.id+1} · ${c?.name??'ปลูก'}</strong><small>${plotStatus(state)}</small>`;b.classList.toggle('ready',!!state&&state.growth>=c.seconds);});
}
const game=setupCookieGame(s,{pause:()=>{},resume:()=>{manualUntil=Date.now()+18000;},changed:()=>{render();save();},say});
townPlay=setupTownPlay(s,{start,changed:()=>{render();save();},say,followTrip,getPosition:()=>s.position,getNeighborPosition:id=>town.neighborPosition(id),holdNeighbor:id=>town.hold(id)});
farm=setupFarm(s,house,{start,changed:()=>{render();save();},say});
furniture=setupFurniture(s,house,{cancel,beforeEdit:()=>new Promise(resolve=>{if((d.worldTimeScale?.()??1)===0){cancel();resolve();}else leaveActivity(()=>{cancel();resolve();});}),afterEdit:nextQueued,changed:()=>{render();save();},busy:()=>game.open||townPlay.open,focus});

daily=setupDailyLife(s,d,house,actor,{start,say,changed:()=>{render();save();},getPosition:()=>s.position,focus});
living=setupLiving(s,d,house,actor,town,{start,cancel,getTask:()=>task,useFixture,meal:(manual,reason)=>daily.cook(undefined,manual,reason),chat:(id,manual,reason)=>townPlay.talkTo(id,manual,reason),say,save,focus});
homeLife=setupHomeLife(s,d,house,actor,{start,say,save,getTask:()=>task,dine:(id)=>daily.dine(id,true,true)});
setupLivingCamera(d,()=>[...house.targets,...town.targets,...daily.targets],focus,()=>{follow=false;$('camera-follow').setAttribute('aria-pressed','false');});
const closet=document.createElement('dialog');closet.id='closet-dialog';closet.setAttribute('aria-label','ตู้เสื้อผ้าของลาเต้');closet.innerHTML='<h2>ตู้เสื้อผ้าของลาเต้</h2><p>เลือกชุดและหมวกได้เลย · บันทึกให้ทันที</p><label>ชุด <select id="clothes-choice"><option value="sage">เอี๊ยมใบชา</option><option value="rose">เอี๊ยมชมพู</option><option value="denim">เอี๊ยมยีนส์</option><option value="cream">เอี๊ยมครีม</option><option value="none">ไม่ใส่เอี๊ยม</option></select></label><label>หมวก <select id="hat-choice"></select></label><button id="close-closet">แต่งตัวเสร็จแล้ว</button>';document.body.append(closet);$('clothes-choice').replaceChildren(...OUTFITS.map(([id,name])=>new Option(name,id)));
function openWardrobe(){$('clothes-choice').value=s.clothes;const hats=[['none','ไม่ใส่หมวก'],['cap','หมวกแก๊ปสีฟ้า'],...['sage','rose'].filter(id=>s.owned.includes(id)).map(id=>[id,id==='sage'?'หมวกใบชา':'หมวกชมพู'])];$('hat-choice').replaceChildren(...hats.map(([value,name])=>new Option(name,value)));$('hat-choice').value=s.hat;closet.showModal();}
$('close-closet').onclick=()=>closet.close();$('clothes-choice').onchange=e=>{if(s.clothes!==e.target.value)s.home.laundry=Math.min(6,s.home.laundry+1);s.clothes=e.target.value;equip();save();};$('hat-choice').onchange=e=>{s.hat=e.target.value;equip();render();save();};
const leisure=document.createElement('details');leisure.className='panel';leisure.open=false;leisure.innerHTML='<summary><span>☕ เวลาของลาเต้</span><small>ผ่อนคลาย · แสดงอารมณ์ · แต่งตัว</small></summary><div class="leisure-actions"></div>';document.querySelector('.mood-panel').after(leisure);
const moments=[['stretch','บิดขี้เกียจ','Idle','Happy'],['lookaround','มองรอบบ้าน','Idle','Wide'],['hum','ฮัมเพลง','Sing','Happy'],['cheer','เต้นดีใจ','Dance','Laugh']];
function moment(id,manual=true){const m=moments.find(m=>m[0]===id);return start({id:m[0],name:m[1],action:m[1],anchor:{...s.position},mode:m[2],emotion:m[3],duration:7,effects:{joy:5},message:'ได้พักสักหน่อยแล้ว ♡'},manual);}
for(const [id,name] of moments){const b=document.createElement('button');b.textContent=name;b.onclick=()=>moment(id);leisure.lastChild.append(b);}const dress=document.createElement('button');dress.textContent='👕 เปิดตู้เสื้อผ้า';dress.onclick=openWardrobe;leisure.lastChild.append(dress);

const ray=new T.Raycaster();let down=null;const canvas=d.renderer.domElement;
canvas.setAttribute('role','application');canvas.setAttribute('aria-label','ฉากบ้านของลาเต้ แตะพื้นเพื่อเดิน แตะเฟอร์นิเจอร์เพื่อทำกิจกรรม');
const freeCamera=()=>{follow=false;$('camera-follow').setAttribute('aria-pressed','false');};canvas.addEventListener('wheel',freeCamera,{passive:true});
canvas.addEventListener('pointerdown',e=>{if(e.button!==0||!e.isPrimary){down=null;freeCamera();return;}down={x:e.clientX,y:e.clientY};});canvas.addEventListener('pointercancel',()=>down=null);
canvas.addEventListener('pointerup',e=>{if(e.button!==0||!down)return;const moved=Math.hypot(e.clientX-down.x,e.clientY-down.y);down=null;if(moved>7||game.open)return;const rect=canvas.getBoundingClientRect();ray.setFromCamera(new T.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),d.camera);const hits=ray.intersectObjects([...house.targets,...town.targets,...daily.targets,d.model,...house.floors,...town.floors],true);const hit=hits.find(h=>{for(let node=h.object;node;node=node.parent)if(!node.visible)return false;return true;});if(!hit)return;let o=hit.object;while(o){if(o.userData.homeAction){if(o.userData.homeAction==='clothesline')radialMenu('ราวตากผ้า',[{label:'👕 ซักและตาก',run:()=>homeLife.act('laundry')},{label:'🧺 เก็บผ้า',run:()=>homeLife.act('collect')}]);else radialMenu('ดูแลบ้าน',[{label:{window:'🪟 เปิด / ปิด',laundry:'👕 ซักผ้า',mop:'🧽 เช็ดพื้น'}[o.userData.homeAction],run:()=>homeLife.act(o.userData.homeAction)}]);return;}if(o.userData.daily){if(o.userData.daily==='fish')daily.fish();else {const ready=Object.entries(s.daily.dishes).find(([,n])=>n>0);if(ready)daily.dine(ready[0]);else daily.cook();}return;}if(o.userData.wardrobe){openWardrobe();return;}if(o.userData.paddy!==undefined){farm.act(o.userData.paddy);return;}if(o.userData.town){townPlay.visit(o.userData.town);return;}if(o.userData.fixture){if(furniture.open)furniture.select(o.userData.fixture);else showObjectMenu(o.userData.fixture);return;}if(o.userData.plot!==undefined){plotAction(o.userData.plot);return;}if(o===d.model){showActorMenu();return;}o=o.parent;}const p={x:hit.point.x,z:hit.point.z};if(walkable(p))start({id:'walk',name:roomAt(p),action:'เดิน',anchor:p,duration:0});else say('เลือกพื้นว่างที่เดินถึงได้เลยนะ');});
d.setWorldFrame((dt,time)=>{if(document.hidden)return;syncClock(s);if(dt>0){advance(s,dt/(s.timeScale||1),{clock:false,rate:1/60});saveElapsed+=dt;if(saveElapsed>=10){save();saveElapsed=0;}}
 if(dt>0&&task?.phase==='walking'&&task.neighborId){const p=town.neighborPosition(task.neighborId);if(p){task.look=p;if(Math.hypot(p.x-actor.position.x,p.z-actor.position.z)<1.8){task.anchor={x:actor.position.x,z:actor.position.z};task.path=[];}else if((task.repath??0)<=time){task.repath=time+.5;const candidates=[{x:p.x,z:p.z-1.2},{x:p.x-1.2,z:p.z},{x:p.x+1.2,z:p.z},{x:p.x,z:p.z+1.2}];for(const dest of candidates){const path=findPath({x:actor.position.x,z:actor.position.z},dest);if(path){task.anchor=dest;task.path=path;break;}}}}}
 if(task?.phase==='walking'){const walkingPace=s.energy<35?.62:s.joy<30?.82:1;d.clips.Walk_Test?.setEffectiveTimeScale(walkingPace);let travel=dt*1.7*walkingPace;while(travel>0&&task?.path.length){const p=task.path[0],dx=p.x-actor.position.x,dz=p.z-actor.position.z,dist=Math.hypot(dx,dz);actor.rotation.set(0,Math.atan2(dx,dz),0);if(dist<=travel){actor.position.set(p.x,0,p.z);task.path.shift();travel-=dist;}else{actor.position.x+=dx/dist*travel;actor.position.z+=dz/dist*travel;travel=0;}}syncPosition();if(dt>0&&task&&!task.path.length)begin();}
 else if(task?.phase==='doing'){task.remaining-=dt;if(task.remaining<=0)leaveActivity(complete);}
 if(follow){const target=new T.Vector3(actor.position.x,.5,actor.position.z),delta=target.clone().sub(d.controls.target).multiplyScalar(1-Math.exp(-dt*5));d.controls.target.add(delta);d.camera.position.add(delta);}
 house.update(s,time,task);town.world.traverse(o=>{if(o.userData.overviewLabel)o.visible=!document.body.classList.contains('immersive')&&d.camera.position.distanceTo(d.controls.target)>20;});town.update(time,s.minute,s.friendship,task,actor);const townEvent=town.consumeEvent();if(townEvent)remember(s,'town',townEvent.text,townEvent.event);farm.update(time);uiElapsed+=dt;if(uiElapsed>.4){render();uiElapsed=0;}if(dt>0){nextQueued();runAuto();}
});
d.setPoseFrame((dt,time)=>{if(dt<=0)return;
 if(exitMotion){
  const exit=exitMotion;exit.elapsed+=dt;const a=T.MathUtils.smoothstep(exit.elapsed,0,.8);
  d.samplePose('Idle',.2);
  for(const [b,p,q]of exit.bones){b.position.lerpVectors(p,b.position.clone(),a);b.quaternion.slerpQuaternions(q,b.quaternion.clone(),a);}
  actor.position.lerpVectors(exit.position,new T.Vector3(task.anchor.x,0,task.anchor.z),task.id==='fridge'?T.MathUtils.smoothstep(a,.45,1):a);
  d.root.quaternion.slerpQuaternions(exit.root,new T.Quaternion(),a);
  motion.leave(a);daily?.leave(a,exit.finished);living?.leave(a);homeLife?.leave(a);
  if(a===1){exitMotion=null;exit.callback();}
  return;
 }
 motion.update(task);daily?.update(s,task,dt);living?.update(task,dt,time);homeLife?.update(s,task,dt,time);motion.contacts(task,true);
});
function tick(){lastTick=Date.now();if(!document.hidden){syncClock(s);render();}}
setInterval(tick,1000);
addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{tick();if(document.hidden){save();}else{manualUntil=Date.now()+5000;nextQueued();}});
// A read-only snapshot supports diagnostics without allowing UI tests to mutate the game.
window.latteHome={snapshot:()=>JSON.parse(JSON.stringify({state:s,queue:actionQueue.map(x=>x.id),task:task?{id:task.id,phase:task.phase,manual:task.manual,remaining:task.remaining}:null,actor:{x:actor.position.x,y:actor.position.y,z:actor.position.z},mode:d.mode,paused:(d.worldTimeScale?.()??1)===0,audioReady:living?.audio.ready??false}))};
const pauseNotice=document.createElement('div');pauseNotice.id='pause-notice';pauseNotice.hidden=true;pauseNotice.innerHTML='<span></span><button>เล่นต่อในมุมนี้</button>';$('stage').after(pauseNotice);
const closePauseLabel=document.createElement('label');closePauseLabel.innerHTML='<input type="checkbox" id="pause-closeup"> พักเวลาเมื่อซูมใกล้';document.querySelector('.view-panel').append(closePauseLabel);$('pause-closeup').checked=s.home.autoPauseClose;$('pause-closeup').onchange=e=>{s.home.autoPauseClose=e.target.checked;save();};pauseNotice.querySelector('button').onclick=()=>{s.home.autoPauseClose=false;$('pause-closeup').checked=false;save();};
d.worldTimeScale=()=>{const close=s.home.autoPauseClose&&d.camera.position.distanceTo(d.controls.target)<3.5,menu=!!document.querySelector('dialog[open]')||furniture?.open||!$('object-menu').hidden||$('decor-panel')?.open;pauseNotice.hidden=!close&&!menu&&s.timeScale!==0;pauseNotice.querySelector('span').textContent=menu?'พักเวลา · เปิดเมนูอยู่':close?'พักเวลา · ดูน้องใกล้ ๆ':'หยุดเวลา';pauseNotice.querySelector('button').hidden=!close||menu;const scale=document.hidden||close||menu?0:s.timeScale;living?.audio.setPaused(scale===0);return scale;};
s.sleeping=false;equip();pose('Idle');render();save();$('greeting').textContent='บ้าน สวน ครัวขนม และเมืองใบชาของเรา';say('ยินดีต้อนรับกลับบ้าน 🌿 แตะพื้นให้เราเดินได้เลย');
