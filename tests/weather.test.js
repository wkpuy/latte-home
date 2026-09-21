import {test} from 'node:test';
import assert from 'node:assert/strict';
import {weatherFor,sunPhase} from '../weather-state.js';
test('weather cycles predictably by day and keeps the three visual states',()=>{assert.equal(weatherFor(1).id,'clear');assert.equal(weatherFor(3).id,'cloudy');assert.equal(weatherFor(5).id,'rain');assert(weatherFor(5).rain&&weatherFor(3).cloud);});
test('sun and moon phases follow the day clock',()=>{assert(sunPhase(12*60).daylight>0.9);assert(sunPhase(2*60).daylight===0);assert.notEqual(sunPhase(12*60).angle,sunPhase(0).angle);});
