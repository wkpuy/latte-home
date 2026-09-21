export function createLivingAudio(settings){
 let paused=false,ctx,music,effects,noiseSource,noiseGain,lastStep=0,lastEffect=0,lastNote=0,lastTask='',note=0,lastVocal=0;
 const melody=[0,4,7,9,7,4,2,0,4,7,12,9,7,4,2,4];
 function init(){if(ctx)return;const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;ctx=new Audio();music=ctx.createGain();effects=ctx.createGain();music.connect(ctx.destination);effects.connect(ctx.destination);const buffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.3;noiseSource=ctx.createBufferSource();noiseSource.buffer=buffer;noiseSource.loop=true;const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=1800;noiseGain=ctx.createGain();noiseGain.gain.value=0;noiseSource.connect(filter).connect(noiseGain).connect(effects);noiseSource.start();apply();}
 function apply(){if(!ctx)return;music.gain.setTargetAtTime(settings.enabled&&!paused?settings.music*.13:0,ctx.currentTime,.08);effects.gain.setTargetAtTime(settings.enabled&&!paused?settings.effects*.22:0,ctx.currentTime,.08);}
 async function enable(){settings.enabled=!settings.enabled;if(settings.enabled){init();await ctx?.resume();}apply();return !!ctx;}
 function tone(hz,duration=.12,volume=.4,type='sine',channel=effects,end=hz){if(!ctx||ctx.state!=='running'||!settings.enabled)return;const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime;o.type=type;o.frequency.setValueAtTime(hz,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+duration);g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(Math.max(.002,volume),t+.012);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g).connect(channel);o.start();o.stop(t+duration+.03);o.onended=()=>{o.disconnect();g.disconnect();};}
 function update(s,task,time,walking){if(!ctx||!settings.enabled||document.hidden){if(noiseGain)noiseGain.gain.setTargetAtTime(0,ctx.currentTime,.1);return;}
  const doing=task?.phase==='doing',id=doing?task.id:'',outside=s.position.z>3;
  noiseGain.gain.setTargetAtTime(id==='shower'?.55:id==='sink'?.2:outside&&s.day%5===0?.12:0,ctx.currentTime,.3);
  if(id!==lastTask){lastTask=id;if(['fridge','bed','sofa','dining'].includes(id))tone(140,.16,.6,'triangle',effects,65);if(id==='fishing')tone(420,.28,.25,'sine',effects,95);}
  if(walking&&time-lastStep>(s.energy<35?.55:.37)){lastStep=time;tone(outside?95:155,.075,outside?.22:.35,'triangle',effects,55);}
  if(time-lastEffect>1.1){lastEffect=time;if(id==='dining')tone(1500,.09,.18);if(id==='counter')tone(230,.07,.3,'triangle',effects,120);if(id==='hobby-wipe'||id==='hobby-sweep')tone(180,.2,.12,'triangle');if(id==='fishing'&&task.remaining<3)tone(340,.14,.3,'sine',effects,120);if(task?.emotion==='Laugh')tone(360,.13,.2,'sine',effects,510);if(s.daily.emotion?.id==='crying'&&id==='emotion')tone(440,.28,.17,'sine',effects,220);}
  if(time-lastVocal>6){lastVocal=time;if(id==='hobby-yawn'||(!id&&['sad','regret'].includes(s.daily.emotion?.id)))tone(190,.55,.12,'sine',effects,90);}
  if(time-lastNote>1.1){lastNote=time;tone(220*2**(melody[note++%melody.length]/12),.85,.26,'sine',music);}
 }
 function suspend(){if(ctx)ctx.suspend();}function resume(){if(ctx&&settings.enabled)ctx.resume();}
 document.addEventListener('visibilitychange',()=>document.hidden?suspend():resume());
 document.addEventListener('pointerdown',()=>{if(settings.enabled){init();resume();}},{once:true});
 return {enable,apply,update,setPaused(on){if(on!==paused){paused=on;apply();}},get ready(){return !!ctx&&ctx.state==='running';}};
}
