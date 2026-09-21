import * as T from 'three';
import {TOWN_PLACES,NEIGHBORS} from './town-data.js?v=contact21';
import {findPath,walkable} from './house-layout.js?v=contact21';
import {npcRoutine} from './npc-state.js?v=contact21';
export function createTown(house){
 const world=new T.Group();house.world.add(world);const targets=[],floors=[],neighbors=[];
 const mats=new Map(),mat=c=>{if(!mats.has(c))mats.set(c,new T.MeshStandardMaterial({color:c,roughness:.9}));return mats.get(c);};
 function box(w,h,d,c,x,y,z,g=world){const o=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c));o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
 function ball(w,h,d,c,x,y,z,g=world){const o=new T.Mesh(new T.SphereGeometry(1,20,12),mat(c));o.position.set(x,y,z);o.scale.set(w/2,h/2,d/2);o.castShadow=true;g.add(o);return o;}
 function label(text,x,y,z,width=3,color='#65513e'){const canvas=document.createElement('canvas');canvas.width=768;canvas.height=128;const c=canvas.getContext('2d');c.fillStyle=color;c.textAlign='center';c.textBaseline='middle';c.font='500 46px Thonburi, sans-serif';c.fillText(text,384,64);const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;const s=new T.Sprite(new T.SpriteMaterial({map:tex,depthWrite:false,depthTest:true}));s.position.set(x,y,z);s.scale.set(width,width/6,1);s.userData.overviewLabel=true;world.add(s);return s;}
 floors.push(box(17,.22,11.3,'#b5c39a',0,-.17,12.8));
 floors.push(box(3,.035,10.5,'#e0cfb3',0,-.035,12.2));floors.push(box(15.5,.02,2,'#e3d7bf',0,-.04,12.7));floors.push(box(15.5,.04,1.2,'#e3d7bf',0,-.03,17.2));
 for(let z=7.7;z<18;z+=.6)for(const x of [-.85,0,.85])box(.78,.012,.51,'#ebe0c9',x,.008,z);
 // Open gate: the original garden fence is split around this path.
 for(const x of [-.95,.95]){box(.17,1.35,.17,'#d4bd98',x,.62,7.2);ball(.25,.25,.25,'#faf0d8',x,1.35,7.2);}label('เมืองใบชา',0,1.75,7.3,2.3);
 for(const place of TOWN_PLACES){const g=new T.Group();g.position.set(place.x,0,place.z);if(place.id==='bakery')g.rotation.y=Math.PI;world.add(g);g.name=`shop-${place.id}`;g.userData.town=place.id;targets.push(g);
  box(place.w+.1,.2,place.d+.1,'#c1a385',0,.05,0,g);
  if(place.id!=='bakery'){
   box(place.w,1.78,place.d,'#f0e5cc',0,1.05,0,g);box(place.w+.28,.2,place.d+.25,place.color,0,2.04,0,g);box(place.w+.45,.18,place.d+.45,place.color,0,2.2,0,g);
   box(.8,1.45,.06,'#b29a7f',.95,.85,place.d/2+.04,g);box(.61,1.12,.07,'#b5d1c8',.95,1,place.d/2+.08,g);ball(.06,.06,.06,'#f7edd4',1.2,.86,place.d/2+.14,g);
   box(1.8,1.02,.08,'#ad9476',-.85,1.02,place.d/2+.05,g);box(1.62,.85,.09,'#b9d4c8',-.85,1.02,place.d/2+.1,g);box(.05,.89,.1,'#fff2d9',-.85,1.02,place.d/2+.17,g);
  }
  // Striped shop awnings and a serving counter.
  for(let i=0;i<9;i++){const aw=box(place.w/9,.08,1.05,i%2?'#fff1dc':place.color,-place.w/2+(i+.5)*place.w/9,1.76,place.d/2-.22,g);aw.rotation.x=.13;box(place.w/9,.22,.08,i%2?'#fff1dc':place.color,aw.position.x,1.6,place.d/2+.3,g);}
  for(const x of [-place.w/2+.15,place.w/2-.15])box(.085,1.7,.085,'#ac9070',x,.85,place.d/2+.15,g);
  box(3,.64,.5,'#b59879',0,.36,place.d/2-.11,g);box(3.15,.07,.6,'#f3e1c0',0,.72,place.d/2-.11,g);
  for(let i=0;i<6;i++){if(place.id==='market'){box(.23,.33,.2,['#e7cc97','#c0c6a1','#e8e0c8'][i%3],-.95+i*.38,.9,place.d/2-.1,g);}else if(place.id==='seedShop'){box(.28,.33,.08,'#e5d7b5',-.95+i*.38,.91,place.d/2-.1,g);ball(.11,.16,.03,'#86a274',-.95+i*.38,.94,place.d/2-.05,g);}else{ball(.33,.18,.3,i%2?'#b78156':'#e3c390',-.95+i*.38,.86,place.d/2-.1,g);}}
  const sign=label(place.name,place.x,2.7,place.z,3.4);sign.userData.town=place.id;targets.push(sign);
 }
 // Town square fountain, park trees and flower borders.
 const base=new T.Mesh(new T.CylinderGeometry(.8,.9,.25,40),mat('#c8b69b'));base.position.set(0,.08,13.35);world.add(base);const water=new T.Mesh(new T.CylinderGeometry(.68,.68,.035,40),new T.MeshStandardMaterial({color:'#9bc9cd',roughness:.3}));water.position.set(0,.23,13.35);world.add(water);ball(.26,.56,.26,'#d9c7aa',0,.45,13.35);const spray=new T.Group();world.add(spray);for(let i=0;i<8;i++)ball(.04,.16,.04,'#d6eff0',0,0,0,spray);
 for(const [x,z] of [[-7.5,8.1],[7.4,8],[7.7,14.8],[2,17.4],[-7.5,17.4]]){box(.2,1.4,.2,'#b19573',x,.58,z);ball(1.3,1.8,1.3,'#8fa780',x,1.55,z);ball(.9,1,.9,'#afc095',x+.3,1.9,z);}
 for(let i=0;i<7;i++){ball(.18,.19,.18,i%2?'#dda6a0':'#f3d59d',1.7+i*.55,.16,17.5);}
 const board=new T.Group();world.add(board);board.position.set(0,0,17.6);board.userData.town='orders';targets.push(board);box(1.8,1.2,.15,'#a68b6b',0,1,0,board);box(1.65,1.05,.17,'#f6e6c5',0,1,.02,board);for(const x of [-.66,.66])box(.09,1,.09,'#a68b6b',x,.3,0,board);for(const x of [-.42,.42])box(.57,.65,.01,'#fff8e5',x,1,.12,board);label('ออเดอร์วันนี้',0,1.9,17.6,2.6);
 for(const n of NEIGHBORS){const g=new T.Group();g.position.set(n.x,0,n.z);g.userData.town=n.id;g.name=`neighbor-${n.id}`;world.add(g);targets.push(g);ball(.65,.78,.45,n.color,0,.48,0,g);const head=ball(.8,.68,.56,n.color,0,1.05,0,g);for(const side of [-1,1]){ball(n.id==='poppy'?.18:.23,n.id==='poppy'?.58:.25,.18,n.color,side*.27,n.id==='poppy'?1.58:1.4,0,g);ball(.07,.1,.05,'#5d4536',side*.17,1.12,.275,g);ball(.2,.16,.27,n.color,side*.19,.09,.1,g);}ball(.065,.055,.05,'#8f6351',0,1,.3,g);box(.59,.25,.46,n.id==='milo'?'#96aa8f':'#d7a6a0',0,.53,0,g);const arm=ball(.18,.42,.19,n.color,-.4,.64,0,g);const otherArm=ball(.18,.42,.19,n.color,.4,.64,0,g);const mouth=ball(.12,.035,.035,'#70483d',0,.94,.305,g);const tag=label(n.name,0,1.96,0,1.5);tag.userData.overviewLabel=true;g.add(tag);neighbors.push({g,arm,otherArm,head,mouth,phase:neighbors.length*2,n,path:[],destination:null});}
 for(const v of neighbors){const book=new T.Group();book.name='SharedBook';v.g.add(book);box(.42,.045,.27,'#9cae9b',0,.68,.33,book);box(.38,.04,.23,'#fff0d2',0,.71,.33,book);book.visible=false;v.sharedBook=book;const pad=new T.Group();pad.name='SharedDrawingPad';v.g.add(pad);box(.38,.035,.28,'#e9d8bd',0,.67,.33,pad);box(.025,.24,.025,'#ba9571',.15,.80,.33,pad);pad.visible=false;v.sharedPad=pad;}
 const pet=new T.Group();pet.name='TownCat';pet.position.set(2.4,0,15.5);world.add(pet);ball(.4,.27,.6,'#bdac97',0,.20,0,pet);ball(.32,.3,.30,'#d2bea5',0,.37,.23,pet);for(const x of [-.10,.10]){const ear=box(.11,.14,.1,'#bdac97',x,.56,.23,pet);ear.rotation.z=x<0?.3:-.3;ball(.025,.045,.02,'#5d4937',x,.4,.38,pet);}const tail=box(.045,.05,.42,'#bdac97',0,.29,-.38,pet);const hearts=neighbors.map(v=>{const o=ball(.12,.12,.05,'#dba4a6',0,1.6,.1,v.g);o.visible=false;return o;});
 let lastEvent='',pendingEvent=null;
 let lastTime=null,heldNeighbor=null;
 function hold(id){heldNeighbor=id;}
 function invite(id,point,seconds=120){const v=neighbors.find(v=>v.n.id===id);if(!v)return false;const path=findPath({x:v.g.position.x,z:v.g.position.z},point);if(!path)return false;v.invitation={point:{...point},until:(lastTime??0)+seconds};v.path=path;v.destination={...point};return true;}
 function dismiss(id){const v=neighbors.find(v=>v.n.id===id);if(v)v.invitation=null;}
 function update(time,minute=480,friendship={},task=null,actor=null){
  const dt=lastTime===null?0:Math.min(.1,Math.max(0,time-lastTime));lastTime=time;
  neighbors.forEach(v=>{const {g,arm,otherArm,head,mouth,phase,n}=v,routine=npcRoutine(n.id,minute);if(v.invitation&&time>v.invitation.until)v.invitation=null;const destination=v.invitation?.point??routine.place;
   const engaged=heldNeighbor===n.id||(task?.neighborId===n.id&&task.phase==='doing');
   if(!v.destination){g.position.set(routine.place.x,0,routine.place.z);v.destination=routine.place;}
   if(!engaged&&(v.destination.x!==destination.x||v.destination.z!==destination.z)){
    v.path=findPath({x:g.position.x,z:g.position.z},destination)??[];v.destination={...destination};
   }
   let walking=false;
   if(!engaged&&v.path.length){let travel=dt*.85;walking=true;while(travel>0&&v.path.length){const p=v.path[0],dx=p.x-g.position.x,dz=p.z-g.position.z,dist=Math.hypot(dx,dz);g.rotation.y=Math.atan2(dx,dz);if(dist<=travel){g.position.x=p.x;g.position.z=p.z;v.path.shift();travel-=dist;}else{g.position.x+=dx/dist*travel;g.position.z+=dz/dist*travel;travel=0;}}}
   const conversing=engaged&&actor&&Math.hypot(actor.position.x-g.position.x,actor.position.z-g.position.z)<2.2;
   if(conversing)g.rotation.y=Math.atan2(actor.position.x-g.position.x,actor.position.z-g.position.z);
   v.sharedBook.visible=conversing&&task?.id==='shared-read';v.sharedPad.visible=conversing&&task?.id==='shared-draw';
   const talking=conversing&&(task?.phase==='doing'||heldNeighbor===n.id);
   g.position.y=Math.sin(time*(walking?9:1.6)+phase)*(walking?.035:.009);
   head.rotation.x=talking?Math.sin(time*4+phase)*.1:Math.sin(time*.8+phase)*.025;head.rotation.y=talking?0:Math.sin(time*.45+phase)*.12;
   arm.rotation.z=talking?-.8+Math.sin(time*5+phase)*.35:-.15+Math.sin(time*1.3+phase)*.06;
   otherArm.rotation.z=talking?.4+Math.sin(time*3+phase)*.2:.15;
   arm.rotation.x=walking?Math.sin(time*9)*.5:0;otherArm.rotation.x=-arm.rotation.x;if(v.sharedBook.visible){arm.rotation.x=otherArm.rotation.x=-.75;arm.rotation.z=-.55;otherArm.rotation.z=.55;}if(v.sharedPad.visible){arm.rotation.x=-.65+Math.sin(time*4+phase)*.18;otherArm.rotation.x=-.48;arm.rotation.z=-.46;otherArm.rotation.z=.35;head.rotation.x=.10+Math.sin(time*2+phase)*.035;}
   mouth.scale.y=talking?.018+Math.max(0,Math.sin(time*9+phase))*.045:.0175;
   g.children.filter(o=>o.isMesh&&Math.abs(o.scale.x-.1)<.001&&Math.abs(o.scale.z-.135)<.001).forEach((foot,i)=>{foot.position.y=.09+(walking?Math.max(0,Math.sin(time*9+i*Math.PI))*.08:0);foot.position.z=.1+(walking?Math.sin(time*9+i*Math.PI)*.1:0);});
   g.userData.routine=routine;g.userData.interacting=!!talking;g.userData.walking=walking;g.userData.socialEvent='';
  });
  const [first,second]=neighbors,near=first.g.position.distanceTo(second.g.position)<2.3,free=neighbors.every(v=>!v.invitation&&!v.g.userData.walking&&heldNeighbor!==v.n.id&&!(task?.neighborId===v.n.id&&task.phase==='doing'));
  const inPark=neighbors.every(v=>Math.abs(v.g.position.z-14.8)<1),phase=Math.floor(minute/10)%3,event=['chat','disagree','pet'][phase];
  hearts.forEach(o=>o.visible=false);tail.rotation.y=Math.sin(time*3)*.35;
  if(near&&free&&inPark){
   const key=Math.floor(minute/10)+':'+event;if(key!==lastEvent){lastEvent=key;pendingEvent={event,text:event==='chat'?'ไมโลกับป๊อปปี้คุยกันที่สวน':event==='disagree'?'ไมโลกับป๊อปปี้งอนกันเรื่องขนม แล้วค่อย ๆ ใจเย็นลง':'ไมโลกับป๊อปปี้เล่นกับแมวด้วยกัน'};}
   neighbors.forEach((v,i)=>{const other=neighbors[1-i].g,target=event==='pet'?pet:other;v.g.rotation.y=Math.atan2(target.position.x-v.g.position.x,target.position.z-v.g.position.z);v.head.rotation.x=event==='pet'?.22:Math.sin(time*3+i)*.08;v.head.rotation.y=event==='disagree'?Math.sin(time*5)*.15:0;v.arm.rotation.z=event==='disagree'?-.9:-.6+Math.sin(time*4+i)*.18;v.otherArm.rotation.z=event==='disagree'?.9:.4;v.arm.rotation.x=event==='pet'?-.8:0;v.mouth.scale.y=.02+Math.max(0,Math.sin(time*6+i))* .04;v.g.userData.socialEvent=event;hearts[i].visible=event==='pet';});
   if(event==='pet'){pet.position.y=Math.max(0,Math.sin(time*3))*.05;tail.rotation.y=Math.sin(time*7)*.5;}else pet.position.y=0;
  }
  spray.children.forEach((o,i)=>o.position.set(Math.sin(i)*.15,.35+(time*.6+i*.1)%.6,13.35+Math.cos(i)*.15));
 }
 return {world,targets,floors,update,hold,invite,dismiss,consumeEvent(){const e=pendingEvent;pendingEvent=null;return e;},neighborPosition:id=>{const n=neighbors.find(x=>x.n.id===id);return n?{x:n.g.position.x,z:n.g.position.z}:null}};
}
