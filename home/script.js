
/* Parallax + fireflies + bottom sheet control */
(function(){
  const hero = document.querySelector('.hero');
  const bg = document.querySelector('.bg');
  const front = document.querySelector('.front');

  function parallax(e){
    const r = hero.getBoundingClientRect();
    const cx = (e.clientX - r.left) / r.width - .5;
    const cy = (e.clientY - r.top) / r.height - .5;
    // tiny moves for parallax
    bg.style.transform = `translate(${cx*10}px, ${cy*8}px)`;
    front.style.transform = `translate(${cx*-14}px, ${cy*-10}px)`;
  }
  hero.addEventListener('pointermove', parallax);

  // Fireflies seed
  function seed(container, n, topShift=0){
    for(let i=0;i<n;i++){
      const s = document.createElement('span');
      s.style.left = (Math.random()*92+4) + '%';
      s.style.top  = (Math.random()*60+topShift) + '%';
      s.style.animationDelay = (i*0.2)+'s';
      container.appendChild(s);
    }
  }
  seed(document.querySelector('.fireflies.back'), 20, 5);
  seed(document.querySelector('.fireflies.frontFF'), 14, 10);

  // Bottom sheet
  const sheet = document.getElementById('sheet');
  const openBtn = document.getElementById('openMenu');
  const closeBtn = document.getElementById('closeSheet');
  function open(){ sheet.hidden=false; requestAnimationFrame(()=> sheet.classList.add('open')); openBtn.setAttribute('aria-expanded','true'); }
  function close(){ sheet.classList.remove('open'); setTimeout(()=> sheet.hidden=true, 280); openBtn.setAttribute('aria-expanded','false'); }
  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);

  // Re-open on scroll down gesture
  let lastY = window.scrollY;
  window.addEventListener('wheel', (e)=>{
    if(e.deltaY>20 && !sheet.classList.contains('open')) open();
  }, {passive:true});
})();
