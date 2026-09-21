export const MOODLETS={
 hungry:{icon:'🍪',name:'หิว',text:'ท้องเริ่มร้อง อยากหาอะไรกิน',type:'bad'},
 tired:{icon:'😴',name:'ง่วง',text:'พลังงานต่ำ ควรพักผ่อน',type:'bad'},
 dirty:{icon:'💧',name:'ไม่สดชื่น',text:'อยากอาบน้ำให้ตัวหอม',type:'bad'},
 lonely:{icon:'💜',name:'คิดถึงเพื่อน',text:'อยากคุยหรือไปหาเพื่อนบ้าน',type:'bad'},
 bored:{icon:'🫧',name:'เบื่อ',text:'อยากทำกิจกรรมสนุก ๆ',type:'bad'},
 full:{icon:'🍽️',name:'อิ่มสบาย',text:'เพิ่งได้เติมพลังจากของอร่อย',type:'good'},
 rested:{icon:'🌙',name:'พักเต็มที่',text:'นอนหลับสบายพร้อมเริ่มวันใหม่',type:'good'},
 clean:{icon:'✨',name:'ตัวหอม',text:'อาบน้ำแล้วรู้สึกสดชื่น',type:'good'},
 social:{icon:'💞',name:'มีเพื่อนอยู่ข้าง ๆ',text:'ความสัมพันธ์ทำให้ใจอุ่น',type:'good'},
 proud:{icon:'🌱',name:'ภูมิใจในสวน',text:'ได้ดูแลสิ่งที่ตัวเองปลูก',type:'good'}
};
export function moodlets(s){
 const out=[];const add=(id,score)=>out.push({...MOODLETS[id],id,score});
 if(s.food<35)add('hungry',100-s.food);if(s.energy<35)add('tired',100-s.energy);if(s.hygiene<35)add('dirty',100-s.hygiene);if(s.social<35)add('lonely',100-s.social);if(s.joy<35)add('bored',100-s.joy);
 if(s.food>=80)add('full',s.food);if(s.energy>=85)add('rested',s.energy);if(s.hygiene>=85)add('clean',s.hygiene);if(s.social>=80)add('social',s.social);if((s.bakedTotal??0)>0||(s.farm?.harvested??0)>0)add('proud',8);
 return out.sort((a,b)=>(a.type===b.type?b.score-a.score:a.type==='bad'?-1:1)).slice(0,5);
}
export function scheduleFor(s){
 const h=s.minute/60;if(h<7)return {id:'bed',label:'ช่วงนอน',reason:'ยังเช้ามืด ควรนอนต่อ'};
 if(h<9)return {id:'fridge',label:'มื้อเช้า',reason:'เริ่มวันด้วยอาหาร'};
 if(h<12)return {id:'garden',label:'ช่วงดูแลสวน',reason:'แสงเช้าเหมาะกับการปลูกและรดน้ำ'};
 if(h<14)return {id:'counter',label:'มื้อกลางวัน',reason:'ได้เวลาทำอาหาร'};
 if(h<17)return {id:'social',label:'ช่วงพบเพื่อน',reason:'ออกไปทักทายเพื่อนบ้าน'};
 if(h<20)return {id:'sofa',label:'ช่วงพักเย็น',reason:'พักหลังจบวัน'};
 return {id:'bed',label:'เตรียมเข้านอน',reason:'คืนนี้ควรพักให้เต็มที่'};
}
export function scheduledNeed(s){
 const m=moodlets(s).find(m=>m.type==='bad');if(m?.id==='tired')return 'bed';if(m?.id==='hungry')return 'fridge';if(m?.id==='dirty')return 'shower';if(m?.id==='lonely')return 'social';return scheduleFor(s).id;
}
