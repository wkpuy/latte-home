import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initial,restore} from '../room-state.js';
import {OUTFITS} from '../outfits.js';
test('every wardrobe outfit survives save migration without a purchase',()=>{for(const [id] of OUTFITS){const s=initial(100);s.clothes=id;assert.equal(restore(JSON.stringify(s),100).clothes,id);}});
