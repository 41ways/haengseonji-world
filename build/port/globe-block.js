// ══════════════════════════════ 지구본
/* 수도 사이 거리는 지구 곡면을 따라 잰다. 평면 지도에 펴면 브라질과 아프리카처럼 가까운 곳이
   양 끝으로 갈라져 보이므로, 정사영 지구본으로 그려 끌어서 돌린다 (d3-geo).
   부른 나라가 뒤편에 있으면 그쪽으로 돌아간다. 점·이름표는 HTML 이라 그릴 때마다 자리를 다시 잡는다 */
var cv, ctx, W = 0, H = 0, DPR = 1, proj, gpath;
var ROT = [-127, -28, 0], ZOOM = 1, ZMAX = 12;
var SPHERE = { type:'Sphere' }, GRAT = null, LAND = null, FEAT = [];
var drawQueued = false, fly = null, flown = null;
var BOUNDS = [], HOVI = null, HOVXY = null;   // 이지 모드 — 마우스가 올라간 나라와 그 자리

function decode(p, q){
  return p.map(function(poly){
    return poly.map(function(flat){
      var ring = [], x = 0, y = 0;
      for (var i = 0; i < flat.length; i += 2) { x += flat[i]; y += flat[i + 1]; ring.push([x / q, y / q]); }
      var a = ring[0], b = ring[ring.length - 1];
      if (a[0] !== b[0] || a[1] !== b[1]) ring.push([a[0], a[1]]);
      return ring;
    });
  }).map(function(poly){
    /* d3 는 바깥 고리가 시계 방향이어야 한다. 반대면 "지구에서 그 나라를 뺀 곳"이 되어 반구보다 넓어진다 */
    return d3.geoArea({ type:'Polygon', coordinates:poly }) > 2 * Math.PI
      ? poly.map(function(r){ return r.slice().reverse(); }) : poly;
  });
}
function asFeature(mp){ return { type:'Feature', geometry:{ type:'MultiPolygon', coordinates:mp } }; }

function palette(){
  var c = getComputedStyle(document.documentElement);
  var v = function(n, d){ return c.getPropertyValue(n).trim() || d; };
  return { sea:v('--sea', '#f1f0ec'), land:v('--land', '#e8e7e2'), off:v('--land-off', '#dddcd6'),
           line:v('--land-line', '#c7c5be'), ink:v('--ink', '#111'), grat:v('--line', '#dedcd6'), accent:v('--accent', '#2447d6') };
}
var PAL = null;
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(){ PAL = palette(); queueDraw(); });

function sizeGlobe(){
  var r = cv.getBoundingClientRect();
  if (!r.width) return;
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = r.width; H = r.height;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  draw();                                   // 크기를 바꾸면 캔버스가 지워지므로 기다리지 않고 바로
}
function queueDraw(){
  if (drawQueued) return;
  drawQueued = true;
  requestAnimationFrame(function(){ drawQueued = false; draw(); });
}
function draw(){
  if (!ctx || !W) return;
  PAL = PAL || palette();
  proj.translate([W / 2, H / 2]).scale(Math.min(W, H) / 2 * .94 * ZOOM).rotate(ROT);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.lineJoin = 'round';

  ctx.beginPath(); gpath(SPHERE); ctx.fillStyle = PAL.sea; ctx.fill();
  ctx.beginPath(); gpath(GRAT); ctx.strokeStyle = PAL.grat; ctx.lineWidth = .6; ctx.stroke();
  ctx.beginPath(); gpath(LAND); ctx.fillStyle = PAL.off; ctx.fill();

  ctx.beginPath();
  FEAT.forEach(function(f){ if (!f.fill) gpath(f); });
  ctx.fillStyle = PAL.land; ctx.fill();
  FEAT.forEach(function(f){
    if (!f.fill) return;
    ctx.beginPath(); gpath(f); ctx.fillStyle = f.fill === 'ink' ? PAL.ink : f.fill; ctx.fill();
  });

  ctx.beginPath(); FEAT.forEach(function(f){ gpath(f); }); gpath(LAND);
  ctx.strokeStyle = PAL.line; ctx.lineWidth = .5; ctx.stroke();
  FEAT.forEach(function(f){
    if (!f.now) return;
    ctx.beginPath(); gpath(f); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 1.8; ctx.stroke();
  });
  if (HOVI != null && HOVXY) drawHover();
  ctx.beginPath(); gpath(SPHERE); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 1.2; ctx.stroke();
  placeMarks();
}

/* 이지 모드 — 올라간 나라를 제자리에서 칠하고 테두리를 굵게 해 강조한다.
   크기는 키우지 않는다 — 마우스 자리를 기준으로 키우면 마우스를 따라 모양이 밀려다닌다 */
function drawHover(){
  var f = FEAT[HOVI];
  ctx.save();
  ctx.beginPath(); gpath(f); ctx.globalAlpha = .85; ctx.fillStyle = PAL.accent; ctx.fill();
  ctx.restore();
  ctx.beginPath(); gpath(f); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 1.6; ctx.stroke();
}
/* 화면 한 점 아래의 나라. 경계 상자로 먼저 거르고 d3.geoContains 로 확인한다 */
function featureAt(xy){
  var ll = proj.invert(xy);
  if (!ll || !isFinite(ll[0]) || !facing(ll[0], ll[1])) return null;
  for (var i = 0; i < FEAT.length; i++) {
    var b = BOUNDS[i], w = b[0][0], e = b[1][0];
    if (ll[1] < b[0][1] || ll[1] > b[1][1]) continue;
    if (w <= e ? (ll[0] < w || ll[0] > e) : (ll[0] < w && ll[0] > e)) continue;
    if (d3.geoContains(FEAT[i], ll)) return i;
  }
  return null;
}
function setHov(i, xy){
  if (HOVI === i) return;                       // 같은 나라 안에서 움직이면 다시 그리지 않는다
  HOVI = i; HOVXY = i == null ? null : xy;
  queueDraw();
}

/* 지구 앞면에 있나 — 화면 가운데 점에서 90° 안쪽 */
function facing(lng, lat){ return d3.geoDistance([lng, lat], [-ROT[0], -ROT[1]]) < Math.PI / 2 - .03; }
function flyTo(lng, lat, always){
  if (!always && d3.geoDistance([lng, lat], [-ROT[0], -ROT[1]]) < 55 * Math.PI / 180) return;
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) { ROT = [-lng, -Math.max(-60, Math.min(60, lat)), 0]; queueDraw(); return; }
  var ip = d3.geoInterpolate([-ROT[0], -ROT[1]], [lng, Math.max(-60, Math.min(60, lat))]), t0 = performance.now(), me = {};
  fly = me;
  (function step(t){
    if (fly !== me) return;                               // 손으로 돌리면 멈춘다
    var k = Math.min(1, (t - t0) / 750), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    var c = ip(e); ROT = [-c[0], -c[1], 0]; draw();
    if (k < 1) requestAnimationFrame(step); else fly = null;
  })(t0);
}
function setZoom(z){ ZOOM = Math.max(1, Math.min(ZMAX, z)); $('#mapwrap').classList.toggle('zoomed', ZOOM > 1.05); queueDraw(); }

function buildMap(){
  cv = $('#globe'); ctx = cv.getContext('2d');
  proj = d3.geoOrthographic().precision(.4).clipAngle(90);
  gpath = d3.geoPath(proj, ctx);
  GRAT = d3.geoGraticule10();
  LAND = asFeature(decode(M.land, M.q));
  FEAT = U.map(function(u){ var f = asFeature(decode(u.p, M.q)); f.u = u; return f; });
  BOUNDS = FEAT.map(function(f){ return d3.geoBounds(f); });
  sizeGlobe();
  window.addEventListener('resize', sizeGlobe);
  if (window.ResizeObserver) new ResizeObserver(sizeGlobe).observe(cv);

  var wrap = $('#mapwrap'), tip = $('#tip'), ptr = {}, dragged = false, touch = false, armed = null;   // ptr: 누르고 있는 손가락·마우스
  function local(e){ var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  function show(e){
    if (dragged) { tip.hidden = true; setHov(null); return; }
    var xy = local(e), hit = null, best = 12 * 12;
    if (easyOn()) {
      /* 이지 모드 — 어느 나라든 올리면 커지며 이름이 나온다 */
      var hi = featureAt(xy);
      setHov(hi, xy);
      if (hi == null) { tip.hidden = true; return; }
      var hu = U[hi], hg = guessOf(hu.id);
      tip.innerHTML = esc(hu.name) + '<small>' + esc(hg ? pts(hg.score) + ' · ' + hg.rank + '번째'
        : (touch && armed === hi ? '한 번 더 누르면 부르기' : hu.cap + ' · ' + hu.reg)) + '</small>';
      tip.style.left = xy[0] + 'px'; tip.style.top = xy[1] + 'px';
      tip.hidden = false;
      return;
    }
    setHov(null);
    S.list.forEach(function(g){                            // 작은 나라는 수도 점으로 잡는다
      var u = U[BY[g.id]];
      if (!facing(u.lng, u.lat)) return;
      var p = proj([u.lng, u.lat]), d = (p[0] - xy[0]) * (p[0] - xy[0]) + (p[1] - xy[1]) * (p[1] - xy[1]);
      if (d < best) { best = d; hit = u; }
    });
    if (!hit) {
      var ll = proj.invert(xy);
      if (ll && facing(ll[0], ll[1])) S.list.forEach(function(g){
        var i = BY[g.id]; if (!hit && d3.geoContains(FEAT[i], ll)) hit = U[i];
      });
    }
    if (!hit) { tip.hidden = true; return; }
    var gg = guessOf(hit.id);
    tip.textContent = hit.name + ' · ' + pts(gg.score) + ' · ' + (gg.rank ? gg.rank + '번째' : '정답');
    tip.style.left = xy[0] + 'px'; tip.style.top = xy[1] + 'px';
    tip.hidden = false;
  }
  wrap.addEventListener('pointerdown', function(e){
    if (e.target.closest('.zoom')) return;
    ptr[e.pointerId] = { x:e.clientX, y:e.clientY };
    dragged = false; fly = null; touch = e.pointerType !== 'mouse';
    try { cv.setPointerCapture(e.pointerId); } catch (_) {}
    show(e);
  });
  wrap.addEventListener('pointermove', function(e){
    var p = ptr[e.pointerId];
    if (!p) { show(e); return; }
    var ids = Object.keys(ptr);
    if (ids.length === 1) {
      var dx = e.clientX - p.x, dy = e.clientY - p.y;
      if (!dragged && Math.abs(dx) + Math.abs(dy) < 3) return;
      dragged = true; tip.hidden = true; wrap.classList.add('drag');
      var k = 180 / Math.PI / proj.scale();                // 화면 1px 이 몇 도인지
      ROT = [ROT[0] + dx * k, Math.max(-85, Math.min(85, ROT[1] - dy * k)), 0];
      p.x = e.clientX; p.y = e.clientY;
      queueDraw();
    } else if (ids.length === 2) {
      var a = ptr[ids[0]], b = ptr[ids[1]], d0 = Math.hypot(a.x - b.x, a.y - b.y);
      ptr[e.pointerId] = { x:e.clientX, y:e.clientY };
      a = ptr[ids[0]]; b = ptr[ids[1]];
      var d1 = Math.hypot(a.x - b.x, a.y - b.y);
      if (d0 > 0) setZoom(ZOOM * d1 / d0);
      dragged = true; tip.hidden = true;
    }
  });
  function up(e){ delete ptr[e.pointerId]; if (!Object.keys(ptr).length) { wrap.classList.remove('drag'); setTimeout(function(){ dragged = false; }, 0); } }
  wrap.addEventListener('pointerup', up);
  wrap.addEventListener('pointercancel', up);
  wrap.addEventListener('pointerleave', function(e){ if (!ptr[e.pointerId]) { tip.hidden = true; setHov(null); } });
  cv.addEventListener('click', function(e){
    if (dragged || !easyOn()) return;
    var i = featureAt(local(e));
    if (i == null) return;
    /* 손가락은 처음 누르면 이름만 — 같은 나라를 한 번 더 눌러야 부른다. 돌리려다 잘못 부르는 일이 없게 */
    if (touch && armed !== i) { armed = i; show(e); return; }
    armed = null; tip.hidden = true; setHov(null);
    guess(i);
  });
  wrap.addEventListener('wheel', function(e){ e.preventDefault(); setZoom(ZOOM * Math.pow(1.0018, -e.deltaY)); }, { passive:false });
  $('#zin').onclick = function(){ setZoom(ZOOM * 1.8); };
  $('#zout').onclick = function(){ setZoom(ZOOM / 1.8); };
  $('#zall').onclick = function(){ setZoom(1); };
}

var MARKS = [];   // { lng, lat, html } — html 의 {pos} 자리에 화면 위치가 들어간다
function placeMarks(){
  $('#marks').innerHTML = MARKS.map(function(m){
    if (!facing(m.lng, m.lat)) return '';
    var p = proj([m.lng, m.lat]);
    return m.html.split('{pos}').join('left:' + p[0].toFixed(1) + 'px;top:' + p[1].toFixed(1) + 'px');
  }).join('');
}
function paintMap(){
  if (!M || !FEAT.length) return;
  MARKS = [];
  FEAT.forEach(function(f){ f.fill = null; f.now = false; });
  S.list.forEach(function(g){
    var i = BY[g.id], u = U[i];
    FEAT[i].fill = g.correct ? 'ink' : heat(g.rank);
    FEAT[i].now = g.id === S.lastId && !S.answer;
    /* 작은 나라는 칠해도 안 보이므로 수도에 같은 색 점을 찍는다 */
    MARKS.push({ lng:u.lng, lat:u.lat, html:'<span class="dot" style="{pos};background:' + (g.correct ? 'var(--ink)' : heat(g.rank)) + '"></span>' });
  });
  var target = null;
  if (S.answer) {
    var ai = BY[S.answer.id], a = U[ai];
    FEAT[ai].fill = 'ink';
    MARKS.push({ lng:a.lng, lat:a.lat, html:'<span class="ring" style="{pos}"></span><span class="pin" style="{pos}">📍</span>' +
      '<span class="lab" style="{pos};transform:translate(-50%,-260%)">' + esc(a.name) + '</span>' });
    target = a;
  } else if (S.lastId) {
    var l = U[BY[S.lastId]];
    MARKS.push({ lng:l.lng, lat:l.lat, html:'<span class="ring" style="{pos}"></span><span class="lab" style="{pos}">' + esc(l.name) + '</span>' });
    target = l;
  }
  $('#maphint').hidden = !!S.list.length;
  var key = target ? target.id + (S.answer ? '!' : '') : null;
  if (target && key !== flown) { flown = key; flyTo(target.lng, target.lat, !!S.answer); }
  queueDraw();
}

