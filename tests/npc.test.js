import {test} from 'node:test';
import assert from 'node:assert/strict';
import {NPC_ROUTINES} from '../npc-state.js';
import {walkable,findPath,START} from '../house-layout.js';
test('neighbors have separate walkable destinations and connected routine paths',()=>{
 for(const list of Object.values(NPC_ROUTINES))for(let i=0;i<list.length;i++){
  const p=list[i].place,previous=list[(i+list.length-1)%list.length].place;
  assert(walkable(p),list[i].label);assert(findPath(previous,p));
  assert([{x:p.x,z:p.z-1.2},{x:p.x+1.2,z:p.z},{x:p.x-1.2,z:p.z},{x:p.x,z:p.z+1.2}].some(q=>findPath(START,q)));
 }
 for(let minute=0;minute<1440;minute+=60){const points=Object.values(NPC_ROUTINES).map(list=>list.find(r=>minute/60>=r.from&&minute/60<r.to).place);assert(Math.hypot(points[0].x-points[1].x,points[0].z-points[1].z)>.8);}
});
