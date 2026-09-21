import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initial,advance,restore} from '../room-state.js';
test('one day now takes 24 real minutes, including offline progression',()=>{const s=initial(100);s.minute=0;advance(s,720);assert.equal(s.minute,720);assert.equal(s.day,1);advance(s,720);assert.equal(s.minute,0);assert.equal(s.day,2);});
test('free wardrobe choices persist without granting purchased hats',()=>{const s=initial(100);s.hat='cap';s.clothes='denim';let r=restore(JSON.stringify(s),100);assert.equal(r.hat,'cap');assert.equal(r.clothes,'denim');s.hat='rose';s.clothes='bad';r=restore(JSON.stringify(s),100);assert.equal(r.hat,'none');assert.equal(r.clothes,'sage');});
