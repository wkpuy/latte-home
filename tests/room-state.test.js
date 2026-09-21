import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initial,restore,advance,purchase,reward} from '../room-state.js';
test('buying and re-equipping never double-charge or permit unaffordable purchases',()=>{const s=initial();assert(purchase(s,'sage'));assert.equal(s.coins,5);assert(purchase(s,'sage'));assert.equal(s.coins,5);assert(!purchase(s,'rose'));assert.deepEqual(s.owned,['sage']);});
test('save restores equipped items, currencies, sleep and bounded offline needs',()=>{const s=initial(1000);purchase(s,'sage');s.sleeping=true;s.energy=20;const r=restore(JSON.stringify(s),1000+86400000);assert.equal(r.hat,'sage');assert.equal(r.coins,5);assert.equal(r.energy,100);assert.equal(r.food,15);assert.equal(r.sleeping,true);});
test('malformed data cannot equip unowned items or create negative currency',()=>{assert.equal(restore('not-json',100).food,78);const s=restore('{"version":1,"coins":-9,"hat":"rose","owned":["unknown"],"energy":200}',100);assert.equal(s.coins,0);assert.equal(s.hat,'none');assert.equal(s.energy,100);assert.deepEqual(s.owned,[]);});
test('game reward uses two coins per cookie, tracks best and caps the round reward',()=>{const s=initial();assert.equal(reward(s,8),16);assert.equal(s.best,8);assert.equal(s.coins,41);assert.equal(reward(s,40),50);assert.equal(s.best,40);});
test('sleep regenerates and awake time gently decays needs',()=>{const s=initial();advance(s,20);assert(s.energy<82);s.sleeping=true;advance(s,30);assert.equal(s.energy,100);});
