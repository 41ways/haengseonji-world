# 행선지2: World

정답 수도에 가까운 순서로 매긴 점수(100점 만점)만 보고 오늘의 나라를 맞히는 하루 한 문제 게임. 제일 빨리 맞힌 사람이 1등.
[행선지](https://github.com/41ways/wheretogo)(시·군판)의 세계판이다. 화면·서버 틀은 행선지를 그대로 가져왔다.

**하기 → https://41ways.github.io/haengseonji-world/**

- 매일 자정(KST)에 199곳 중 한 나라가 정답 — 유엔 회원국 193 + 바티칸·팔레스타인·대만·코소보 + 홍콩·마카오
- 부른 나라의 **수도**가 정답 수도에서 **몇 번째로 가까운지**와, 그 순서로 매긴 점수를 알려 줌
- 점수는 정답이 100.00점, 그 밖은 한 계단마다 0.50점씩 (`game.js` 의 `STEP`) — 198번째가 1.00점
- 거리는 지구 곡면을 따라 잰 대원거리. **거리(km)는 브라우저에 안 나간다** (행선지와 같은 이유 — 원 세 개로 정답이 특정된다)
- 지도는 **지구본**(d3-geo 정사영). 평면 지도에 펴면 브라질과 서아프리카처럼 가까운 곳이 양 끝으로 갈라져 보여서다. 끌어서 돌리고 휠·두 손가락으로 확대, 부른 나라가 뒤편이면 그쪽으로 돌아간다
- 속령(괌·그린란드·푸에르토리코 …)은 칸이 아니다. 지도에는 색 없는 땅으로만 보인다. 분쟁 지역도 나누지 않는다 — 소말릴란드는 소말리아, 북키프로스는 키프로스로 친다
- 수도가 여럿이면 공식 수도 — 볼리비아 수크레, 네덜란드 암스테르담, 남아공 프리토리아, 스리랑카 스리자야와르데네푸라코테, 코트디부아르 야무수크로, 탄자니아 도도마, 에스와티니 음바바네 (`build/countries.py` 의 `CAP`)
- 하루 한 판 · 무한 연습 · 오늘/플레이어/최고 기록 순위 · 이름#번호 플레이어는 행선지와 같다

## 구조

| 경로 | 하는 일 |
|---|---|
| `index.html`, `map.json` | 게임 화면 (GitHub Pages). `map.json` 은 위경도 0.01° 정수 차분 |
| `data/units.json` | 199곳 이름·수도 좌표 (서버가 씀) |
| `worker/` | 정답·점수·순위 서버 — Cloudflare Worker `haengseonji-world` + D1 `haengseonji-world` |
| `build/` | 나라 목록·수도·경계 데이터를 만드는 스크립트 |

정답은 서버만 안다. 비밀값 `ANSWER_SALT`로 섞은 순서에서 날짜별로 꺼낸다. 행선지와 Worker·D1·비밀값·플레이어 명부는 따로다.

## 서버 고치기

```sh
cd worker
node test-game.js              # 정답 순서·거리·점수·순위 확인
npx wrangler deploy            # 코드 반영 (GitHub 푸시만으로는 안 바뀜)
```

로컬: `.dev.vars`에 `ANSWER_SALT=아무값`, `npx wrangler d1 execute haengseonji-world --local --file schema.sql`, `npx wrangler dev --port 8834`. 화면은 localhost에서 열면 8834를 부른다.

## 데이터 다시 만들기

```sh
cd build
curl -L -o raw/ne_countries.geojson https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson
curl -L -o raw/ne_places.geojson    https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_populated_places_simple.geojson
curl -L -o raw/countries.json       https://raw.githubusercontent.com/mledoze/countries/master/countries.json
python3 countries.py        # 199곳 · 한국어 이름·옛 이름 · 수도 좌표
python3 prep_map.py         # 경계에 칸 id
npx mapshaper raw/ne-u-globe.geojson -dissolve u -simplify 20% keep-shapes -o raw/globe.geojson
python3 build_globe.py      # map.json, data/units.json
```

## 출처

- 경계·수도 좌표: [Natural Earth](https://www.naturalearthdata.com/) (퍼블릭 도메인)
- 나라 목록·지역: [mledoze/countries](https://github.com/mledoze/countries) (ODbL)
- 지구본: [d3-geo](https://github.com/d3/d3-geo)
