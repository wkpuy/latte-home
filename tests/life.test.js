import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initial} from '../room-state.js';
import {moodlets,scheduleFor,scheduledNeed} from '../life-state.js';
test('moodlets explain low needs and celebrate positive routines',()=>{const s=initial();s.food=20;s.energy=25;s.hygiene=90;s.social=90;const ids=moodlets(s).map(m=>m.id);assert(ids.includes('hungry'));assert(ids.includes('tired'));assert(ids.includes('clean'));s.food=90;s.energy=90;s.hygiene=90;s.social=90;s.bakedTotal=2;const good=moodlets(s).map(m=>m.id);assert(good.includes('full'));assert(good.includes('rested'));assert(good.includes('proud'));});
test('schedule follows the clock and urgent needs override it',()=>{const s=initial();s.minute=8*60;assert.equal(scheduleFor(s).id,'fridge');assert.equal(scheduledNeed(s),'fridge');s.minute=17*60;assert.equal(scheduleFor(s).id,'sofa');s.energy=20;assert.equal(scheduledNeed(s),'bed');s.energy=90;s.social=20;assert.equal(scheduledNeed(s),'social');});
