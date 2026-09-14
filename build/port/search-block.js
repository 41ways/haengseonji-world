// ══════════════════════════════ 찾기 (이름·옛 이름·초성)
var CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
function cho(s){
  return Array.from(s).map(function(c){
    var k = c.charCodeAt(0) - 0xAC00;
    return k >= 0 && k < 11172 ? CHO[Math.floor(k / 588)] : c;
  }).join('');
}
function norm(s){ return String(s).replace(/\s+/g, '').toLowerCase(); }
function search(q){
  q = norm(q);
  if (!q) return [];
  var onlyCho = /^[ㄱ-ㅎ]+$/.test(q), out = [];
  U.forEach(function(u, i){
    var best = null;          // 낮을수록 위. 딱 맞으면 -1, 옛 이름은 본이름보다 반 계단 아래
    u.keys.forEach(function(k, j){
      var t = onlyCho ? k.cho : k.s, sc = null;
      if (!onlyCho && t === q) sc = -1;
      else if (t.indexOf(q) === 0) sc = 0;
      else if (t.indexOf(q) > 0) sc = 1;
      if (sc !== null) { sc += j ? .5 : 0; if (best === null || sc < best) best = sc; }
    });
    if (best !== null) out.push([best, u.name.length, i]);
  });
  out.sort(function(a, b){ return a[0] - b[0] || a[1] - b[1] || (U[a[2]].name < U[b[2]].name ? -1 : 1); });
  return out.slice(0, 8).map(function(x){ return x[2]; });
}

