/* 정답 나라의 윤곽 — 그 나라 쪽으로 돌린 지구본에서 떼어 크게 그린다. 붉은 점이 수도.
   작고(넓이 15% 미만) 수도에서 먼(2,500km 넘게) 조각 — 프랑스령 기아나, 하와이 — 은 틀에서 뺀다 */
function shapeSvg(id){
  var i = BY[id];
  if (i == null || !FEAT[i]) return '';
  var u = U[i], polys = FEAT[i].geometry.coordinates;
  var area = polys.map(function(p){ return d3.geoArea({ type:'Polygon', coordinates:p }); });
  var tot = area.reduce(function(a, b){ return a + b; }, 0) || 1;
  var keep = polys.filter(function(p, k){
    return area[k] / tot >= .15 || d3.geoDistance(d3.geoCentroid({ type:'Polygon', coordinates:p }), [u.lng, u.lat]) < .4;
  });
  var frame = { type:'MultiPolygon', coordinates:keep.length ? keep : polys };
  var c = d3.geoCentroid(frame);
  var pr = d3.geoOrthographic().rotate([-c[0], -c[1]]).fitExtent([[10, 10], [150, 150]], frame);
  var d = d3.geoPath(pr)(frame), cp = pr([u.lng, u.lat]);
  if (!d) return '';
  return '<svg class="shape" viewBox="0 0 160 160" role="img" aria-label="' + esc(u.name) + ' 모양">' +
    '<path d="' + d + '"/>' + (cp ? '<circle cx="' + cp[0].toFixed(1) + '" cy="' + cp[1].toFixed(1) + '" r="5"/>' : '') + '</svg>' +
    '<p class="shapecap">붉은 점이 수도 ' + esc(u.cap) + ' 자리</p>';
}

