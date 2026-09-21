import * as T from 'three';

// Small layered mouth surfaces, attached rigidly to Head just like the nose.
// Coordinates are in the neutral model's world space before bone attachment.
export function createExpressiveMouth(scene, head) {
  const root = new T.Group(); root.name = 'Expression_Mouth';
  root.position.set(.031,.949,.334);
  const material = color => new T.MeshBasicMaterial({color,side:T.DoubleSide});
  function surface(shape,color,z=0) {
    const mesh=new T.Mesh(new T.ShapeGeometry(shape,40),material(color));
    mesh.position.z=z;root.add(mesh);return mesh;
  }
  function opening(w,h) {
    const s=new T.Shape();s.moveTo(-w/2,0);
    s.bezierCurveTo(-w*.24,-h*.06,w*.24,-h*.06,w/2,0);
    s.bezierCurveTo(w*.53,-h*.55,w*.30,-h,0,-h);
    s.bezierCurveTo(-w*.30,-h,-w*.53,-h*.55,-w/2,0);return s;
  }
  surface(opening(.158,.092),'#71332f');
  const inner=surface(opening(.14,.079),'#ae484d',.001);
  inner.position.y=-.005;
  const tongue=new T.Shape();tongue.moveTo(-.046,-.066);
  tongue.bezierCurveTo(-.029,-.040,.029,-.040,.046,-.066);
  tongue.bezierCurveTo(.03,-.085,-.03,-.085,-.046,-.066);
  surface(tongue,'#ee8e96',.002);
  const crease=new T.Shape();crease.moveTo(-.0012,-.055);crease.lineTo(.0012,-.055);
  crease.lineTo(.001,-.068);crease.lineTo(-.001,-.068);crease.closePath();
  surface(crease,'#d66c7a',.003);
  const smilingLayers=[...root.children];
  const surprise=new T.Group();root.add(surprise);surprise.position.y=-.043;
  function oval(radius,color,z,sx=1,sy=1){
    const mesh=new T.Mesh(new T.CircleGeometry(radius,64),material(color));
    mesh.scale.set(sx,sy,1);mesh.position.z=z;surprise.add(mesh);return mesh;
  }
  oval(.039,'#71332f',0,1,1.12);
  oval(.033,'#ae484d',.001,1,1.12);
  const surpriseTongue=oval(.018,'#ee8e96',.002,1,.48);surpriseTongue.position.y=-.024;
  const shy=new T.Group();root.add(shy);
  const shyShape=new T.Shape();shyShape.moveTo(-.036,-.024);
  shyShape.quadraticCurveTo(.006,-.050,.042,-.018);
  shyShape.quadraticCurveTo(.006,-.061,-.036,-.030);shyShape.closePath();
  shy.add(new T.Mesh(new T.ShapeGeometry(shyShape,32),material('#71332f')));
  scene.add(root);head.attach(root);root.visible=false;
  return {
    root,
    update(kind,t) {
      root.visible=['Talk','Laugh','Wide','Eat','Sing','Shy'].includes(kind);
      if(!root.visible)return false;
      let x=1,y=1;
      surprise.visible=kind==='Wide';shy.visible=kind==='Shy';
      for(const mesh of smilingLayers)mesh.visible=kind!=='Wide'&&kind!=='Shy';
      if(kind==='Talk'||kind==='Sing'){
        const syllable=.5+.5*Math.sin(t*10+Math.sin(t*3));
        x=.70+.22*syllable;y=.18+.78*syllable;
      }
      if(kind==='Eat'){x=.65;y=.2+.5*(.5+.5*Math.sin(t*8));}
      if(kind==='Laugh'){x=1.08;y=.9+.1*Math.sin(t*9);}
      root.scale.set(x,y,1);return true;
    }
  };
}
