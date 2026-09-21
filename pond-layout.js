// Expanded east-side fishing grounds, shared by rendering and navigation.
export const FISHING_POND={x:11.8,z:15.3,rx:2.85,rz:1.9,anchor:{x:8.3,z:15.3}};
export function pondEdge(angle){return 1+.065*Math.sin(angle*3+.7)+.035*Math.cos(angle*5);}
