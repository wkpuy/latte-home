import * as T from 'three';
import {ROOMS,FIXTURES} from './house-layout.js?v=contact21';
import {FISHING_POND} from './pond-layout.js?v=contact21';
export function setupLivingCamera(d,targets,focus,releaseFollow=()=>{}){
 const bar=document.querySelector('.camera-tools'),stage=document.getElementById('stage');let previous=null,dragging=false,lastHover=0;
 const snapshot=()=>({position:d.camera.position.clone(),target:d.controls.target.clone(),fov:d.camera.fov});
 const back=document.createElement('button');back.id='camera-back';back.textContent='↶ มุมก่อนหน้า';back.disabled=true;bar.append(back);
 const save=()=>{previous=snapshot();back.disabled=false;};
 document.getElementById('room-nav').addEventListener('click',save,true);for(const id of ['camera-home','camera-focus','camera-follow','view-pond','view-aquarium'])document.getElementById(id)?.addEventListener('click',save,true);
 back.onclick=()=>{if(!previous)return;const next=snapshot();releaseFollow();d.camera.position.copy(previous.position);d.controls.target.copy(previous.target);d.camera.fov=previous.fov;d.camera.updateProjectionMatrix();d.controls.update();previous=next;};
 const select=document.createElement('select');select.id='quick-view';select.setAttribute('aria-label','ไปมุมห้อง');select.add(new Option('⌂ ไปมุม…',''));const views=[...ROOMS,{id:'garden',name:'สวน',x:0,z:5},{id:'pond',name:'บ่อตกปลา',x:FISHING_POND.x,z:FISHING_POND.z}];for(const v of views)select.add(new Option(v.name,v.id));select.onchange=()=>{const v=views.find(v=>v.id===select.value);if(v){save();focus(v.x,v.z);}select.value='';};bar.append(select);
 const hide=document.createElement('button');hide.id='hide-ui';hide.textContent='⛶ ดูเต็มจอ';bar.append(hide);const exit=document.createElement('button');exit.id='exit-immersive';exit.textContent='แสดงเมนู · Esc';exit.hidden=true;document.querySelector('.room').append(exit);
 function immersive(on){document.body.classList.toggle('immersive',on);exit.hidden=!on;hide.setAttribute('aria-pressed',String(on));}
 hide.onclick=async()=>{immersive(true);try{if(!document.fullscreenElement&&document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen({navigationUI:'hide'});}catch{/* Embedded browsers may deny fullscreen; the in-page immersive view still works. */}};
 async function leaveImmersive(){immersive(false);if(document.fullscreenElement)try{await document.exitFullscreen();}catch{}}
 exit.onclick=leaveImmersive;document.addEventListener('keydown',e=>{if(e.key==='Escape')leaveImmersive();});
 document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)immersive(false);});
 const hint=document.createElement('div');hint.id='object-hint';hint.hidden=true;hint.setAttribute('aria-hidden','true');stage.append(hint);const ray=new T.Raycaster(),canvas=d.renderer.domElement;
 canvas.addEventListener('pointerdown',()=>{dragging=true;hint.hidden=true;});window.addEventListener('pointerup',()=>dragging=false);canvas.addEventListener('pointerleave',()=>hint.hidden=true);
 canvas.addEventListener('pointermove',e=>{if(dragging||e.pointerType==='touch'||performance.now()-lastHover<65)return;lastHover=performance.now();const r=canvas.getBoundingClientRect();ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),d.camera);const hit=ray.intersectObjects(targets(),true).find(h=>{for(let o=h.object;o;o=o.parent)if(!o.visible)return false;return true;});let text='';for(let o=hit?.object;o;o=o.parent){if(o.userData.fixture){text=FIXTURES.find(f=>f.id===o.userData.fixture)?.action??'';break;}if(o.userData.daily){text=o.userData.daily==='fish'?'🎣 ตกปลา':'🍽️ กินอาหารที่โต๊ะ';break;}if(o.userData.wardrobe){text='👕 เปลี่ยนชุด';break;}if(o.userData.plot!==undefined){text='🌱 ดูแลแปลงผัก';break;}if(o.userData.town){text='☻ แวะคุย / เปิดร้าน';break;}}
 hint.hidden=!text;if(text){hint.textContent=text;hint.style.left=Math.max(8,Math.min(r.width-150,e.clientX-r.left+15))+'px';hint.style.top=Math.max(8,Math.min(r.height-40,e.clientY-r.top+16))+'px';}
 });return {save};
}
