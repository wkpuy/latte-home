import {cp,mkdir,readdir,readFile,rm,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const dist=path.join(root,'dist');
await rm(dist,{recursive:true,force:true});
await mkdir(dist,{recursive:true});
// Publish only runtime files; development notes, backups and source models stay local.
for(const item of await readdir(root,{withFileTypes:true})){
 if(!item.isFile()||! /\.(js|css|html)$/.test(item.name))continue;
 const contents=await readFile(path.join(root,item.name),'utf8');
 await writeFile(path.join(dist,item.name),contents.replaceAll('./node_modules/three/','./vendor/three/'));
}
await mkdir(path.join(dist,'assets'),{recursive:true});
for(const name of ['latte-r03.glb','latte-r04.glb','latte-r13.glb'])await cp(path.join(root,'assets',name),path.join(dist,'assets',name));
for(const name of ['build','examples/jsm','LICENSE'])await cp(path.join(root,'node_modules/three',name),path.join(dist,'vendor/three',name),{recursive:true});
await writeFile(path.join(dist,'.nojekyll'),'');
await cp(path.join(root,'manifest.webmanifest'),path.join(dist,'manifest.webmanifest'));
console.log('Website ready in dist/ (relative URLs support GitHub project pages).');
