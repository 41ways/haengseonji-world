# 행선지(wheretogo) index.html → 행선지2: World index.html
#   python3 build/port/port.py ../wheretogo/index.html index.html build/port/globe-block.js build/port/search-block.js build/port/shape-block.js
# 행선지 화면이 바뀌면 이걸 다시 돌린다. 바꿀 문장이 원본에 없으면 assert 로 멈추니, 그 자리를 새 원본에 맞춰 고친다.
import sys
SRC = sys.argv[1]; DST = sys.argv[2]
s = open(SRC, encoding='utf-8').read()
def rep(a, b, count=1):
    global s
    n = s.count(a)
    assert n == count, (n, a[:80])
    s = s.replace(a, b)
def block(start, end, new):
    global s
    i = s.index(start); j = s.index(end, i)
    s = s[:i] + new + s[j:]

# ── 머리
rep('<title>행선지 — 오늘의 시·군 맞히기</title>', '<title>행선지2: World — 오늘의 나라 맞히기</title>')
rep('<meta name="description" content="정답에 가까운 순서로 매긴 점수만 보고 오늘의 시·군을 맞히는 하루 한 문제 게임. 제일 적게 불러 맞힌 사람이 1등.">',
    '<meta name="description" content="정답 수도에 가까운 순서로 매긴 점수만 보고 오늘의 나라를 맞히는 하루 한 문제 게임. 제일 적게 불러 맞힌 사람이 1등.">')
rep('<meta property="og:title" content="행선지 — 오늘의 시·군 맞히기">', '<meta property="og:title" content="행선지2: World — 오늘의 나라 맞히기">')
rep('<meta property="og:description" content="가까운 순서 점수만 보고 전국 165개 시·군 중 오늘의 정답을 찾아라. 제일 적게 불러 맞힌 사람이 1등.">',
    '<meta property="og:description" content="가까운 순서 점수만 보고 세계 199곳 중 오늘의 행선지를 찾아라. 제일 적게 불러 맞힌 사람이 1등.">')
rep("<text y='26' font-size='26'>📍</text>", "<text y='26' font-size='26'>🌏</text>")

# ── 색: 속령·분쟁지 땅
rep('  --land:#e8e7e2; --land-line:#c7c5be; --sea:#f1f0ec;', '  --land:#e8e7e2; --land-off:#dddcd6; --land-line:#c7c5be; --sea:#f1f0ec;')
rep('    --land:#34332f; --land-line:#57554f; --sea:#0d0d0c;', '    --land:#34332f; --land-off:#282825; --land-line:#57554f; --sea:#0d0d0c;')

# ── 타이틀: 표제 옆 WORLD
rep('.bigname{font-family:var(--display);margin:20px 0 0;font-weight:400;',
    '.bigname .two{color:var(--accent)}\n.bigname{font-family:var(--display);margin:20px 0 0;font-weight:400;')
rep('h1 .no{font-family:var(--mono);', 'h1 .w{font-family:var(--mono);font-size:.46em;font-weight:600;color:var(--accent);letter-spacing:.06em}\nh1 .no{font-family:var(--mono);')

# ── 지도: 지구본 (정사각 칸에 캔버스)
rep('''.map{position:relative;background:var(--sea);border:1px solid var(--line)}
.map svg{display:block;width:100%;height:auto}''', '''.map{position:relative;background:var(--panel);border:1px solid var(--line);aspect-ratio:1/1;overflow:hidden;
  touch-action:none;cursor:grab;user-select:none;-webkit-user-select:none}
.map.drag{cursor:grabbing}
.map.easy{cursor:pointer}
.map canvas{display:block;width:100%;height:100%}
.map svg{display:block;width:100%;height:auto}''')
rep('.dot{position:absolute;width:7px;height:7px;margin:-3.5px 0 0 -3.5px;border-radius:50%;background:var(--ink);border:1.5px solid var(--panel);pointer-events:none}',
    '#marks{position:absolute;inset:0;pointer-events:none}\n.dot{position:absolute;width:9px;height:9px;margin:-4.5px 0 0 -4.5px;border-radius:50%;background:var(--ink);border:1.5px solid var(--ink);pointer-events:auto}')
rep('.legend{display:flex;', '''.zoom{position:absolute;right:8px;top:8px;display:flex;flex-direction:column;gap:4px;z-index:4}
.zoom button{width:32px;height:32px;border:1.5px solid var(--ink);background:var(--panel);font-family:var(--mono);font-size:17px;font-weight:600;line-height:1;padding:0}
.zoom button:hover{border-color:var(--accent);color:var(--accent)}
.maphint{position:absolute;left:10px;bottom:8px;font-size:10.5px;color:var(--faint);letter-spacing:.1em;pointer-events:none}
.legend{display:flex;''')

# ── 타이틀 문구
rep('<h1 class="bigname">행선지</h1>', '<h1 class="bigname">행선지<span class="two">2</span></h1>')
rep('<p class="eyebrow">오늘의 시·군 맞히기</p>', '<p class="eyebrow">WORLD · 오늘의 나라 맞히기</p>')
rep('''    <p class="lede">전국 시·군 <b id="tn">165</b>곳 가운데 오늘 한 곳이 정답입니다.<br>
      부른 곳이 정답에서 <b>몇 번째로 가까운지</b>만 알려 줍니다.<br>
      거리는 비밀입니다.</p>''', '''    <p class="lede">세계 <b id="tn">199</b>곳 가운데 오늘 한 나라가 행선지입니다.<br>
      부른 나라의 수도가 정답 수도에서 <b>몇 번째로 가까운지</b>만 알려 줍니다.<br>
      거리는 비밀입니다.</p>''')

# ── 게임 머리·지도·입력
rep('<h1 id="toTitle" title="처음으로"><span class="ttl">행선지</span> <span class="no" id="no"></span></h1>', '<h1 id="toTitle" title="처음으로"><span class="ttl">행선지<span style="color:var(--accent)">2</span></span> <span class="w">WORLD</span> <span class="no" id="no"></span></h1>')
rep('<p class="sub">가까운 순서만 보고 오늘의 시·군을 맞히세요.</p>', '<p class="sub">가까운 순서만 보고 오늘의 나라를 맞히세요.</p>')
rep('''        <svg id="map" role="img" aria-label="전국 시·군 지도"></svg>
        <div id="marks"></div>''', '''        <canvas id="globe" role="img" aria-label="지구본"></canvas>
        <div id="marks"></div>
        <div class="zoom">
          <button id="zin" aria-label="확대">+</button>
          <button id="zout" aria-label="축소">−</button>
          <button id="zall" aria-label="전체 보기" style="font-size:13px">⤢</button>
        </div>
        <div class="maphint" id="maphint">끌어서 돌리기 · 휠 · 두 손가락으로 확대</div>''')
rep('<div class="credit">경계 vuski/admdongkor (2026.7.1 행정동) · 청사 위치 © OpenStreetMap 기여자</div>',
    '<div class="credit">경계·수도 Natural Earth · 나라 목록 mledoze/countries</div>')
rep('placeholder="시·군 이름 (수원, 경기, ㅊㅊ …)"', 'placeholder="나라 이름 (프랑스, 유럽, ㅂㄹㅈ …)"')
rep('<thead><tr><th>#</th><th>시·군</th>', '<thead><tr><th>#</th><th>나라</th>')
rep('<div class="empty" id="empty">아무 데나 하나 불러 보세요.<br>점수를 보고 좁혀 가면 됩니다.</div>',
    '<div class="empty" id="empty">아무 나라나 하나 불러 보세요.<br>점수를 보고 좁혀 가면 됩니다.</div>')

# ── 규칙
block('      <li>매일 자정(한국 시간)에 전국 <b>시·군 165곳</b>', '    </ul>', '''      <li>매일 자정(한국 시간)에 <b>199곳</b> 중 한 나라가 오늘의 행선지가 됩니다.</li>
      <li>한 곳을 부르면 그 나라 수도가 <b>정답 수도에서 몇 번째로 가까운지</b>와, 그 순서로 매긴 <b>100점 만점 점수</b>를 알려 줍니다.</li>
      <li>점수는 정답이 <b>100.00점</b>, 그 밖은 <b>한 계단마다 0.50점</b>씩 낮아집니다 — 2번째로 가까우면 99.00점, 10번째면 95.00점.</li>
      <li>거리(km)는 알려 주지 않습니다. 거리를 알면 원 세 개를 그려 교차점으로 정답을 특정할 수 있어서, <b>순서만</b> 알려 줍니다.</li>
      <li><b>하루 한 판</b>입니다. 맞히거나 포기하면 그날은 끝이고, <b>무한 모드</b>는 언제든 몇 판이든 할 수 있습니다 (순위에 오르지 않습니다).</li>
      <li><b>이지 모드</b>는 오늘 문제와 따로 정답을 뽑아 몇 판이든 합니다. 지구본에 마우스를 올리면 그 나라가 커지며 이름이 보이고, <b>눌러서 바로 부를 수</b> 있습니다 (손가락은 한 번 눌러 이름을 보고, 한 번 더 눌러 부릅니다). 기록은 남지 않습니다.</li>
      <li>시계는 <b>첫 추측부터</b> 정답까지 서버가 잽니다. 순위는 <b>적게 부른 순</b>, 횟수가 같으면 빠른 순입니다. 포기하면 순위에 오르지 않습니다.</li>
      <li>199곳 = 유엔 회원국 193 + 바티칸·팔레스타인·대만·코소보 + <b>홍콩·마카오</b>. 괌·그린란드 같은 속령은 따로 치지 않습니다.</li>
      <li>수도가 여럿이면 공식 수도로 잽니다 — 볼리비아 <b>수크레</b>, 네덜란드 <b>암스테르담</b>, 남아공 <b>프리토리아</b>, 스리랑카 <b>스리자야와르데네푸라코테</b>.</li>
      <li>옛 이름으로도 찾을 수 있습니다 — 터키, 스와질란드, 버마. 초성도 됩니다 — <b>ㅂㄹㅈ</b> → 브라질.</li>
      <li>지도는 휠이나 두 손가락으로 확대하고, 끌어서 옮깁니다.</li>
''')

# ── 스크립트: 주소·저장 키
rep("var API = /^(localhost|127\\.0\\.0\\.1)$/.test(location.hostname) ? 'http://localhost:8832' : 'https://eodigun.41ways.workers.dev';",
    "var API = /^(localhost|127\\.0\\.0\\.1)$/.test(location.hostname) ? 'http://localhost:8834' : 'https://haengseonji-world.41ways.workers.dev';")
rep("var SHARE_URL = 'https://41ways.github.io/wheretogo/';", "var SHARE_URL = 'https://41ways.github.io/wheretogo-world/';")
rep("'eodigun-pid'", "'hsj2-pid'", 2)
rep("'eodigun-name'", "'hsj2-name'", 3)
rep("'eodigun-pw'", "'hsj2-pw'", 2)
rep("'eodigun-tag'", "'hsj2-tag'", 2)
rep("'wheretogo-free'", "'hsj2-free'")
rep("'wheretogo-easy'", "'hsj2-easy'")
rep('  day:null, no:null, n:165, offset:0,', '  day:null, no:null, n:199, offset:0,')
rep("  if (rank <= 70) return '그럭저럭';\n  if (rank <= 120) return '멂';\n  return '아주 멂';",
    "  if (rank <= 80) return '그럭저럭';\n  if (rank <= 140) return '멂';\n  return '지구 반대편';")

# ── 지도 그리기 (확대·이동)
block('// ══════════════════════════════ 지도\n', '// ══════════════════════════════ 찾기 (이름·초성)', open(sys.argv[3], encoding='utf-8').read())
# ── 찾기 (별칭 포함)
block('// ══════════════════════════════ 찾기 (이름·초성)', 'var sugIdx = [], sugSel = 0', open(sys.argv[4], encoding='utf-8').read())
# 옛 이름(불란서)으로 찾아도 목록에는 본이름과 지역만 — 프랑스 · 유럽
rep("msg('\"' + q + '\" — 그런 시·군은 없습니다', true);", "msg('\"' + q + '\" — 그런 나라는 목록에 없습니다', true);")
rep("msg(easy ? easyHint() : '어디든 하나 불러서 시작하세요.');", "msg(easy ? easyHint() : '아무 나라나 불러서 출발하세요.');")
rep("'지도에 마우스를 올려 보고, 눌러서 부르세요. 이름을 적어도 됩니다.'", "'지구본에 마우스를 올려 보고, 눌러서 부르세요. 끌면 돌아갑니다.'")
rep("'지도를 누르면 이름이 보이고, 한 번 더 누르면 부릅니다.'", "'지구본을 누르면 이름이 보이고, 한 번 더 누르면 부릅니다.'")
rep("msg(S.list.length ? '' : '어디든 하나 불러서 시작하세요.');", "msg(S.list.length ? '' : '아무 나라나 불러서 출발하세요.');")

# ── 방금 부른 곳·목록: 보조글은 수도
rep("      '<div class=\"nm\">' + esc(u.name) + '<small>' + esc(u.sub) + '</small></div>' +",
    "      '<div class=\"nm\">' + esc(u.name) + '<small>' + esc(u.cap) + '</small></div>' +")
rep("'</b><span class=\"s\">' + esc(u.sub) + '</span></td>' +", "'</b><span class=\"s\">' + esc(u.cap) + '</span></td>' +")

# ── 정답 모양: 해외 영토를 뺀 틀(sb)로
block('/* 정답 칸의 윤곽', 'function renderDone(){', open(sys.argv[5], encoding='utf-8').read())
rep("    h += '<h2>' + (S.solved ? '📍 ' : '정답은 ') + esc(a.full) + '</h2>';",
    "    h += '<h2>' + (S.solved ? '📍 ' : '정답은 ') + esc(a.name) + '</h2>';")
rep("    h += shapeSvg(a.id) + '<h2>📍 ' + esc(a.full) + '</h2>';", "    h += shapeSvg(a.id) + '<h2>📍 ' + esc(a.name) + '</h2>';")
rep("    h += shapeSvg(a.id) + '<h2>정답은 ' + esc(a.full) + '</h2>';", "    h += shapeSvg(a.id) + '<h2>정답은 ' + esc(a.name) + '</h2>';")
rep("  var t = '행선지 제' + S.no + '호 — '", "  var t = '행선지2: World 제' + S.no + '호 — '")
rep("    var yd = r.yesterday ? '어제 제' + r.yesterday.no + '호 정답 · ' + r.yesterday.full : '오늘이 첫 문제입니다';",
    "    var yd = r.yesterday ? '어제 제' + r.yesterday.no + '호 행선지 · ' + r.yesterday.name + ' (' + r.yesterday.cap + ')' : '오늘이 첫 문제입니다';")
rep('''    u.base = u.name.replace(/(시|군)$/, '');
    u.cho = cho(u.name);
    u.key = (u.sido || '') + u.name;
    u.sub = u.sido || u.full.replace(/ \\(.*\\)$/, '');''', '''    u.sub = u.reg + (u.of ? ' · ' + u.of : '');
    u.keys = [u.name].concat(u.al).map(function(k){ return { s:norm(k), cho:cho(norm(k)) }; });''')
rep('.last .nm small{font-size:13px;font-weight:600;color:var(--faint);margin-left:6px}',
    '.last .nm small{font-family:var(--serif);font-size:13px;font-weight:500;color:var(--faint);margin-left:6px;letter-spacing:0}')
rep('.dot{position:absolute;width:9px;height:9px;margin:-4.5px 0 0 -4.5px;border-radius:50%;background:var(--ink);border:1.5px solid var(--ink);pointer-events:auto}',
    '.dot{position:absolute;width:9px;height:9px;margin:-4.5px 0 0 -4.5px;border-radius:50%;background:var(--ink);border:1.5px solid var(--ink);pointer-events:none}')
rep("<script>\n(function(){", '<script src="https://cdn.jsdelivr.net/npm/d3-array@3.2.4/dist/d3-array.min.js"></script>\n<script src="https://cdn.jsdelivr.net/npm/d3-geo@3.1.1/dist/d3-geo.min.js"></script>\n<script>\n(function(){')
# ── World 만의 색: 행선지의 두 색 체계(먹빛 + 강조 하나)는 그대로, 강조를 붉은색 → 군청으로.
#    오류 글씨(--red)만 붉게 남긴다. 바다에 옅은 푸른 기, 타이틀 막대는 이중 괘선
rep('--accent:#e0301e; --accent-soft:#fae2de;', '--accent:#2447d6; --accent-soft:#e2e7fb;')
rep('--rule:#111111; --stamp:#e0301e;', '--rule:#111111; --stamp:#2447d6;')
rep('--accent:#ff4a38; --accent-soft:#38201c;', '--accent:#6f8dff; --accent-soft:#1b2342;')
rep('--rule:#f2f1ee; --stamp:#ff4a38;', '--rule:#f2f1ee; --stamp:#6f8dff;')
rep('--land:#e8e7e2; --land-off:#dddcd6; --land-line:#c7c5be; --sea:#f1f0ec;', '--land:#e8e7e2; --land-off:#dcdcd8; --land-line:#c5c6c4; --sea:#eaeff5;')
rep('--land:#34332f; --land-off:#282825; --land-line:#57554f; --sea:#0d0d0c;', '--land:#34332f; --land-off:#282825; --land-line:#57554f; --sea:#0c0f16;')
rep('.legend i{flex:1;height:6px;background:linear-gradient(90deg,#e0301e,#e96e5a 28%,#f0b6aa 60%,#b9b7b0)}',
    '.legend i{flex:1;height:6px;background:linear-gradient(90deg,#2447d6,#6280e6 28%,#b2c2f0 60%,#b9b7b0)}')
rep("var STOPS = [[0,[185,183,176]],[.55,[240,182,170]],[.82,[233,110,90]],[1,[224,48,30]]];",
    "var STOPS = [[0,[185,183,176]],[.55,[178,194,240]],[.82,[98,128,230]],[1,[36,71,214]]];")
rep("  return 'rgb(214,47,47)';", "  return 'rgb(36,71,214)';")
rep("g.rank <= 5 ? '🟥' : g.rank <= 25 ? '🟧' : '⬜'", "g.rank <= 5 ? '🟦' : g.rank <= 25 ? '🔷' : '⬜'")
rep("css.getPropertyValue('--accent').trim() || '#e0301e'", "css.getPropertyValue('--accent').trim() || '#2447d6'")
rep('.redbar{width:min(620px,84%);height:8px;background:var(--accent);margin-top:30px}',
    '.redbar{width:min(620px,84%);height:13px;margin-top:30px;background:linear-gradient(var(--accent) 0 8px,transparent 8px 11px,var(--accent) 11px 13px)}')
rep('.shape circle{fill:var(--accent);', '.shape circle{fill:var(--red);')
# ── 지역 이름으로 찾기: Enter 가드·목록 따라가기는 행선지 원본에 있고, regionQuery 는 search-block.js 가 World 용으로 바꿔 끼운다

rep("      <li>옛 이름으로도 찾을 수 있습니다 — 터키, 스와질란드, 버마. 초성도 됩니다 — <b>ㅂㄹㅈ</b> → 브라질.</li>",
    "      <li>옛 이름으로도 찾을 수 있습니다 — 터키, 스와질란드, 버마. 옛 한자 이름도 됩니다 — <b>불란서</b>, <b>화란</b>, <b>이태리</b>, <b>월남</b>. 초성도 됩니다 — <b>ㅂㄹㅈ</b> → 브라질.</li>\n      <li>지역 이름을 치면 그 지역 나라가 모두 나옵니다 — 대륙(<b>유럽</b>, <b>아시아</b> …)과 <b>북미</b>·<b>중미</b>·<b>남미</b>·<b>카리브</b>, <b>동아시아</b>·<b>동남아</b>·<b>중동</b>·<b>중앙아시아</b>, <b>북유럽</b>·<b>서유럽</b>·<b>동유럽</b>·<b>발칸</b>, <b>북아프리카</b>·<b>서아프리카</b> 같은 말.</li>")
# ── map.json 캐시 깨기: 내용 해시를 주소에 붙인다. 새 화면이 캐시에 남은 옛 map.json 을 읽는 일이 없게
import hashlib, os
_mv = hashlib.sha1(open(os.path.join(os.path.dirname(os.path.abspath(DST)), 'map.json'), 'rb').read()).hexdigest()[:10]
rep("fetch('map.json')", "fetch('map.json?v=" + _mv + "')")
open(DST, 'w', encoding='utf-8').write(s)
print('ok', len(s))
