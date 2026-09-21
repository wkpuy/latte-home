import * as T from 'three';
// Solve a limb in world coordinates; furniture rotation is already in the target.
export function solveLimb(a,b,end,target,pole){
 a.updateWorldMatrix(true,true);
 const origin=a.getWorldPosition(new T.Vector3()),middle=b.getWorldPosition(new T.Vector3()),tip=end.getWorldPosition(new T.Vector3());
 const l1=origin.distanceTo(middle),l2=middle.distanceTo(tip),dir=target.clone().sub(origin),distance=dir.length();
 if(distance<1e-8||l1<1e-8||l2<1e-8)return distance;
 const length=T.MathUtils.clamp(distance,Math.abs(l1-l2)+.0001,l1+l2-.0001);dir.normalize();
 const bend=pole.clone().addScaledVector(dir,-pole.dot(dir));
 if(bend.lengthSq()<1e-8)bend.crossVectors(dir,new T.Vector3(0,0,1));
 if(bend.lengthSq()<1e-8)bend.crossVectors(dir,new T.Vector3(0,1,0));bend.normalize();
 const along=(l1*l1-l2*l2+length*length)/(2*length);
 const elbow=origin.clone().addScaledVector(dir,along).addScaledVector(bend,Math.sqrt(Math.max(0,l1*l1-along*along)));
 for(const [bone,child,p]of [[a,b,elbow],[b,end,origin.clone().addScaledVector(dir,length)]]){
  bone.updateWorldMatrix(true,true);const o=bone.getWorldPosition(new T.Vector3());
  const q=new T.Quaternion().setFromUnitVectors(child.getWorldPosition(new T.Vector3()).sub(o).normalize(),p.clone().sub(o).normalize()).multiply(bone.getWorldQuaternion(new T.Quaternion()));
  bone.quaternion.copy(bone.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(q));
 }
 end.updateWorldMatrix(true,false);return end.getWorldPosition(new T.Vector3()).distanceTo(target);
}
export function plantFoot(d,actor,side,target,orientation){
 const foot=d.bones['Foot_'+side];
 const error=solveLimb(d.bones['Leg_'+side],d.bones['Shin_'+side],foot,target,new T.Vector3(0,0,1).applyQuaternion(actor.quaternion));
 if(orientation)foot.quaternion.copy(foot.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(actor.quaternion.clone().multiply(orientation)));
 return error;
}
export function reachHand(d,actor,side,target){
 const a=d.bones['Arm_'+side],b=d.bones['Forearm_'+side],h=d.bones['Hand_'+side];d.model.updateWorldMatrix(true,true);
 const origin=a.getWorldPosition(new T.Vector3()),elbow=b.getWorldPosition(new T.Vector3()),wrist=h.getWorldPosition(new T.Vector3()),l1=origin.distanceTo(elbow),l2=elbow.distanceTo(wrist),dir=target.clone().sub(origin),dist=Math.max(.005,Math.min(dir.length(),l1+l2-.005));dir.normalize();
 const along=(l1*l1-l2*l2+dist*dist)/(2*dist),bend=new T.Vector3(side==='R'?-1:1,0,0).applyQuaternion(actor.quaternion);bend.addScaledVector(dir,-bend.dot(dir)).normalize();
 const mid=origin.clone().addScaledVector(dir,along).addScaledVector(bend,Math.sqrt(Math.max(0,l1*l1-along*along))),end=origin.clone().addScaledVector(dir,dist);
 for(const [bone,child,p]of [[a,b,mid],[b,h,end]]){d.model.updateWorldMatrix(true,true);const o=bone.getWorldPosition(new T.Vector3()),from=child.getWorldPosition(new T.Vector3()).sub(o).normalize(),to=p.clone().sub(o).normalize();bone.quaternion.copy(bone.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(new T.Quaternion().setFromUnitVectors(from,to).multiply(bone.getWorldQuaternion(new T.Quaternion()))));}
}
// Preserve each prop's authored dimensions while stowing it during an interrupted action.
export function propExit(objects,actor){
 let saved=null;
 return {leave(a){if(!saved)saved=objects.filter(o=>o.visible).map(o=>[o,o.position.clone(),o.scale.clone()]);const hip=actor.localToWorld(new T.Vector3(0,.45,.2));for(const [o,p,scale]of saved){o.position.lerpVectors(p,hip,a);o.scale.copy(scale).multiplyScalar(1-a);}},reset(){if(saved)for(const [o,,scale]of saved)o.scale.copy(scale);saved=null;}};
}
