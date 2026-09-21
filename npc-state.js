export const NPC_ROUTINES={
 milo:[{from:0,to:7,place:{x:4.4,z:17.2},label:'พักผ่อนที่บ้าน'},{from:7,to:11,place:{x:-4.5,z:13.6},label:'ช่วยอบขนม'},{from:11,to:16,place:{x:1.7,z:14.8},label:'เดินเล่นที่ลานกลางเมือง'},{from:16,to:20,place:{x:-3.5,z:12.3},label:'แวะตลาด'},{from:20,to:24,place:{x:4.4,z:17.2},label:'กลับบ้าน'}],
 poppy:[{from:0,to:8,place:{x:-7.3,z:17.5},label:'พักผ่อนที่บ้าน'},{from:8,to:12,place:{x:4.5,z:12.2},label:'เลือกเมล็ดพันธุ์'},{from:12,to:17,place:{x:3.1,z:14.8},label:'พบเพื่อนที่ลานกลางเมือง'},{from:17,to:21,place:{x:-5.1,z:12.3},label:'ซื้อของที่ตลาด'},{from:21,to:24,place:{x:-7.3,z:17.5},label:'กลับบ้าน'}]
};
export function npcRoutine(id,minute=480){const list=NPC_ROUTINES[id]??[];const hour=minute/60;return list.find(r=>hour>=r.from&&hour<r.to)??list[0];}
export function friendshipTier(value=0){return value>=80?{name:'เพื่อนสนิท',description:'ไว้ใจกันมากและมีเรื่องพิเศษให้คุย'}:value>=40?{name:'เพื่อนคุ้นเคย',description:'เริ่มมีบทสนทนาและของฝากเพิ่มขึ้น'}:{name:'เพื่อนบ้าน',description:'ค่อย ๆ ทำความรู้จักกันไป'};}
