export const INGREDIENTS=[{id:'flour',name:'แป้ง',icon:'🌾',price:3},{id:'sugar',name:'น้ำตาล',icon:'🧂',price:2},{id:'butter',name:'เนย',icon:'🧈',price:4},{id:'egg',name:'ไข่',icon:'🥚',price:3}];
export const RECIPES=[
 {id:'riceCookie',name:'คุกกี้ข้าวหอม',icon:'🌾',ingredients:{butter:1,sugar:1},produce:{rice:1},yield:2,price:20,food:24},
 {id:'cookie',name:'คุกกี้เนย',icon:'🍪',ingredients:{flour:1,butter:1,sugar:1},produce:{},yield:2,price:12,food:14},
 {id:'carrotCake',name:'มัฟฟินแครอท',icon:'🧁',ingredients:{flour:1,egg:1,sugar:1},produce:{carrot:1},yield:2,price:17,food:22},
 {id:'pumpkinPie',name:'พายฟักทอง',icon:'🥧',ingredients:{flour:1,butter:1,egg:1},produce:{pumpkin:1},yield:2,price:24,food:30},
 {id:'gardenBun',name:'ขนมปังผัก',icon:'🥯',ingredients:{flour:1,butter:1},produce:{lettuce:1},yield:2,price:16,food:22},
];
export const TOWN_PLACES=[
 {id:'market',name:'ร้านของชำใบชา',icon:'🛒',x:-4.5,z:10,w:4.5,d:3,anchor:{x:-4.5,z:12},color:'#adbd9e'},
 {id:'seedShop',name:'ร้านเมล็ดซันนี่',icon:'🌱',x:4.5,z:10,w:4.5,d:3,anchor:{x:4.5,z:12},color:'#e4c292'},
 {id:'bakery',name:'แผงขนมของลาเต้',icon:'🧁',x:-4.5,z:15.8,w:4.5,d:2.8,anchor:{x:-4.5,z:13.8},color:'#d7a8a0'},
];
export const NEIGHBORS=[{id:'milo',name:'ไมโล',species:'หมี',color:'#b49b7d',x:3.8,z:15.7,anchor:{x:2.7,z:15.1},line:'หอมขนมมาถึงสวนเลย วันนี้ทำอะไรอร่อย ๆ มาบ้าง?'},{id:'poppy',name:'ป๊อปปี้',species:'กระต่าย',color:'#e6d7c4',x:6.3,z:13.8,anchor:{x:5.4,z:13.4},line:'แวะมาคุยกันได้ทุกวันนะ เราชอบฟังเรื่องสวนของเธอ!'}];
export function ordersFor(day){return [0,1,2].map((i)=>({id:`${day}-${i}`,neighbor:NEIGHBORS[i%2].id,recipe:i===2?'riceCookie':RECIPES.filter(r=>r.id!=='riceCookie')[(day-1+i)%4].id,quantity:2,bonus:8+i*4}));}
