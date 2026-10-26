const raiz = document.documentElement;
const intro = document.getElementById('intro');

/* ==========================================================
   Scroll Trigger: revela cada elemento com [data-reveal]
   quando ele entra na tela
   ========================================================== */
let revelarIniciado = false;

function iniciarRevelar() {
  if (revelarIniciado) return;
  revelarIniciado = true;

  const itens = document.querySelectorAll('[data-reveal]');
  const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mostrar(el) {
    el.classList.add('is-visible');

    // Ao terminar a animação, devolve o elemento ao CSS normal
    // (assim o hover dos cards e botões volta à velocidade original)
    el.addEventListener('transitionend', function fim(e) {
      if (e.target === el && e.propertyName === 'transform') {
        el.removeAttribute('data-reveal');
        el.classList.remove('is-visible');
        el.removeEventListener('transitionend', fim);
      }
    });
  }

  if (reduzMovimento || !('IntersectionObserver' in window)) {
    itens.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        mostrar(entrada.target);
        observer.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  itens.forEach((el) => observer.observe(el));
}

/* ==========================================================
   Motion intro: letras entram devagar, da esquerda para a direita
   ========================================================== */
function iniciarIntro() {
  // Quebra o texto em letras; cada uma recebe seu atraso (--i) no CSS
  const alvo = intro.querySelector('.intro__letras');
  let i = 0;
  let palavra = 0;
  for (const letra of alvo.dataset.texto) {
    const span = document.createElement('span');
    span.textContent = letra === ' ' ? '\u00A0' : letra;
    span.style.setProperty('--i', i++);
    if (palavra > 0) span.classList.add('destaque');
    if (letra === ' ') palavra++;
    alvo.appendChild(span);
  }

  let saiu = false;
  const botao = intro.querySelector('.intro__pular');

  function limpar() {
    if (!intro.isConnected) return;
    intro.remove();
    raiz.classList.remove('intro-ativa');
  }

  function sair() {
    if (saiu) return;
    saiu = true;
    clearTimeout(tempo);
    try { sessionStorage.setItem('introVista', '1'); } catch (e) {}

    intro.classList.add('is-saindo');                 // a cortina sobe
    setTimeout(iniciarRevelar, 450);                  // o site começa a aparecer junto
    intro.addEventListener('transitionend', (e) => {
      if (e.target === intro && e.propertyName === 'transform') limpar();
    });
    setTimeout(limpar, 1800);                         // garantia
  }

  const tempo = setTimeout(sair, 5400);               // duração total da intro
  botao.addEventListener('click', (e) => { e.stopPropagation(); sair(); });
  intro.addEventListener('click', sair);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') sair(); });
}

if (intro && !raiz.classList.contains('sem-intro')) {
  iniciarIntro();
} else {
  if (intro) intro.remove();
  raiz.classList.remove('intro-ativa');
  iniciarRevelar();
}
