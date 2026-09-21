import * as T from 'three';
import {ROOMS,WALLS,FIXTURES,PLOTS} from './house-layout.js?v=contact21';
import {CROPS} from './room-state.js?v=contact21';
import {weatherFor,sunPhase} from './weather-state.js?v=contact21';

export function createHouse(d){
 // Retain the rig, its attached accessories and studio lighting.
 for(const child of [...d.scene.children])if(child.isMesh){d.scene.remove(child);child.geometry.dispose();const materials=Array.isArray(child.material)?child.material:[child.material];materials.forEach(m=>m.dispose());}
 const world=new T.Group();d.scene.add(world);const targets=[],floors=[],cropGroups=[];
 const materials=new Map();
 function material(color){if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color,roughness:.88}));return materials.get(color);}
 function box(w,h,depth,color,x,y,z,parent=world){const m=new T.Mesh(new T.BoxGeometry(w,h,depth),material(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function round(w,h,depth,color,x,y,z,parent=world){const m=new T.Mesh(new T.SphereGeometry(1,20,12),material(color));m.scale.set(w/2,h/2,depth/2);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function label(text,x,y,z,size=.38,color='#655746'){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;const c=canvas.getContext('2d');c.fillStyle=color;c.font='500 40px Thonburi, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(text,256,48);
  const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;const sprite=new T.Sprite(new T.SpriteMaterial({map:tex,depthWrite:false,depthTest:true,transparent:true}));sprite.position.set(x,y,z);sprite.scale.set(size*5.3,size,1);sprite.userData.overviewLabel=true;world.add(sprite);return sprite;
 }
 const paint=(o,key)=>{o.userData.decorKey=key;o.material=o.material.clone();return o;};
 const land=box(12,.28,13,'#acbd98',0,-.26,1.5);floors.push(land);
 box(10.25,.22,7.25,'#b39575',0,-.17,-.5);
 for(const r of ROOMS){const floor=paint(box(5,.09,3.5,r.color,r.x,-.025,r.z),'floor');floors.push(floor);label(r.name,r.x,.09,r.z+1.18,.29);}
 // Fine floorboards and bathroom tiles give each room a distinct surface.
 for(let x=-4.75;x<0;x+=.5)box(.013,.012,6.8,'#d4bea6',x,.025,-.5);
 for(let x=.3;x<5;x+=.6)for(let z=-3.7;z<-.5;z+=.6)paint(box(.55,.013,.55,'#e2eee8',x,.03,z),'floor');
 WALLS.forEach(([a,b,c,e],i)=>{const h=i===2?1.65:i===0?.8:i===1?.35:i>=9?.16:.35;paint(box(b-a,h,e-c,i===2?'#e8decb':'#c7b9a0',(a+b)/2,h/2,(c+e)/2),'wall');box(b-a+.04,.055,e-c+.035,'#f9f1dd',(a+b)/2,h+.015,(c+e)/2);});
 // Windows, artwork and two small bedside plants.
 for(const x of [-2.1,2.1]){box(1.6,.8,.07,'#a68e70',x,1.1,-3.9);box(1.44,.66,.08,'#bdd9d7',x,1.1,-3.85);box(.04,.66,.09,'#fff4dd',x,1.1,-3.8);box(1.44,.04,.09,'#fff4dd',x,1.1,-3.8);}
 function plantPot(x,z){box(.35,.35,.35,'#c99779',x,.18,z);for(let i=0;i<5;i++)round(.5,.45,.3,'#7e9871',x+Math.sin(i*2)*.15,.5+(i%2)*.2,z+Math.cos(i*2)*.12);}
 plantPot(-4.6,2.5);plantPot(.55,-3.5);
 const wardrobe=new T.Group();wardrobe.name='wardrobe';wardrobe.userData.wardrobe=true;world.add(wardrobe);targets.push(wardrobe);wardrobe.position.set(-.8,0,-3.7);box(1.1,1.45,.45,'#b89b7a',0,.725,0,wardrobe);for(const x of [-.27,.27]){box(.51,1.35,.035,'#e4ceac',x,.725,.245,wardrobe);round(.065,.065,.05,'#8b7257',x*.3,.72,.28,wardrobe);}
 const fixtureGroups={};
 for(const f of FIXTURES){const g=new T.Group();g.position.set(f.x,0,f.z);world.add(g);g.userData.fixture=f.id;fixtureGroups[f.id]=g;targets.push(g);
  if(f.id==='bed'){
   box(1.65,.25,2,'#b99579',0,.2,0,g);box(1.61,.2,1.98,'#fcf4de',0,.42,0,g);paint(box(1.62,.18,1.3,'#bca5ac',0,.55,.32,g),'bed');round(1.28,.22,.47,'#fffbec',0,.59,-.65,g);box(1.7,.9,.13,'#b99579',0,.45,-1,g);
  }else if(f.id==='sofa'){
   box(2.1,.28,.85,'#7f9a88',0,.28,0,g);round(1.8,.24,.82,'#a0b49b',0,.49,.04,g);box(2.1,.65,.18,'#829a88',0,.64,-.36,g);for(const x of [-.96,.96])round(.3,.65,.95,'#9aad94',x,.5,0,g);round(.42,.46,.23,'#e3b394',.45,.76,-.16,g);
  }else if(f.id==='fridge'){
   box(.95,1.55,.9,'#f4eedf',0,.78,0,g);box(.83,.018,.016,'#c4c7b6',0,1.05,.46,g);box(.05,.32,.06,'#b39c7e',-.3,1.28,.5,g);box(.05,.4,.06,'#b39c7e',-.3,.73,.5,g);box(.18,.2,.02,'#e2b795',.15,1.25,.47,g);
  }else if(f.id==='counter'){
   box(1.9,.8,.85,'#a9b7a2',0,.4,0,g);box(2,.1,.94,'#f5ead1',0,.84,0,g);for(const x of [-.45,.45])box(.65,.04,.03,'#e4dac4',x,.66,.45,g);round(.45,.17,.4,'#d1a27d',.35,.97,0,g);round(.3,.12,.28,'#fbebbd',.35,1.02,0,g);
  }else if(f.id==='sink'){
   box(1.25,.7,.7,'#b3c6bc',0,.35,0,g);box(1.32,.12,.78,'#faf7e9',0,.76,0,g);round(.8,.06,.5,'#afd5d5',0,.83,.04,g);box(.055,.33,.055,'#a69d84',0,.95,-.23,g);box(.055,.05,.23,'#a69d84',0,1.1,-.14,g);
  }else{
   box(1.3,.12,1.4,'#f7f6e8',0,.06,0,g);box(1.3,1.5,.08,'#a8c5ba',0,.8,-.65,g);box(.05,1.2,.05,'#bda785',0,1,-.5,g);box(.05,.05,.5,'#bda785',0,1.6,-.27,g);round(.4,.05,.4,'#c8b794',0,1.57,-.02,g);
  }
 }
 const rug=new T.Mesh(new T.CylinderGeometry(1.13,1.13,.02,48),new T.MeshStandardMaterial({color:'#c5cfb0'}));rug.position.set(-2.6,.043,1.7);rug.scale.z=.7;rug.receiveShadow=true;world.add(rug);rug.userData.decorKey='rug';
 // A winding garden path and raised beds, kept clear for walking.
 for(let z=3.3;z<6.8;z+=.6)box(.75,.018,.42,'#dfd6ba',-.15,.002,z);
 for(const p of PLOTS){const g=new T.Group();g.position.set(p.x,0,p.z);g.userData.plot=p.id;world.add(g);targets.push(g);box(.91,.17,.91,'#b58d67',0,.03,0,g);const soil=box(.8,.04,.8,'#80654d',0,.13,0,g);const crops=new T.Group();g.add(crops);cropGroups.push({crops,soil,signature:''});label(String(p.id+1),p.x,.24,p.z+.35,.18,'#fff5df');}
 for(let x=-5.5;x<=5.5;x+=.55){if(Math.abs(x)<.85)continue;box(.12,.55,.1,'#eee5cf',x,.1,7.2);}
 for(const x of [-3.2,3.2]){box(4.6,.07,.1,'#eee5cf',x,.2,7.2);box(4.6,.07,.1,'#eee5cf',x,-.01,7.2);}
 label('L A T T E ’ S  G A R D E N',2.8,.2,3.35,.25);
 for(const [x,z] of [[-5.6,-3.5],[-5.65,5.8],[5.6,-3.8]]){box(.2,1.2,.2,'#ad9172',x,.35,z);round(1.35,1.65,1.4,'#91a781',x,1.2,z);round(1,.95,1,'#b0be91',x+.25,1.6,z);}
 const lamp=new T.Group();world.add(lamp);lamp.position.set(-4.7,0,-.95);box(.3,.06,.3,'#b99f76',0,.03,0,lamp);box(.04,1.25,.04,'#b99f76',0,.65,0,lamp);round(.47,.47,.47,'#fff1bf',0,1.3,0,lamp);const glow=new T.PointLight('#ffd996',1,7,2);glow.position.y=1.3;lamp.add(glow);
 const warmLights=[],lightFixtures=[];for(const r of ROOMS){const bulb=round(.2,.18,.15,'#fff5cf',r.x,1.4,r.z<0?-3.78:-.35);bulb.material=bulb.material.clone();lightFixtures.push(bulb);const l=new T.PointLight('#ffdcb2',0,7,2);l.name='room-light-'+r.id;l.position.set(r.x,1.9,r.z);world.add(l);warmLights.push(l);}
 const sky=new T.Group();world.add(sky);const sunOrb=new T.Mesh(new T.SphereGeometry(.42,20,12),new T.MeshBasicMaterial({color:'#ffe29a'}));const moonOrb=new T.Mesh(new T.SphereGeometry(.35,20,12),new T.MeshBasicMaterial({color:'#e8edf1'}));sky.add(sunOrb,moonOrb);
 const clouds=new T.Group();sky.add(clouds);for(const x of [-4,0,4]){const cloud=new T.Group();cloud.position.set(x,5.7,(x%2)*.8);round(2.1,.45,.8,'#d5d9d3',0,0,0,cloud);round(1.15,.5,.7,'#e0e3dc',-.7,.1,.02,cloud);round(1.35,.5,.75,'#e0e3dc',.65,.12,-.02,cloud);clouds.add(cloud);}
 const rain=new T.Group();sky.add(rain);for(let i=0;i<70;i++){const drop=box(.018,.34,.018,'#a9d5dc',(i%14-7)*.95,.5+(i%10)*.48,i%2?-4.7-(i%3)*.35:3.6+(i%7)*.6,rain);drop.userData.seed=i*.73;drop.castShadow=false;}rain.visible=false;
 const marker=new T.Mesh(new T.RingGeometry(.2,.26,40),new T.MeshBasicMaterial({color:'#fff7d1',side:T.DoubleSide}));marker.rotation.x=-Math.PI/2;marker.position.y=.08;marker.visible=false;world.add(marker);
 const bubbles=new T.Group();world.add(bubbles);for(let i=0;i<10;i++){const b=round(.1,.1,.1,'#dbf4ed',0,0,0,bubbles);b.userData.phase=i*2.3;}bubbles.visible=false;
 const hemi=d.scene.children.find(o=>o.isHemisphereLight),sun=d.scene.children.find(o=>o.isDirectionalLight);
 sun.position.set(-3,9,7);sun.shadow.camera.left=-8;sun.shadow.camera.right=8;sun.shadow.camera.top=8;sun.shadow.camera.bottom=-8;sun.shadow.camera.far=30;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.0003;
 d.camera.far=100;d.camera.updateProjectionMatrix();
 function update(s,time,activity){
  const overview=!document.body.classList.contains('immersive')&&d.camera.position.distanceTo(d.controls.target)>20;world.children.forEach(o=>{if(o.userData.overviewLabel)o.visible=overview;});
  const weather=weatherFor(s.day),phase=sunPhase(s.minute),daylight=phase.daylight;const orbit=phase.angle;sunOrb.position.set(Math.sin(orbit)*7,2+Math.max(0,Math.cos(orbit))*6,1);moonOrb.position.set(-sunOrb.position.x,2+Math.max(0,-Math.cos(orbit))*5,1);sunOrb.visible=daylight>.04;moonOrb.visible=daylight<.18;clouds.visible=weather.cloud>0;rain.visible=weather.rain>0;hemi.intensity=(weather.id==='rain'?.8:weather.id==='cloudy'?1:.1)+daylight*(weather.id==='clear'?1.9:.9);sun.intensity=(weather.id==='rain'?.08:weather.id==='cloudy'?.3:.18)+daylight*(weather.id==='clear'?1.15:.55);d.scene.background.set(weather.sky).lerp(new T.Color('#283344'),1-daylight);const night=1-daylight;warmLights.forEach((l,i)=>{const r=ROOMS[i],occupied=s.position.x>=r.x-2.5&&s.position.x<=r.x+2.5&&s.position.z>=r.z-1.75&&s.position.z<=r.z+1.75;l.intensity=occupied?night*5:0;lightFixtures[i].material.emissive.set('#ffd995');lightFixtures[i].material.emissiveIntensity=occupied?night*2:0;});glow.intensity=.8+(1-daylight);lamp.visible=s.lamp;rug.material.color.set(s.home?.decor.rug??(s.rug==='peach'?'#e3bca8':'#c5cfb0'));rain.children.forEach((o,i)=>{o.position.y=5.4-((time*2.3+i*.17)%5.7);o.rotation.z=.08;});
  PLOTS.forEach((p,i)=>{const state=s.plots[i],v=cropGroups[i],c=CROPS.find(c=>c.id===state?.crop),stage=!state?0:state.growth>=c.seconds?3:state.growth>c.seconds*.45?2:1;const sig=`${state?.crop}:${stage}:${state?.watered}`;if(sig===v.signature)return;v.signature=sig;for(const child of [...v.crops.children]){v.crops.remove(child);child.geometry.dispose();}v.soil.material=material(state?.watered?'#665643':'#80654d');if(!c)return;for(const [x,z] of [[-.2,-.2],[.2,.16],[-.17,.2]]){const h=.12+stage*.1;if(stage===3&&c.id!=='lettuce')round(.29,.27,.27,c.color,x,.23,z,v.crops);for(let n=0;n<3;n++){const leaf=round(.12,h,.09,c.id==='lettuce'?'#9cbf70':'#7f9d61',x+Math.sin(n*2)*.065,.2+h/2,z+Math.cos(n*2)*.06,v.crops);leaf.rotation.z=Math.sin(n*2)*.6;}}});
  bubbles.visible=false; // Interaction-local water and foam live in activity-motion.js.
 }
 return {world,targets,floors,fixtureGroups,marker,update};
}
