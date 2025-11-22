// ===== Parpadeo sincronizado + Calibración y Audio =====
const BLINK_INTERVAL_MS = 4000;
const START_VOLUME = 0.7;

// Vistas
const intro = document.getElementById('intro');
const transitionView = document.getElementById('transition');
const home = document.getElementById('home');
const btnAcompanhar = document.getElementById('btnAcompanhar');
const btnVolver = document.getElementById('btnVolver');

// Ojos
const doc = document.documentElement;
const wrap = document.getElementById('wrap');
const eyeL = document.getElementById('eyeL');
const eyeR = document.getElementById('eyeR');
const eyes = [eyeL, eyeR];

// Calibración UI
const handles = document.getElementById('handles');
const hL = document.getElementById('hL');
const hR = document.getElementById('hR');
const rL = document.getElementById('rL');
const rR = document.getElementById('rR');
const size = document.getElementById('size');
const sz = document.getElementById('sz');
const saveBtn = document.getElementById('save');
const resetBtn = document.getElementById('reset');
const calibPanel = document.getElementById('calib');

function pct(v){ return parseFloat(String(v).replace('%','')); }
function setEyeVars({lx,ly,rx,ry,s}){
  doc.style.setProperty('--eye-left-x', lx+'%');
  doc.style.setProperty('--eye-left-y', ly+'%');
  doc.style.setProperty('--eye-right-x', rx+'%');
  doc.style.setProperty('--eye-right-y', ry+'%');
  doc.style.setProperty('--eye-size', s+'%');
  doc.style.setProperty('--eye-ratio', .75);
  // actualizar aros de referencia al tamaño real
  const W = wrap.clientWidth, H = wrap.clientHeight;
  rL.style.left = lx+'%'; rL.style.top = ly+'%';
  rR.style.left = rx+'%'; rR.style.top = ry+'%';
  rL.style.width = rR.style.width = (s/100*W)+'px';
  rL.style.height = rR.style.height = (s*.75/100*H)+'px';
}
function current(){
  return {
    lx: pct(getComputedStyle(doc).getPropertyValue('--eye-left-x')||42),
    ly: pct(getComputedStyle(doc).getPropertyValue('--eye-left-y')||41.5),
    rx: pct(getComputedStyle(doc).getPropertyValue('--eye-right-x')||58),
    ry: pct(getComputedStyle(doc).getPropertyValue('--eye-right-y')||41.5),
    s:  parseFloat(size.value||10)
  };
}
function initEyes(){
  try{
    const saved = JSON.parse(localStorage.getItem('aeloria_eyes')||'null');
    if(saved){
      size.value = saved.s; sz.textContent = saved.s+'%';
      setEyeVars(saved);
      hL.style.left = saved.lx+'%'; hL.style.top = saved.ly+'%';
      hR.style.left = saved.rx+'%'; hR.style.top = saved.ry+'%';
    }else{
      const d = {lx:42,ly:41.5,rx:58,ry:41.5,s:10};
      setEyeVars(d);
      hL.style.left = d.lx+'%'; hL.style.top = d.ly+'%';
      hR.style.left = d.rx+'%'; hR.style.top = d.ry+'%';
    }
  }catch(e){}
}
function rectToPct(x,y){
  const r = wrap.getBoundingClientRect();
  return {px:(x-r.left)/r.width*100, py:(y-r.top)/r.height*100};
}
function drag(handle, which){
  let on=false;
  handle.addEventListener('pointerdown', e=>{ on=true; handle.setPointerCapture(e.pointerId); });
  window.addEventListener('pointerup', ()=> on=false);
  window.addEventListener('pointermove', e=>{
    if(!on) return;
    const {px,py} = rectToPct(e.clientX,e.clientY);
    handle.style.left = px+'%'; handle.style.top = py+'%';
    const d = current();
    if(which==='L'){ d.lx=px; d.ly=py; } else { d.rx=px; d.ry=py; }
    setEyeVars(d);
  });
}
function toggleGuides(){
  handles.classList.toggle('ui-hidden');
  calibPanel.classList.toggle('ui-hidden');
}
window.addEventListener('keydown', e=>{ if(e.key.toLowerCase()==='c') toggleGuides(); });

// init on load
window.addEventListener('load', ()=>{
  if(wrap){ if(wrap.clientWidth>0) initEyes(); else requestAnimationFrame(initEyes); }
});
window.addEventListener('resize', ()=>{ setEyeVars(current()); });

size.addEventListener('input', ()=>{ sz.textContent=size.value+'%'; const d=current(); d.s=parseFloat(size.value); setEyeVars(d); });
saveBtn.addEventListener('click', ()=>{ localStorage.setItem('aeloria_eyes', JSON.stringify(current())); alert('Alineación guardada ✓'); });
resetBtn.addEventListener('click', ()=>{ localStorage.removeItem('aeloria_eyes'); initEyes(); });
drag(hL,'L'); drag(hR,'R');

// ===== Parpadeo sincronizado
function blinkOnceBoth(){
  eyes.forEach(e => {
    e.classList.remove('blink');
    void e.offsetWidth;
    e.classList.add('blink');
  });
  setTimeout(()=> eyes.forEach(e=> e.classList.remove('blink')), 450);
}
let blinkTimer = setInterval(blinkOnceBoth, BLINK_INTERVAL_MS);

// ===== Audio
const audio = document.getElementById('bgm');
const audioToggle = document.getElementById('audioToggle');
function tryPlayAudio(){
  if (!audio) return;
  audio.volume = START_VOLUME;
  const p = audio.play();
  if (p && p.catch){ p.catch(()=>{}); }
}
(function initAudio(){
  try{
    const saved = localStorage.getItem('aeloria_mute');
    if(saved==='1'){ audio.muted=true; audioToggle.textContent='🔇'; }
  }catch(e){}
  tryPlayAudio();
  ['pointerdown','touchstart','keydown'].forEach(evt=>{
    window.addEventListener(evt, ()=>{
      audio.muted = false;
      tryPlayAudio();
    }, {once:true});
  });
})();
audioToggle.addEventListener('click', ()=>{
  const m = !audio.muted; audio.muted = m;
  audioToggle.textContent = m ? '🔇' : '🔊';
  try{ localStorage.setItem('aeloria_mute', m?'1':'0'); }catch(e){}
  if (!m) tryPlayAudio();
});

// ===== Flujo de vistas
btnAcompanhar.addEventListener('click', ()=>{
  intro.classList.remove('view--active'); intro.classList.add('view--hidden');
  transitionView.classList.remove('view--hidden'); transitionView.classList.add('view--active');
  setTimeout(()=>{
    transitionView.classList.remove('view--active'); window.location.href = "../home/index.html"; home.classList.add('view--active');
  }, 4500);
});
btnVolver.addEventListener('click', ()=>{
  home.classList.remove('view--active'); home.classList.add('view--hidden');
  intro.classList.remove('view--hidden'); intro.classList.add('view--active');
});
