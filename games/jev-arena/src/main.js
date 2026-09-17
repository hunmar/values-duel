import './style.css';

const app = document.querySelector('#app');
app.innerHTML = `
<main class="shell">
  <canvas id="game"></canvas>
  <div class="topbar">
    <div class="brand"><div class="brand-mark">JEV</div><div class="brand-copy"><strong>JEV ARENA</strong><span>typed tactical intelligence</span></div></div>
    <div class="stats"><div class="stat"><small>wave</small><b id="wave">1</b></div><div class="stat"><small>score</small><b id="score">00000</b></div><div class="stat"><small>hostiles</small><b id="hostiles">0</b></div></div>
  </div>
  <aside class="ai-panel">
    <div class="ai-heading"><strong>System One / Drone</strong><span class="live offline" id="source">CONNECTING</span></div>
    <div class="decision-grid">
      <div class="decision"><div class="label">posture</div><div class="value" id="posture">guard</div><div class="meta" id="postureMeta">waiting</div></div>
      <div class="decision"><div class="label">target</div><div class="value" id="target">none</div><div class="meta" id="targetMeta">no lock</div></div>
      <div class="decision"><div class="label">danger score</div><div class="value" id="danger">0.0</div><div class="meta" id="dangerMeta">calm</div></div>
      <div class="decision"><div class="label">overdrive P(yes)</div><div class="value" id="overdrive">0%</div><div class="meta" id="overdriveMeta">charges: 2</div></div>
    </div>
    <div class="probs" id="probs"></div>
  </aside>
  <div class="bottom-left">
    <div class="meter-card"><div class="meter-head"><span>player integrity</span><b id="hpText">100%</b></div><div class="meter health"><i id="hp" style="width:100%"></i></div></div>
    <div class="meter-card"><div class="meter-head"><span>drone integrity</span><b id="droneText">100%</b></div><div class="meter"><i id="droneHp" style="width:100%"></i></div></div>
  </div>
  <div class="help">WASD move · mouse aim · click / space fire · J toggle Jev</div>
  <div class="toast" id="toast"></div>
  <section class="center-card" id="intro"><div class="kicker">A TypeSafe AI game experiment</div><h1>JEV<br>ARENA</h1><p>Survive with an autonomous companion drone. It receives structured game state and returns typed tactical decisions: posture, target, danger and whether to spend overdrive.</p><button class="start-btn" id="start">Deploy into arena</button></section>
  <section class="center-card" id="gameover" hidden><div class="kicker">run terminated</div><h1>OFFLINE</h1><p id="gameoverText"></p><button class="start-btn" id="restart">Reboot · R</button></section>
</main>`;

const $ = (id) => document.getElementById(id);
const ui = Object.fromEntries(['wave','score','hostiles','source','posture','postureMeta','target','targetMeta','danger','dangerMeta','overdrive','overdriveMeta','probs','hp','hpText','droneHp','droneText','intro','gameover','gameoverText','start','restart','toast'].map(id => [id, $(id)]));
const canvas = $('game');
const ctx = canvas.getContext('2d');
const TAU = Math.PI * 2;
const world = { w: 1900, h: 1200 };
const cam = { x:0, y:0, w:0, h:0, shake:0 };
const keys = new Set();
const mouse = { x:0, y:0, down:false };
let dpr = devicePixelRatio || 1, running = false, last = performance.now(), toastTimer;

const game = {
  wave:1, score:0, kills:0, goal:9, spawn:0, spawnEvery:1.25,
  aiEnabled:true, aiBusy:false, aiClock:0, aiSource:'offline', aiLatency:0,
  decision:{ posture:'guard', postureConfidence:0, postureProbabilities:{engage:.25,guard:.25,scavenge:.25,retreat:.25}, target:'none', targetConfidence:0, danger:0, dangerConfidence:0, overdrive:0 }
};
const player = { x:950,y:600,r:15,hp:100,speed:310,angle:0,cooldown:0,inv:0,vx:0,vy:0 };
const drone = { x:1020,y:600,r:12,hp:100,angle:0,cooldown:0,vx:0,vy:0,orbit:0,charges:2,boost:0 };
const enemies = [], shots = [], hostileShots = [], pickups = [], particles = [], rings = [];

const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
const distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
const mag = (x,y) => Math.hypot(x,y) || 1;
const rnd = (a,b) => a + Math.random()*(b-a);
const view = (o) => ({ x:o.x-cam.x, y:o.y-cam.y });

function resize(){
  dpr = devicePixelRatio || 1;
  const r = canvas.getBoundingClientRect();
  canvas.width = Math.floor(r.width*dpr); canvas.height = Math.floor(r.height*dpr);
  cam.w=r.width; cam.h=r.height;
}
function flash(text){
  ui.toast.textContent=text; ui.toast.classList.add('show'); clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>ui.toast.classList.remove('show'),1600);
}
function burst(x,y,color,count=9,power=150){
  for(let i=0;i<count;i++){ const a=Math.random()*TAU,s=rnd(power*.25,power); particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rnd(.2,.55),max:.55,size:rnd(1,3),color}); }
}
function ring(x,y,color){ rings.push({x,y,r:4,life:.35,color}); }

function reset(){
  Object.assign(game,{wave:1,score:0,kills:0,goal:9,spawn:0,spawnEvery:1.25,aiClock:0,aiSource:'offline'});
  game.decision={ posture:'guard',postureConfidence:0,postureProbabilities:{engage:.25,guard:.25,scavenge:.25,retreat:.25},target:'none',targetConfidence:0,danger:0,dangerConfidence:0,overdrive:0 };
  Object.assign(player,{x:950,y:600,hp:100,angle:0,cooldown:0,inv:0,vx:0,vy:0});
  Object.assign(drone,{x:1020,y:600,hp:100,angle:0,cooldown:0,vx:0,vy:0,orbit:0,charges:2,boost:0});
  enemies.length=shots.length=hostileShots.length=pickups.length=particles.length=rings.length=0;
  for(let i=0;i<4;i++) spawnEnemy();
  ui.gameover.hidden=true; running=true; last=performance.now(); flash('drone link initialized');
}

function enemyStats(type){
  if(type==='tank') return {r:23,speed:58,hp:94+game.wave*8,damage:20,value:220,color:'#f9a267'};
  if(type==='shooter') return {r:15,speed:78,hp:45+game.wave*3,damage:12,value:160,color:'#d66cff'};
  return {r:13,speed:103+game.wave*2,hp:33+game.wave*2,damage:14,value:110,color:'#ff675f'};
}
function spawnEnemy(){
  const m=70, side=Math.floor(Math.random()*4); let x,y;
  if(side===0){x=rnd(m,world.w-m);y=m}else if(side===1){x=world.w-m;y=rnd(m,world.h-m)}else if(side===2){x=rnd(m,world.w-m);y=world.h-m}else{x=m;y=rnd(m,world.h-m)}
  const r=Math.random(); const type=game.wave>=3&&r>.78?'tank':game.wave>=2&&r>.55?'shooter':'chaser';
  const s=enemyStats(type); enemies.push({id:`e${Math.random().toString(36).slice(2,7)}`,type,x,y,...s,maxHp:s.hp,hit:0,fire:rnd(.4,1.3),phase:Math.random()*TAU});
}
function fire(from,angle,owner,speed,damage){
  shots.push({x:from.x+Math.cos(angle)*(from.r+8),y:from.y+Math.sin(angle)*(from.r+8),vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r:3,life:1.3,owner,damage});
}
function enemyFire(e,angle){ hostileShots.push({x:e.x,y:e.y,vx:Math.cos(angle)*290,vy:Math.sin(angle)*290,r:4,life:4,damage:9+game.wave*.45}); }
function maybeDrop(e){
  if(Math.random()>.23)return;
  const kind=player.hp<55&&Math.random()<.5?'repair':drone.hp<55&&Math.random()<.45?'drone':'charge';
  pickups.push({id:`p${Math.random().toString(36).slice(2,7)}`,kind,x:e.x,y:e.y,r:8,life:12,phase:0,color:kind==='repair'?'#78f4ff':kind==='drone'?'#b7ff53':'#ffca67'});
}
function kill(e){
  enemies.splice(enemies.indexOf(e),1); game.score+=e.value; game.kills++; burst(e.x,e.y,e.color,18,230); ring(e.x,e.y,e.color); maybeDrop(e); cam.shake=Math.max(cam.shake,e.type==='tank'?8:4);
  if(game.kills>=game.goal){ game.wave++;game.kills=0;game.goal=7+game.wave*3;game.spawnEvery=Math.max(.5,1.3-game.wave*.07);player.hp=Math.min(100,player.hp+14);if(game.wave%2===0)drone.charges=Math.min(3,drone.charges+1);flash(`wave ${game.wave} // pressure increased`); }
}
function collect(p){
  if(p.kind==='repair') player.hp=Math.min(100,player.hp+28);
  else if(p.kind==='drone') drone.hp=Math.min(100,drone.hp+34);
  else drone.charges=Math.min(3,drone.charges+1);
  game.score+=45; burst(p.x,p.y,p.color,12,170); flash(p.kind==='charge'?'overdrive charge acquired':p.kind==='repair'?'integrity restored':'drone repaired');
}

function nearest(list,from){ return list.reduce((best,o)=>!best||distance(from,o)<distance(from,best)?o:best,null); }
function target(){ if(game.decision.target==='none') return null; return enemies.find(e=>e.id===game.decision.target) || nearest(enemies,drone); }
function heuristic(){
  const near=enemies.filter(e=>distance(player,e)<250).length, repair=pickups.find(p=>p.kind==='repair'), t=nearest(enemies,player); let posture='engage';
  if(player.hp<28||near>=5)posture='retreat'; else if(repair&&player.hp<62)posture='scavenge'; else if(t&&distance(player,t)<150)posture='guard';
  return { posture,postureConfidence:.72,postureProbabilities:{engage:posture==='engage'?.72:.09,guard:posture==='guard'?.72:.09,scavenge:posture==='scavenge'?.72:.09,retreat:posture==='retreat'?.72:.09},target:t?.id||'none',targetConfidence:t?.78:1,danger:clamp(near*.75+(100-player.hp)/35,0,4),dangerConfidence:.7,overdrive:near>=4&&drone.charges>0?.88:.12 };
}
function aiState(){
  const threat=e=>{const n=(e.type==='tank'?3:e.type==='shooter'?2:1)+(distance(player,e)<130?3:distance(player,e)<260?2:distance(player,e)<430?1:0);return n>=5?'high':n>=3?'medium':'low'};
  return {
    player:{health_pct:Math.round(player.hp),speed:Math.round(Math.hypot(player.vx,player.vy)),currently_firing:mouse.down||keys.has('Space')},
    drone:{health_pct:Math.round(drone.hp),overdrive_charges:drone.charges,distance_to_player:Math.round(distance(player,drone))},
    wave:game.wave,enemies_alive:enemies.length,
    enemies:[...enemies].sort((a,b)=>distance(player,a)-distance(player,b)).slice(0,5).map(e=>({id:e.id,type:e.type,distance:Math.round(distance(player,e)),health_pct:Math.round(e.hp/e.maxHp*100),threat:threat(e)})),
    pickups:[...pickups].sort((a,b)=>distance(player,a)-distance(player,b)).slice(0,4).map(p=>({id:p.id,kind:p.kind,distance:Math.round(distance(player,p))}))
  };
}
async function askJev(){
  if(!running||!game.aiEnabled||game.aiBusy)return; game.aiBusy=true; const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),3200);
  try{
    const r=await fetch('/api/decision',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({state:aiState()}),signal:controller.signal}); const data=await r.json(); if(!r.ok)throw new Error(data.error||r.status);
    const p=data.answers.posture,t=data.answers.target,d=data.answers.danger,o=data.answers.overdrive;
    game.decision={posture:p.confidence<.34?'guard':p.choice,postureConfidence:p.confidence,postureProbabilities:p.probabilities,target:t.choice,targetConfidence:t.confidence,danger:d.score,dangerConfidence:d.confidence,overdrive:o.noul}; game.aiSource='jev';game.aiLatency=data.latency_ms||0;
    if(o.noul>.78&&drone.charges>0&&drone.boost<=0){drone.charges--;drone.boost=2.7;ring(drone.x,drone.y,'#b7ff53');flash('Jev authorized overdrive');}
  }catch{ game.aiSource='fallback';game.decision=heuristic(); } finally{ clearTimeout(timer);game.aiBusy=false; }
}

function updatePlayer(dt){
  let x=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0), y=(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0); const m=mag(x,y); if(x||y){x/=m;y/=m}else{x=0;y=0}
  player.vx=x*player.speed;player.vy=y*player.speed;player.x=clamp(player.x+player.vx*dt,28,world.w-28);player.y=clamp(player.y+player.vy*dt,28,world.h-28);player.cooldown-=dt;player.inv=Math.max(0,player.inv-dt);
  const wx=mouse.x+cam.x,wy=mouse.y+cam.y;player.angle=Math.atan2(wy-player.y,wx-player.x);
  if((mouse.down||keys.has('Space'))&&player.cooldown<=0){fire(player,player.angle,'player',800,20);player.cooldown=.115;}
}
function droneGoal(){
  const posture=game.decision.posture,t=target(),p=nearest(pickups.filter(x=>x.kind!=='repair'||player.hp<60),drone);
  if(posture==='scavenge'&&p)return p;
  if(posture==='engage'&&t){const x=player.x-t.x,y=player.y-t.y,m=mag(x,y);return{x:t.x+x/m*145,y:t.y+y/m*145};}
  if(posture==='retreat'&&enemies.length){const near=[...enemies].sort((a,b)=>distance(player,a)-distance(player,b)).slice(0,4),c=near.reduce((q,e)=>({x:q.x+e.x,y:q.y+e.y}),{x:0,y:0});c.x/=near.length;c.y/=near.length;const x=player.x-c.x,y=player.y-c.y,m=mag(x,y);return{x:clamp(player.x+x/m*140,40,world.w-40),y:clamp(player.y+y/m*140,40,world.h-40)};}
  drone.orbit+=.025;return{x:player.x+Math.cos(drone.orbit)*65,y:player.y+Math.sin(drone.orbit)*65};
}
function updateDrone(dt){
  drone.cooldown-=dt;drone.boost=Math.max(0,drone.boost-dt);const g=droneGoal(),x=g.x-drone.x,y=g.y-drone.y,m=mag(x,y);drone.vx+=(x/m)*820*dt;drone.vy+=(y/m)*820*dt;const s=Math.hypot(drone.vx,drone.vy),max=drone.boost>0?370:270;if(s>max){drone.vx=drone.vx/s*max;drone.vy=drone.vy/s*max}drone.vx*=Math.pow(.025,dt);drone.vy*=Math.pow(.025,dt);drone.x=clamp(drone.x+drone.vx*dt,25,world.w-25);drone.y=clamp(drone.y+drone.vy*dt,25,world.h-25);
  for(const p of [...pickups])if(p.kind!=='repair'&&distance(drone,p)<22){collect(p);pickups.splice(pickups.indexOf(p),1)}
  const t=target();if(t){drone.angle=Math.atan2(t.y-drone.y,t.x-drone.x);if(distance(drone,t)<550&&drone.cooldown<=0&&game.decision.posture!=='retreat'&&drone.hp>0){fire(drone,drone.angle+rnd(-.04,.04),'drone',730,drone.boost>0?26:15);drone.cooldown=drone.boost>0?.095:.28;}}
}
function updateEnemies(dt){
  for(const e of enemies){e.hit=Math.max(0,e.hit-dt);e.fire-=dt;e.phase+=dt;let tx=player.x,ty=player.y,d=distance(e,player);
    if(e.type==='shooter'){const x=player.x-e.x,y=player.y-e.y,m=mag(x,y),rad=clamp((d-310)/310,-1,1);tx=e.x+x/m*rad*170-y/m*Math.sin(e.phase)*100;ty=e.y+y/m*rad*170+x/m*Math.sin(e.phase)*100;if(d<520&&e.fire<=0){enemyFire(e,Math.atan2(player.y-e.y,player.x-e.x));e.fire=rnd(1,1.45);}}
    const x=tx-e.x,y=ty-e.y,m=mag(x,y);e.x+=x/m*e.speed*dt;e.y+=y/m*e.speed*dt;
    if(d<e.r+player.r+2&&player.inv<=0){player.hp-=e.damage;player.inv=.55;cam.shake=10;burst(player.x,player.y,'#ff675f',10,190);}
    if(distance(e,drone)<e.r+drone.r+2)drone.hp=Math.max(0,drone.hp-e.damage*dt*1.5);
  }
}
function updateShots(dt){
  for(const b of [...shots]){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;let hit=false;for(const e of enemies){if(Math.hypot(b.x-e.x,b.y-e.y)<b.r+e.r){e.hp-=b.damage;e.hit=.08;burst(b.x,b.y,b.owner==='drone'?'#b7ff53':'#78f4ff',4,90);if(e.hp<=0)kill(e);hit=true;break}}if(hit||b.life<=0||b.x<0||b.y<0||b.x>world.w||b.y>world.h)shots.splice(shots.indexOf(b),1)}
  for(const b of [...hostileShots]){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(distance(b,player)<b.r+player.r&&player.inv<=0){player.hp-=b.damage;player.inv=.3;b.life=0;cam.shake=6}else if(distance(b,drone)<b.r+drone.r){drone.hp=Math.max(0,drone.hp-b.damage*.75);b.life=0}if(b.life<=0)hostileShots.splice(hostileShots.indexOf(b),1)}
}
function updateMisc(dt){
  for(const p of [...pickups]){p.life-=dt;p.phase+=dt*2;if(distance(player,p)<23){collect(p);pickups.splice(pickups.indexOf(p),1)}else if(p.life<=0)pickups.splice(pickups.indexOf(p),1)}
  for(const p of [...particles]){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.pow(.08,dt);p.vy*=Math.pow(.08,dt);p.life-=dt;if(p.life<=0)particles.splice(particles.indexOf(p),1)}
  for(const r of [...rings]){r.r+=260*dt;r.life-=dt;if(r.life<=0)rings.splice(rings.indexOf(r),1)}cam.shake=Math.max(0,cam.shake-28*dt);
}
function update(dt){
  if(!running)return;updatePlayer(dt);updateDrone(dt);updateEnemies(dt);updateShots(dt);updateMisc(dt);
  game.spawn-=dt;if(game.spawn<=0&&enemies.length<6+game.wave*3){spawnEnemy();game.spawn=game.spawnEvery*rnd(.7,1.2)}
  game.aiClock-=dt;if(game.aiClock<=0){if(game.aiEnabled)askJev();else{game.aiSource='offline';game.decision=heuristic()}game.aiClock=.9}
  if(player.hp<=0){player.hp=0;running=false;ui.gameoverText.textContent=`Score ${game.score.toLocaleString()} · reached wave ${game.wave}.`;ui.gameover.hidden=false;}
}

function drawGrid(){
  const step=50,left=Math.floor(cam.x/step)*step,top=Math.floor(cam.y/step)*step;ctx.lineWidth=1;
  for(let x=left;x<cam.x+cam.w;x+=step){ctx.strokeStyle=x%250===0?'rgba(111,153,160,.11)':'rgba(111,153,160,.035)';ctx.beginPath();ctx.moveTo(x-cam.x,0);ctx.lineTo(x-cam.x,cam.h);ctx.stroke()}
  for(let y=top;y<cam.y+cam.h;y+=step){ctx.strokeStyle=y%250===0?'rgba(111,153,160,.11)':'rgba(111,153,160,.035)';ctx.beginPath();ctx.moveTo(0,y-cam.y);ctx.lineTo(cam.w,y-cam.y);ctx.stroke()}
  ctx.strokeStyle='rgba(183,255,83,.18)';ctx.lineWidth=2;ctx.strokeRect(-cam.x,-cam.y,world.w,world.h);
}
function entity(o,color,angle){const p=view(o);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(angle);ctx.fillStyle='#0b1015';ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,o.r,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle=color;ctx.fillRect(o.r*.2,-2,o.r+10,4);ctx.beginPath();ctx.arc(0,0,3,0,TAU);ctx.fill();ctx.restore()}
function draw(){
  cam.x=clamp(player.x-cam.w/2,0,Math.max(0,world.w-cam.w));cam.y=clamp(player.y-cam.h/2,0,Math.max(0,world.h-cam.h));ctx.setTransform(dpr,0,0,dpr,(cam.shake?rnd(-cam.shake,cam.shake):0)*dpr,(cam.shake?rnd(-cam.shake,cam.shake):0)*dpr);ctx.clearRect(-20,-20,cam.w+40,cam.h+40);ctx.fillStyle='#070a0e';ctx.fillRect(-20,-20,cam.w+40,cam.h+40);drawGrid();
  const t=target();if(t&&game.decision.target!=='none'){const a=view(drone),b=view(t);ctx.save();ctx.strokeStyle='rgba(183,255,83,.12)';ctx.setLineDash([4,7]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.restore()}
  for(const p of pickups){const q=view(p),pulse=1+Math.sin(p.phase*3)*.12;ctx.save();ctx.translate(q.x,q.y);ctx.rotate(p.phase);ctx.scale(pulse,pulse);ctx.fillStyle='#071014';ctx.strokeStyle=p.color;ctx.lineWidth=2;ctx.fillRect(-6,-6,12,12);ctx.strokeRect(-6,-6,12,12);ctx.fillStyle=p.color;if(p.kind==='repair'){ctx.fillRect(-1.5,-4,3,8);ctx.fillRect(-4,-1.5,8,3)}else{ctx.beginPath();ctx.arc(0,0,2.5,0,TAU);ctx.fill()}ctx.restore()}
  for(const b of shots){const p=view(b);ctx.fillStyle=b.owner==='drone'?'#b7ff53':'#78f4ff';ctx.shadowBlur=10;ctx.shadowColor=ctx.fillStyle;ctx.beginPath();ctx.arc(p.x,p.y,b.r,0,TAU);ctx.fill();ctx.shadowBlur=0}
  for(const b of hostileShots){const p=view(b);ctx.fillStyle='#ff675f';ctx.beginPath();ctx.arc(p.x,p.y,b.r,0,TAU);ctx.fill()}
  for(const e of enemies){const p=view(e);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(Math.atan2(player.y-e.y,player.x-e.x));ctx.fillStyle=e.hit>0?'#fff':'#0b1015';ctx.strokeStyle=e.color;ctx.lineWidth=e.type==='tank'?3:2;if(e.type==='tank'){ctx.beginPath();for(let i=0;i<6;i++){const a=i*TAU/6,x=Math.cos(a)*e.r,y=Math.sin(a)*e.r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.fill();ctx.stroke()}else if(e.type==='shooter'){ctx.rotate(Math.PI/4);ctx.fillRect(-10,-10,20,20);ctx.strokeRect(-10,-10,20,20)}else{ctx.beginPath();ctx.arc(0,0,e.r,0,TAU);ctx.fill();ctx.stroke()}ctx.restore();if(e.hp<e.maxHp){ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(p.x-16,p.y-e.r-10,32,3);ctx.fillStyle=e.color;ctx.fillRect(p.x-16,p.y-e.r-10,32*clamp(e.hp/e.maxHp,0,1),3)}}
  if(!(player.inv>0&&Math.floor(player.inv*20)%2===0))entity(player,'#78f4ff',player.angle);entity(drone,drone.hp>0?'#b7ff53':'#536036',drone.angle);
  for(const p of particles){const q=view(p);ctx.globalAlpha=clamp(p.life/p.max,0,1);ctx.fillStyle=p.color;ctx.fillRect(q.x,q.y,p.size,p.size)}ctx.globalAlpha=1;for(const r of rings){const q=view(r);ctx.globalAlpha=clamp(r.life/.35,0,1);ctx.strokeStyle=r.color;ctx.beginPath();ctx.arc(q.x,q.y,r.r,0,TAU);ctx.stroke()}ctx.globalAlpha=1;
  hud();
}
function dangerLabel(n){return n<.7?'calm':n<1.6?'manageable':n<2.6?'pressured':n<3.5?'dangerous':'critical'}
function hud(){
  const d=game.decision;ui.wave.textContent=game.wave;ui.score.textContent=String(Math.round(game.score)).padStart(5,'0');ui.hostiles.textContent=enemies.length;ui.hp.style.width=`${clamp(player.hp,0,100)}%`;ui.hpText.textContent=`${Math.round(clamp(player.hp,0,100))}%`;ui.droneHp.style.width=`${clamp(drone.hp,0,100)}%`;ui.droneText.textContent=`${Math.round(clamp(drone.hp,0,100))}%`;
  ui.posture.textContent=d.posture;ui.postureMeta.textContent=d.postureConfidence?`${Math.round(d.postureConfidence*100)}% confidence${d.postureConfidence<.34?' · gated':''}`:'waiting';ui.target.textContent=d.target;ui.targetMeta.textContent=d.targetConfidence?`${Math.round(d.targetConfidence*100)}% confidence`:'no lock';ui.danger.textContent=Number(d.danger).toFixed(1);ui.dangerMeta.textContent=dangerLabel(d.danger);ui.overdrive.textContent=`${Math.round(d.overdrive*100)}%`;ui.overdriveMeta.textContent=`charges: ${drone.charges}${drone.boost>0?' · ACTIVE':''}`;
  ui.source.className='live';if(!game.aiEnabled){ui.source.classList.add('offline');ui.source.textContent='JEV OFF'}else if(game.aiSource==='jev'){ui.source.textContent=`JEV · ${game.aiLatency}ms`}else if(game.aiSource==='fallback'){ui.source.classList.add('fallback');ui.source.textContent='SIM FALLBACK'}else{ui.source.classList.add('offline');ui.source.textContent='CONNECTING'}
  ui.probs.innerHTML=Object.entries(d.postureProbabilities||{}).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="prob-row"><span>${k}</span><div class="prob-track"><div class="prob-fill" style="width:${Math.round(v*100)}%"></div></div><b>${Math.round(v*100)}%</b></div>`).join('');
}
function loop(now){const dt=Math.min(.033,(now-last)/1000||0);last=now;update(dt);draw();requestAnimationFrame(loop)}

addEventListener('resize',resize);addEventListener('keydown',e=>{keys.add(e.code);if(e.code==='KeyJ'&&!e.repeat){game.aiEnabled=!game.aiEnabled;game.aiClock=0;flash(game.aiEnabled?'Jev decision link enabled':'Jev disabled · heuristic control')}if(e.code==='KeyR'&&!running&&ui.intro.hidden)reset();if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault()});addEventListener('keyup',e=>keys.delete(e.code));canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top});canvas.addEventListener('pointerdown',e=>{if(e.button===0)mouse.down=true});addEventListener('pointerup',e=>{if(e.button===0)mouse.down=false});canvas.addEventListener('contextmenu',e=>e.preventDefault());ui.start.onclick=()=>{ui.intro.hidden=true;reset()};ui.restart.onclick=reset;
resize();draw();requestAnimationFrame(loop);
