// ALICIA · Villa Devoto — demo (v2)
// Intro: la carta que se abre (logo que se entinta + las dos mitades de la hoja que se separan).
// WOW 1: el reloj (la página sigue la hora real de Buenos Aires: fotos, textos y modo noche con las lámparas prendidas).
// WOW 2: la carta a máquina (títulos que se tipean + foto del plato al pasar el mouse).
// WOW 6: la comanda (el carrito del kit, impreso como ticket: estilos en style.css).
// Cava: los vinos como lomos de libros en estantes, filtrables por cepa.
import { initKit } from '../kit/kit.js?v=3';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
const html = document.documentElement;
let WA = '';   // sale de cliente.json ("whatsapp"), un solo lugar para cambiarlo

/* =============== INTRO =============== */
// Espera el logo, las fuentes y la foto grande del hero (máx. 2,6 s) y abre la hoja.
(function intro() {
  if (!html.classList.contains('con-intro')) { html.classList.add('listo', 'intro-fin'); return; }
  const t0 = performance.now();
  const MIN = 1500, MAX = 2600;
  const fotoHero = $('[data-slot="a"]');
  const cargas = [
    document.fonts ? document.fonts.ready : Promise.resolve(),
    fotoHero && !fotoHero.complete ? new Promise(r => { fotoHero.addEventListener('load', r, { once: true }); fotoHero.addEventListener('error', r, { once: true }); }) : Promise.resolve(),
  ];
  let abierto = false;
  const abrir = () => {
    if (abierto) return; abierto = true;
    html.classList.add('intro-abre');
    setTimeout(() => html.classList.add('listo'), 380);
    setTimeout(() => html.classList.add('intro-fin'), 1150);
  };
  Promise.all(cargas).then(() => setTimeout(abrir, Math.max(0, MIN - (performance.now() - t0))));
  setTimeout(abrir, MAX);
})();

/* =============== ENTRADAS AL SCROLL =============== */
const obsRevela = new IntersectionObserver((ents) => {
  ents.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('visto');
    if (e.target.matches('[data-tipea]')) tipearTitulo(e.target);
    obsRevela.unobserve(e.target);
  });
}, { threshold: .18, rootMargin: '0px 0px -6% 0px' });
$$('[data-revela], [data-tipea], .hoja.carta').forEach(el => obsRevela.observe(el));

function tipearTitulo(el) {
  if (quieto) return;
  const texto = el.dataset.texto || el.textContent.trim();
  el.dataset.texto = texto; el.setAttribute('aria-label', texto);
  escribir(el, texto, null);
}

// máquina de escribir (un timer por elemento)
const timers = new WeakMap();
function escribir(el, texto, alTerminar) {
  clearTimeout(timers.get(el));
  if (quieto) { el.textContent = texto; return; }
  // el texto completo ya ocupa su lugar (invisible): el título no cambia de alto mientras se tipea
  el.innerHTML = '<span class="ya"></span><span class="cursor" aria-hidden="true"></span><span class="falta" aria-hidden="true"></span>';
  const ya = el.firstChild, falta = el.lastChild;
  falta.textContent = texto;
  let i = 0;
  const paso = () => {
    i++; ya.textContent = texto.slice(0, i); falta.textContent = texto.slice(i);
    if (i < texto.length) timers.set(el, setTimeout(paso, texto[i - 1] === ' ' ? 80 : 34 + Math.random() * 40));
    else timers.set(el, setTimeout(() => { el.textContent = texto; alTerminar && alTerminar(); }, 1100));
  };
  paso();
}

/* =============== BARRA =============== */
const barra = $('.barra');
let sombraPend = false;
addEventListener('scroll', () => {
  if (sombraPend) return; sombraPend = true;
  requestAnimationFrame(() => { barra.classList.toggle('con-sombra', scrollY > 10); sombraPend = false; });
}, { passive: true });

/* =============== PÁGINAS DE LA CARTA (igual que su carta impresa) =============== */
const PAGINAS = {
  manana: { titulo: 'Desayunos - Meriendas', horas: '8,30 a 11,30 hs.  /  16,00 a 19,30 hs.', foto: 'img/platos/tortas.webp', pie: 'Tortas de la merienda',
    cats: ['mananas', 'tardes', 'tortas', 'sandwiches', 'panaderia', 'pasteleria', 'sin-tacc', 'tapeo'] },
  cocina: { titulo: 'Almuerzo - Cena', horas: '12,00 a 16,00 hs.  /  A partir de las 20,00 hs.', foto: 'img/platos/agnolotti-cenital.webp', pie: 'Agnolotti de osobuco',
    cats: ['entradas', 'ensaladas', 'carnes', 'cocina', 'kids', 'postres', 'bebidas'] },
  barra: { titulo: 'Barra - Tragos Alicia', horas: 'Cafetería, té en hebras, jugos, cervezas y tragos', foto: 'img/local/salon-cobre.webp', pie: 'La barra',
    cats: ['cafeteria', 'te', 'jugos', 'cervezas', 'tragos-alicia', 'tragos-clasicos', 'whisky'] },
  cava: { titulo: 'Cava de vinos', horas: 'Cuarenta etiquetas y vino por copa', foto: '', pie: '',
    cats: ['vino-copa', 'malbec', 'cabernet', 'cabernet-franc', 'pinot-noir', 'blancos', 'rosados', 'espumantes'] },
};
const ORDEN_PAG = ['manana', 'cocina', 'barra', 'cava'];
const PARA_LLEVAR = new Set(['tortas', 'panaderia', 'pasteleria', 'sin-tacc']);
const paginaDe = (cat) => ORDEN_PAG.find(k => PAGINAS[k].cats.includes(cat)) || 'cocina';

/* =============== EL RELOJ =============== */
const MOMENTOS = {
  manana: { carta: 'manana', texto: 'Café con leche, tostadas de pan de campo y medialunas. Desayunos de 8,30 a 11,30 hs.',
    a: ['img/local/salon-vidrio.webp', 'El salón con luz de mañana', 'El salón a la mañana'], b: ['img/platos/salmon-close.webp', 'Ensalada de salmón'], c: ['img/local/fachada.webp', 'Fachada de Alicia'] },
  mediodia: { carta: 'cocina', texto: 'Pastas de la casa, arroz español y la pesca del día. Almuerzo de 12 a 16 hs.',
    a: ['img/platos/agnolotti-mesa.webp', 'Agnolotti de osobuco sobre mesa de madera', 'Agnolotti de osobuco', 'agnolotti-de-osobuco'], b: ['img/local/fachada.webp', 'Fachada de Alicia'], c: ['img/platos/ravioles-corte.webp', 'Ravioles de verdura'] },
  tarde: { carta: 'manana', texto: 'La hora del té para compartir y ocho tortas de la casa. Meriendas de 16 a 19,30 hs.',
    a: ['img/platos/cheesecake-mesa.webp', 'Cheesecake con frutos rojos sobre mesa de madera', 'Cheesecake', 'cheesecake'], b: ['img/local/salon-cobre.webp', 'Salón con lámparas de cobre'], c: ['img/platos/tortas.webp', 'Tortas de la merienda'] },
  noche: { carta: 'cocina', texto: 'Las lámparas prendidas, Tragos Alicia y una cava de cuarenta etiquetas. Cena desde las 20 hs.',
    a: ['img/local/salon-listones.webp', 'Salón de noche con pared de listones', 'La cena, desde las 20 hs.'], b: ['img/platos/paella-libro.webp', 'Arroz español'], c: ['img/platos/risotto-mano.webp', 'Risotto de hongos'] },
};
function horaBA() {
  const p = new Intl.DateTimeFormat('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', weekday: 'short', hourCycle: 'h23' }).formatToParts(new Date());
  const v = (t) => p.find(x => x.type === t)?.value;
  return { min: Number(v('hour')) * 60 + Number(v('minute')), dia: v('weekday') };
}
function momentoReal() {
  const { min, dia } = horaBA();
  const ayerFinde = /sáb|sab|dom/i.test(dia);       // la madrugada del sáb/dom sigue abierta hasta 1,30
  if (min >= 510 && min < 690) return { m: 'manana', abierto: true };
  if (min >= 690 && min < 960) return { m: 'mediodia', abierto: true };
  if (min >= 960 && min < 1170) return { m: 'tarde', abierto: true };
  if (min >= 1170) return { m: 'noche', abierto: true };
  if (ayerFinde && min < 90) return { m: 'noche', abierto: true };
  return { m: 'noche', abierto: false };
}
// ?momento=manana|mediodia|tarde|noche simula otra hora (para mostrar la demo de día aunque sea de noche)
const forzado = new URLSearchParams(location.search).get('momento');
const simular = () => (MOMENTOS[forzado] ? { m: forzado, abierto: true } : momentoReal());

let ctxKit = null;
let real = simular();
let momentoVisto = real.m;
let paginaActual = MOMENTOS[real.m].carta;
const seccionDe = {};                // sección abierta en cada página
let datos = { prods: [], cats: [], nombres: {} };

function precioDe(id) {
  const p = datos.prods.find(x => x.id === id);
  return p && p.precio != null && ctxKit ? ctxKit.money(p.precio) : '';
}
function cambiarImg(img, src, alt) {
  if (!img || img.getAttribute('src') === src) return;
  if (quieto) { img.src = src; img.alt = alt; return; }
  img.classList.add('saliendo');
  const pre = new Image(); pre.decoding = 'async'; pre.src = src;
  const listo = () => { img.src = src; img.alt = alt; requestAnimationFrame(() => requestAnimationFrame(() => img.classList.remove('saliendo'))); };
  setTimeout(() => (pre.complete ? listo() : (pre.onload = pre.onerror = listo)), 300);
}
function pintarPie() {
  const a = MOMENTOS[momentoVisto].a;
  const precio = a[3] ? precioDe(a[3]) : '';
  $('[data-slot-pie="a"]').innerHTML = `${esc(a[2])}${precio ? ` <span>${esc(precio)}</span>` : ''}`;
}
function aplicarMomento(m, { cartaTambien = false } = {}) {
  momentoVisto = m;
  const M = MOMENTOS[m];
  html.classList.remove('manana', 'mediodia', 'tarde', 'noche');
  html.classList.add(m);
  $('meta[name="theme-color"]').content = m === 'noche' ? '#100F0E' : '#E8E3DC';
  ['a', 'b', 'c'].forEach(k => cambiarImg($(`[data-slot="${k}"]`), M[k][0], M[k][1]));
  pintarPie();
  const cerrado = m === real.m && !real.abierto;
  $('[data-momento-texto]').textContent = (cerrado ? 'Ahora estamos cerrados: abrimos a las 8,30. ' : '') + M.texto;
  $$('.reloj__btn').forEach(b => {
    b.classList.toggle('activo', b.dataset.momento === m);
    b.classList.toggle('es-ahora', b.dataset.momento === real.m && real.abierto);
    b.setAttribute('aria-pressed', b.dataset.momento === m);
  });
  if (cartaTambien) irPagina(M.carta, { tipear: false });
}
$$('.reloj__btn').forEach(b => b.addEventListener('click', () => aplicarMomento(b.dataset.momento, { cartaTambien: true })));
// la primera vez no cambia las fotos con fundido (ya vienen con la entrada)
['a', 'b', 'c'].forEach(k => { const im = $(`[data-slot="${k}"]`); im.src = MOMENTOS[real.m][k][0]; im.alt = MOMENTOS[real.m][k][1]; });
aplicarMomento(real.m);
setInterval(() => {
  const ahora = simular();
  if (ahora.m !== real.m || ahora.abierto !== real.abierto) { const seguia = momentoVisto === real.m; real = ahora; aplicarMomento(seguia ? real.m : momentoVisto); }
}, 60000);

/* =============== LA CARTA =============== */
const cartaEl = $('[data-kit="carta"]');

function catsDePagina(pg) { return PAGINAS[pg].cats.filter(c => datos.prods.some(p => p.categoria === c)); }

function irPagina(pg, { tipear = true, seccion = null } = {}) {
  paginaActual = pg;
  const P = PAGINAS[pg];
  $$('.pagina').forEach(b => b.setAttribute('aria-selected', b.dataset.pagina === pg));
  const t = $('[data-maquina]');
  if (tipear) escribir(t, P.titulo); else { clearTimeout(timers.get(t)); t.textContent = P.titulo; }
  $('[data-pagina-horas]').textContent = P.horas;
  const esCava = pg === 'cava';
  $('#carta').classList.toggle('en-cava', esCava);
  $('[data-cava]').hidden = !esCava;
  cartaEl.hidden = esCava; $('[data-seccion-cabeza]').hidden = esCava; $('[data-pasar]').hidden = esCava;
  if (esCava) { $('[data-indice]').innerHTML = ''; requestAnimationFrame(() => $('[data-cava]').classList.add('visto')); return; }
  if (P.foto) marco(P.foto, esc(P.pie), true);
  pintarIndice();
  abrirSeccion(seccion || seccionDe[pg] || catsDePagina(pg)[0], { animar: tipear || !!seccion });
  if (seccion) setTimeout(() => $('#carta').scrollIntoView({ behavior: quieto ? 'auto' : 'smooth', block: 'start' }), 40);
}

function pintarIndice() {
  const cats = catsDePagina(paginaActual);
  const actual = seccionDe[paginaActual] || cats[0];
  $('[data-indice]').innerHTML = `<p class="indice__t">En esta página</p>` + cats.map(c => {
    const n = datos.prods.filter(p => p.categoria === c).length;
    return `<button type="button" data-seccion="${esc(c)}" aria-current="${c === actual}">${esc(datos.nombres[c] || c)}<small>${n}</small></button>`;
  }).join('');
}

function abrirSeccion(cat, { animar = true } = {}) {
  if (!cat) return;
  seccionDe[paginaActual] = cat;
  $$('[data-seccion]').forEach(b => b.setAttribute('aria-current', b.dataset.seccion === cat));
  const activo = $('[data-seccion][aria-current="true"]');
  if (activo && innerWidth <= 900) activo.scrollIntoView({ block: 'nearest', inline: 'center', behavior: quieto ? 'auto' : 'smooth' });
  // panel visible
  $$('.kit-carta__panel', cartaEl).forEach(p => {
    const on = p.dataset.cat === cat;
    p.classList.toggle('activo', on);
    p.classList.remove('entra');
    if (on) {
      const its = p.querySelectorAll('.kit-item'), conDesc = p.querySelectorAll('.plato__desc').length;
      p.classList.toggle('dos-col', its.length > 8 && conDesc / its.length < .4);   // 2 columnas solo para listas cortas (café, tragos…)
      if (animar && !quieto) { void p.offsetWidth; p.classList.add('entra'); }
    }
  });
  // cabecera de la sección
  const llevar = PARA_LLEVAR.has(cat);
  $('[data-seccion-cabeza]').innerHTML = `<h3>${esc(datos.nombres[cat] || cat)}</h3>${llevar
    ? '<p class="llevar"><span class="punto-foto" aria-hidden="true"></span>También para llevar: sumalo a tu comanda y lo retirás en el local.</p>'
    : `<p>${datos.prods.filter(p => p.categoria === cat).length} opciones</p>`}`;
  // anterior / siguiente
  const cats = catsDePagina(paginaActual);
  const i = cats.indexOf(cat);
  const ant = cats[i - 1], sig = cats[i + 1];
  const pgSig = !sig ? ORDEN_PAG[ORDEN_PAG.indexOf(paginaActual) + 1] : null;
  $('[data-pasar]').innerHTML =
    (ant ? `<button type="button" data-ir-sec="${esc(ant)}"><small>Anterior</small><b>← ${esc(datos.nombres[ant])}</b></button>` : '') +
    (sig ? `<button type="button" data-ir-sec="${esc(sig)}"><small>Siguiente</small><b>${esc(datos.nombres[sig])} →</b></button>`
      : pgSig ? `<button type="button" data-ir-pag="${pgSig}"><small>Siguiente página</small><b>${esc($(`.pagina[data-pagina="${pgSig}"] b`).textContent)} →</b></button>` : '');
}

$$('.pagina').forEach(b => b.addEventListener('click', () => irPagina(b.dataset.pagina)));
$('.paginas').addEventListener('keydown', (e) => {
  if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
  const tabs = $$('.pagina'); const i = tabs.indexOf(document.activeElement); if (i < 0) return;
  const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length]; n.focus(); n.click();
});
$('[data-indice]').addEventListener('click', (e) => { const b = e.target.closest('[data-seccion]'); if (b) abrirSeccion(b.dataset.seccion); });
$('[data-pasar]').addEventListener('click', (e) => {
  const s = e.target.closest('[data-ir-sec]'), p = e.target.closest('[data-ir-pag]');
  if (s) abrirSeccion(s.dataset.irSec); else if (p) irPagina(p.dataset.irPag); else return;
  const top = $('.carta__cuerpo').getBoundingClientRect().top;
  if (top < 0) $('.carta__cuerpo').scrollIntoView({ behavior: quieto ? 'auto' : 'smooth', block: 'start' });
});

// la primera vez que la carta entra en pantalla, el título se escribe a máquina
const obsTitulo = new IntersectionObserver((ents) => {
  if (ents.some(e => e.isIntersecting)) { escribir($('[data-maquina]'), PAGINAS[paginaActual].titulo); obsTitulo.disconnect(); }
}, { threshold: .6 });
obsTitulo.observe($('.carta__titulo'));

// foto en la caja de al lado
let marcoTimer = null;
function marco(src, pie, inmediato = false) {
  clearTimeout(marcoTimer);
  marcoTimer = setTimeout(() => { cambiarImg($('[data-marco-img]'), src, ''); $('[data-marco-pie]').innerHTML = pie; }, inmediato ? 0 : 70);
}

/* plantilla de cada plato (dentro del kit) */
function plantilla(p, ctx) {
  const precio = ctx.money(p.precio);
  const llevar = PARA_LLEVAR.has(p.categoria);
  let accion = '';
  if (p.disponible === false) accion = '<span class="kit-badge kit-badge--off">Sin stock hoy</span>';
  else if (llevar && p.precio == null) accion = `<a class="consultar" href="https://wa.me/${WA}?text=${encodeURIComponent(`Hola Alicia! Quería consultar por: ${p.nombre}`)}" target="_blank" rel="noopener">Consultar</a>`;
  else if (llevar) accion = `<div data-kit-qty="${esc(p.id)}"></div>`;
  return `<div class="plato">
    <h3 class="plato__nombre"><span class="plato__n">${esc(p.nombre)}</span>${p.foto ? '<span class="punto-foto" title="Tiene foto"></span>' : ''}${(p.etiquetas || []).map(ctx.etiquetaHTML).join('')}${p.foto ? `<button type="button" class="plato__foto-btn" aria-expanded="false">Ver foto</button>` : ''}</h3>
    <span class="plato__precio">${precio ? esc(precio) : 'Consultar'}</span>
    ${p.descripcion ? `<p class="plato__desc">${esc(p.descripcion)}</p>` : ''}
    <div class="plato__accion">${accion}</div>
    ${p.foto ? `<img class="plato__img" src="${esc(ctx.asset(p.foto))}" alt="${esc(p.nombre)}" loading="lazy" decoding="async">` : ''}
  </div>`;
}

/* cada vez que el kit dibuja la carta (al cargar y cuando el dueño edita en /admin) */
document.addEventListener('kit:carta', (e) => {
  const { el, productos, categorias } = e.detail;
  datos = { prods: productos, cats: categorias, nombres: Object.fromEntries(categorias.map(c => [c.id, c.nombre])) };
  $$('.kit-carta__panel', el).forEach(p => { p.dataset.cat = p.querySelector('.kit-item')?.dataset.cat || ''; p.hidden = false; });
  if (paginaActual !== 'cava') { pintarIndice(); abrirSeccion(seccionDe[paginaActual] && catsDePagina(paginaActual).includes(seccionDe[paginaActual]) ? seccionDe[paginaActual] : catsDePagina(paginaActual)[0], { animar: false }); }
  armarCava();
  pintarPie();
});

// foto al pasar (desktop, throttled) y "Ver foto" (celu)
let hoverPend = null;
cartaEl.addEventListener('pointerover', (e) => {
  if (e.pointerType !== 'mouse') return;
  const it = e.target.closest('.kit-item[data-photo]');
  if (!it || it.classList.contains('mirando') || hoverPend) return;
  hoverPend = requestAnimationFrame(() => {
    hoverPend = null;
    $$('.kit-item.mirando', cartaEl).forEach(x => x.classList.remove('mirando'));
    it.classList.add('mirando');
    marco(it.dataset.photo, `${esc(it.querySelector('.plato__n')?.textContent || '')} <span>${esc(it.querySelector('.plato__precio')?.textContent || '')}</span>`);
  });
});
cartaEl.addEventListener('click', (e) => {
  const b = e.target.closest('.plato__foto-btn'); if (!b) return;
  const pl = b.closest('.plato'); const on = !pl.classList.contains('ver-foto');
  pl.classList.toggle('ver-foto', on); b.setAttribute('aria-expanded', on); b.textContent = on ? 'Ocultar foto' : 'Ver foto';
});

/* =============== LA CAVA COMO BIBLIOTECA =============== */
const CEPAS = ['malbec', 'cabernet', 'cabernet-franc', 'pinot-noir', 'blancos', 'rosados', 'espumantes'];
const COLORES = {
  malbec: [['#4A1F24'], ['#3A1A20'], ['#5A2A2C'], ['#2F1519']],
  cabernet: [['#2E1A22'], ['#3D2230']], 'cabernet-franc': [['#4B2433'], ['#5C2B3C']], 'pinot-noir': [['#6A2C35'], ['#7A3540']],
  blancos: [['#D8C9A0', '#1A1817'], ['#C9B98A', '#1A1817']], rosados: [['#E3B9B0', '#1A1817'], ['#D9A49A', '#1A1817']],
  espumantes: [['#1F2A24'], ['#C9B98A', '#1A1817'], ['#2B2B2B']],
};
const CEPA_TXT = ['Malbec', 'Cabernet Sauvignon', 'Cabernet Franc', 'Pinot Noir', 'Chardonnay', 'Sauvignon Blanc', 'Torrontés'];
let filtroCava = 'todas';
const hash = (s) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };

function armarCava() {
  const conVinos = CEPAS.filter(c => datos.prods.some(p => p.categoria === c));
  if (filtroCava !== 'todas' && !conVinos.includes(filtroCava)) filtroCava = 'todas';
  $('[data-cava-filtros]').innerHTML = [['todas', 'Todas'], ...conVinos.map(c => [c, datos.nombres[c]])]
    .map(([id, n]) => `<button type="button" class="chip" data-filtro="${id}" aria-pressed="${id === filtroCava}">${esc(n)}</button>`).join('');
  pintarEstantes();
}
function pintarEstantes() {
  const { prods, nombres } = datos;
  const cats = CEPAS.filter(c => (filtroCava === 'todas' || c === filtroCava) && prods.some(p => p.categoria === c));
  $('[data-cava-estante]').innerHTML = cats.map(c => {
    const vinos = prods.filter(p => p.categoria === c);
    const quitar = new RegExp('\\s*\\b(' + [nombres[c], ...CEPA_TXT].filter(Boolean).map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b', 'gi');
    return `<div class="estante" role="group" aria-label="${esc(nombres[c])}"><span class="estante__cartel">${esc(nombres[c])}</span><div class="libros">
      ${vinos.map((v, i) => {
        const pal = COLORES[c] || [['#4A1F24']]; const [bg, fg] = pal[i % pal.length];
        const lomo = v.nombre.replace(quitar, '').replace(/\s+/g, ' ').replace(/\s+de$/i, '').trim() || v.nombre;
        return `<button type="button" class="lomo" data-vino="${esc(v.id)}" aria-pressed="false" aria-label="${esc(v.nombre)}" style="--i:${i};--alto:${172 + (hash(v.id) % 44)}px;--color:${bg};${fg ? `--texto-lomo:${fg};` : ''}${v.disponible === false ? 'opacity:.45;' : ''}"><span>${esc(lomo)}</span></button>`;
      }).join('')}</div></div>`;
  }).join('');
  const copa = prods.filter(p => p.categoria === 'vino-copa');
  $('[data-cava-copa]').innerHTML = copa.length && filtroCava === 'todas'
    ? `<div class="cava__copa"><h3>${esc(nombres['vino-copa'] || 'Vino por copa')}</h3><ul>${copa.map(v => `<li><span>${esc(v.nombre)}</span><span>${esc(ctxKit?.money(v.precio) || 'Consultar')}</span></li>`).join('')}</ul></div>` : '';
}
$('[data-cava-filtros]').addEventListener('click', (e) => {
  const b = e.target.closest('[data-filtro]'); if (!b) return;
  filtroCava = b.dataset.filtro;
  $$('[data-filtro]').forEach(x => x.setAttribute('aria-pressed', x === b));
  pintarEstantes();
});
$('[data-cava-estante]').addEventListener('click', (e) => {
  const b = e.target.closest('.lomo'); if (!b) return;
  const ya = b.getAttribute('aria-pressed') === 'true';
  $$('.lomo').forEach(x => x.setAttribute('aria-pressed', 'false'));
  const det = $('[data-cava-detalle]');
  if (ya) { det.innerHTML = '<p class="cava__ayuda">Tocá una botella para sacarla del estante.</p>'; return; }
  b.setAttribute('aria-pressed', 'true');
  const v = datos.prods.find(p => p.id === b.dataset.vino); if (!v) return;
  det.innerHTML = `<p class="cava__nombre">${esc(v.nombre)}</p>
    <p class="cava__meta">${esc([v.descripcion, datos.nombres[v.categoria]].filter(Boolean).join(' / '))}${v.disponible === false ? ' / Sin stock hoy' : ''}</p>
    <p class="cava__precio">${esc(ctxKit?.money(v.precio) || 'Consultar')}</p>`;
  if (det.getBoundingClientRect().top < 0) det.scrollIntoView({ behavior: quieto ? 'auto' : 'smooth', block: 'center' });
});

/* =============== NAVEGACIÓN =============== */
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-ir-pagina]'); if (!a) return;
  irPagina(a.dataset.irPagina, { seccion: a.dataset.irSeccion || null });
});
const menuBtn = $('.barra__menu'), menu = $('#menu-movil');
const cerrarMenu = () => { menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Abrir menú'); };
menuBtn.addEventListener('click', () => {
  if (!menu.hidden) return cerrarMenu();
  menu.hidden = false; menuBtn.setAttribute('aria-expanded', 'true'); menuBtn.setAttribute('aria-label', 'Cerrar menú');
});
menu.addEventListener('click', (e) => { if (e.target.closest('a')) cerrarMenu(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) cerrarMenu(); });

$$('[data-gal]').forEach(b => b.addEventListener('click', () => {
  const tira = $('[data-gal-tira]');
  tira.scrollBy({ left: Number(b.dataset.gal) * tira.clientWidth * .8, behavior: quieto ? 'auto' : 'smooth' });
}));

/* =============== KIT =============== */
document.addEventListener('kit:listo', (e) => {
  ctxKit = e.detail;
  WA = String(ctxKit.config.whatsapp || '').replace(/\D/g, '');
  $$('[data-wa]').forEach(a => { if (WA) a.href = `https://wa.me/${WA}`; else a.hidden = true; });
});
irPagina(paginaActual, { tipear: false });
$('[data-maquina]').textContent = 'La carta';
initKit({
  config: 'cliente.json',
  carta: { template: plantilla, itemClass: 'item' },
  carrito: { label: 'Comanda', icono: '<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21V3Z"/><path d="M9 8h6M9 12h6M9 16h3"/></svg>' },
  badge: true,
}).then((ctx) => { ctxKit = ctx; pintarPie(); }).catch((err) => console.error(err));
