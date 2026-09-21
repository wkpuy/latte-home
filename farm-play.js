import * as T from 'three';
import {PADDIES,RICE,expandFarm,plantRice,waterRice,harvestRice,riceAction,nextFarmAction} from './farm-state.js?v=contact21';
export function setupFarm(s,house,{start,changed,say}){
 const panel=document.createElement('details');panel.open=false;panel.id='rice-panel';panel.className='panel';panel.innerHTML='<summary><span>🌾 นาข้าวหลังบ้าน</span><small>ปลูกข้าว → ทำขนม → ส่งออเดอร์</small></summary><p class="panel-note">แปลงแรกพร้อมปลูกแล้ว ข้าวโต 3 นาทีเมื่อมีน้ำ เติมน้ำครั้งละ 90 วินาที · เก็บได้ 3 หน่วย</p><div id="rice-plots"></div><button id="expand-farm">ขยายนาแปลงที่ 2 · ✦60</button><button id="auto-farm" aria-pressed="false">ดูแลนาเอง · ปิด</button><p class="panel-note" id="rice-summary"></p><p class="panel-note">ดูแลนาเองต้องเปิด “ใช้ชีวิตเอง” ด้วย น้องจะปลูก เติมน้ำ และเก็บเกี่ยวหลังดูแลความต้องการของตัวเอง ไม่ซื้อเมล็ดหรือใช้เงินเอง</p>';
 document.getElementById('garden-panel').before(panel);
 const $=id=>document.getElementById(id),views=[],materials=new Map();
 const mat=color=>{if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color,roughness:.85}));return materials.get(color);};
 function box(g,w,h,d,color,x,y,z){const o=new T.Mesh(new T.BoxGeometry(w,h,d),mat(color));o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
 for(const p of PADDIES){const g=new T.Group();g.position.set(p.x,0,p.z);g.userData.paddy=p.id;house.world.add(g);house.targets.push(g);
  box(g,2,.09,1.3,'#857052',0,.015,0);for(const x of [-1,1])box(g,.09,.14,1.38,'#b3a078',x,.05,0);for(const z of [-.65,.65])box(g,2.08,.14,.09,'#b3a078',0,.05,z);
  const water=box(g,1.91,.015,1.2,'#a0c8c1',0,.07,0),crops=new T.Group();g.add(crops);water.visible=false;
  const sign=new T.Group();g.add(sign);sign.position.set(0,0,0);box(sign,.06,.58,.06,'#a38966',0,.3,0);box(sign,.65,.3,.045,'#e7d5af',0,.58,0);
  views.push({g,water,crops,sign,signature:''});const b=document.createElement('button');b.dataset.paddy=p.id;b.onclick=()=>act(p.id);$('rice-plots').append(b);
 }
 $('expand-farm').onclick=()=>{if(expandFarm(s)){changed();say('นาแปลงที่สองพร้อมแล้ว ปลูกข้าวเพิ่มกัน 🌾');}};
 $('auto-farm').onclick=()=>{s.farm.auto=!s.farm.auto;changed();};
 function act(i,manual=true){const action=riceAction(s,i),p=PADDIES[i];if(action==='locked'){say('ขยายนาแปลงที่สองจากแผงนาข้าวได้เลย · 60 เหรียญ');return false;}if(action==='growing'){say('ข้าวกำลังโต รอรวงเป็นสีทองก่อนนะ 🌾');return false;}if(action==='plant'&&!s.seeds.rice){say('เมล็ดข้าวหมดแล้ว ซื้อที่ร้านเมล็ดก่อนนะ');return false;}
  return start({id:action,rice:true,name:`นาแปลง ${i+1}`,action:{plant:'ปักดำข้าว',water:'เติมน้ำเข้านา',harvest:'เกี่ยวข้าว'}[action],anchor:p.anchor,look:p,mode:'Idle',duration:4,complete:()=>({plant:plantRice,water:waterRice,harvest:harvestRice}[action])(s,i),message:{plant:'ปักดำแล้ว เติมน้ำให้น้องข้าวด้วยนะ 🌱',water:'เติมน้ำแล้ว ข้าวจะโตต่ออีก 90 วินาที 💧',harvest:'เก็บข้าว 3 หน่วยแล้ว ทำคุกกี้ข้าวหอมกัน 🌾'}[action]},manual);
 }
 function render(){for(const p of PADDIES){const a=riceAction(s,p.id),v=s.farm.paddies[p.id],b=document.querySelector(`[data-paddy="${p.id}"]`),labels={locked:'ยังไม่เปิด · ขยายก่อน',plant:'ปักดำข้าว · ใช้ 1 เมล็ด',water:'เติมน้ำให้นา',harvest:'เกี่ยวข้าว · ได้ 3 หน่วย',growing:`กำลังโต · อีก ${Math.ceil(RICE.seconds-(v?.growth??0))} วินาที`};b.innerHTML=`<strong>${a==='harvest'?'🌾':'🌱'} นาแปลง ${p.id+1}</strong><span>${labels[a]}</span><small>${v?`โต ${Math.floor(v.growth/RICE.seconds*100)}% · น้ำเหลือ ${Math.ceil(v.water)} วินาที`:'ดินพร้อมสำหรับต้นข้าว'}</small>`;b.classList.toggle('ready',a==='harvest');b.disabled=a==='locked';}
 $('expand-farm').disabled=s.farm.unlocked===2||s.coins<60;$('expand-farm').textContent=s.farm.unlocked===2?'ขยายนาครบ 2 แปลงแล้ว':'ขยายนาแปลงที่ 2 · ✦60';$('auto-farm').setAttribute('aria-pressed',String(s.farm.auto));$('auto-farm').textContent=`ดูแลนาเอง · ${s.farm.auto?s.autoLife?'เปิด':'รอเปิดใช้ชีวิตเอง':'ปิด'}`;$('rice-summary').textContent=`เมล็ดข้าว ${s.seeds.rice} · ข้าวในกระเป๋า ${s.produce.rice} · เคยเก็บแล้ว ${s.farm.harvested} หน่วย`;
 }
 function update(time){views.forEach((v,i)=>{const p=s.farm.paddies[i],stage=!p?0:p.growth>=180?3:p.growth>=80?2:1,sig=`${stage}:${i<s.farm.unlocked}`;v.water.visible=!!p&&p.water>0;v.sign.visible=i>=s.farm.unlocked;v.water.position.y=.071+Math.sin(time)*.002;
  if(sig!==v.signature){v.signature=sig;for(const o of [...v.crops.children]){v.crops.remove(o);o.traverse(c=>c.geometry?.dispose());}if(stage){for(let x=-.65;x<=.65;x+=.43)for(let z=-.38;z<=.4;z+=.38){const tuft=new T.Group();tuft.position.set(x,.09,z);v.crops.add(tuft);const h=.12+stage*.12,color=stage===3?'#cfb461':'#88a369';for(let j=-1;j<=1;j++){const stalk=box(tuft,.025,h,.025,color,j*.065,h/2,0);stalk.rotation.z=j*.2;const leaf=box(tuft,.03,h*.65,.014,stage===3?'#bbac60':'#9ab375',j*.09,h*.57,.03);leaf.rotation.z=j*.65+.25;}if(stage===3)for(let k=0;k<4;k++){const grain=new T.Mesh(new T.SphereGeometry(.035,6,4),mat('#e3c575'));grain.scale.set(1,1.55,1);grain.position.set(.04+k*.025,h-.015-k*.03,.035);tuft.add(grain);}}}}
  v.crops.children.forEach((o,j)=>o.rotation.z=Math.sin(time*1.7+j)*.035);
 });}
 return {render,update,act,runAuto:()=>{const i=nextFarmAction(s);return i>=0&&act(i,false);}};
}
