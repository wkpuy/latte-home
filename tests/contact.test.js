import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {solveLimb} from '../character-contact.js';
test('contact solver holds a moving handle after furniture rotation and translation',()=>{
 for(const angle of [0,Math.PI/4,Math.PI/2,Math.PI]){
  const world=new T.Group(),root=new T.Group(),upper=new T.Bone(),lower=new T.Bone(),hand=new T.Bone();world.add(root);root.add(upper);upper.add(lower);lower.add(hand);lower.position.y=.2;hand.position.y=.16;root.position.set(2,.7,-3);root.rotation.y=angle;
  for(let i=0;i<30;i++){
   const target=root.localToWorld(new T.Vector3(.1+Math.sin(i*.08)*.04,.12,.18));
   const error=solveLimb(upper,lower,hand,target,new T.Vector3(1,0,0).applyQuaternion(root.quaternion));
   assert.ok(error<1e-5,'grip remains on reachable target');
   assert.ok(Math.abs(upper.getWorldPosition(new T.Vector3()).distanceTo(lower.getWorldPosition(new T.Vector3()))-.2)<1e-6,'upper limb does not stretch');
  }
 }
});
test('unreachable and coincident contact targets remain finite without stretching',()=>{
 const root=new T.Group(),a=new T.Bone(),b=new T.Bone(),end=new T.Bone();root.add(a);a.add(b);b.add(end);b.position.y=.2;end.position.y=.16;
 for(const target of [new T.Vector3(4,9,2),new T.Vector3(),new T.Vector3(0,.2,0)]){
  assert.ok(Number.isFinite(solveLimb(a,b,end,target,new T.Vector3(0,1,0))));
  assert.ok(end.getWorldPosition(new T.Vector3()).toArray().every(Number.isFinite));
 }
});
