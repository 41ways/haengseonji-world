// ══════════════════════════════ 찾기 (이름·옛 이름·초성)
var CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
function cho(s){
  return Array.from(s).map(function(c){
    var k = c.charCodeAt(0) - 0xAC00;
    return k >= 0 && k < 11172 ? CHO[Math.floor(k / 588)] : c;
  }).join('');
}
function norm(s){ return String(s).replace(/\s+/g, '').toLowerCase(); }
/* 지역 이름을 끝까지 치면 그 지역 나라를 전부 가나다순으로 보여 준다 — 유럽 → 46곳, 동남아 → 11곳.
   대륙(reg)과 mledoze 소지역(sr)으로 묶되, 한국에서 흔히 쓰는 뜻에 맞춰 더하고 뺐다.
   중간까지만 친 "아프" 나, 나라 이름과 똑같은 말(미크로네시아, 중앙아프리카)은 나라로 찾는다 */
var GROUPS = (function(){
  var g = {
    '아시아':{ reg:['아시아'] }, '유럽':{ reg:['유럽'] }, '아프리카':{ reg:['아프리카'] },
    '북아메리카':{ reg:['북아메리카'] }, '남아메리카':{ reg:['남아메리카'] }, '오세아니아':{ reg:['오세아니아'] },
    '아메리카':{ reg:['북아메리카', '남아메리카'] },
    '북미':{ sr:['North America'] },                                   // 미국·캐나다·멕시코
    '중미':{ sr:['Central America'] }, '카리브':{ sr:['Caribbean'] },
    '남미':{ reg:['남아메리카'] },
    '중남미':{ sr:['Central America', 'Caribbean', 'South America'] },
    '동아시아':{ sr:['Eastern Asia'] }, '동남아시아':{ sr:['South-Eastern Asia'] }, '남아시아':{ sr:['Southern Asia'] },
    '중앙아시아':{ sr:['Central Asia'] }, '서아시아':{ sr:['Western Asia'] },
    '중동':{ sr:['Western Asia'], add:['EGY', 'IRN'], drop:['GEO', 'ARM', 'AZE'] },   // 코카서스는 빼고 이집트·이란은 넣는다
    '북유럽':{ ids:['DNK', 'NOR', 'SWE', 'FIN', 'ISL', 'EST', 'LVA', 'LTU'] },       // 북유럽 5국 + 발트 3국
    '서유럽':{ sr:['Western Europe'], add:['GBR', 'IRL'] },
    '남유럽':{ sr:['Southern Europe'] },
    '동유럽':{ sr:['Eastern Europe', 'Central Europe', 'Southeast Europe'] },       // 폴란드·체코·발칸까지
    '중부유럽':{ sr:['Central Europe'] }, '발칸':{ sr:['Southeast Europe'] },
    '북아프리카':{ sr:['Northern Africa'] }, '서아프리카':{ sr:['Western Africa'] }, '동아프리카':{ sr:['Eastern Africa'] },
    '중부아프리카':{ sr:['Middle Africa'] }, '남부아프리카':{ sr:['Southern Africa'] },
    '멜라네시아':{ sr:['Melanesia'] }, '폴리네시아':{ sr:['Polynesia'] }
  };
  g['미주'] = g['아메리카']; g['카리브해'] = g['카리브']; g['중앙아메리카'] = g['중미'];
  g['라틴아메리카'] = g['중남미']; g['동남아'] = g['동남아시아']; g['중유럽'] = g['중부유럽']; g['발칸반도'] = g['발칸'];
  return g;
})();
function regionQuery(q){
  q = norm(q);
  var grp = GROUPS[q];
  if (!grp) return null;
  /* 나라 이름·옛 이름과 똑같으면 나라가 먼저다 */
  if (U.some(function(u){ return u.keys.some(function(k){ return k.s === q; }); })) return null;
  return U.map(function(u, i){ return i; }).filter(function(i){
    var u = U[i];
    if (grp.drop && grp.drop.indexOf(u.id) >= 0) return false;
    if (grp.add && grp.add.indexOf(u.id) >= 0) return true;
    if (grp.ids) return grp.ids.indexOf(u.id) >= 0;
    return (grp.reg && grp.reg.indexOf(u.reg) >= 0) || (grp.sr && grp.sr.indexOf(u.sr) >= 0);
  }).sort(function(a, b){ return U[a].name < U[b].name ? -1 : 1; });
}
function search(q){
  var rg = regionQuery(q);
  if (rg) return rg;
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

