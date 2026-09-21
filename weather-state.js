export const WEATHER={clear:{id:'clear',name:'ท้องฟ้าแจ่มใส',icon:'☀️',sky:'#ece6d7',rain:0,cloud:0},cloudy:{id:'cloudy',name:'เมฆครึ้ม',icon:'☁️',sky:'#c8d0cc',rain:0,cloud:1},rain:{id:'rain',name:'ฝนตกเบา ๆ',icon:'🌧️',sky:'#aebcc2',rain:1,cloud:1}};
export function weatherFor(day){return day%5===0?WEATHER.rain:day%3===0?WEATHER.cloudy:WEATHER.clear;}
export function sunPhase(minute){const h=(minute/60)%24;return {hour:h,daylight:Math.max(0,Math.min(1,(h-5)/2))*Math.max(0,Math.min(1,(19-h)/2)),angle:(h/24)*Math.PI*2-Math.PI/2};}
