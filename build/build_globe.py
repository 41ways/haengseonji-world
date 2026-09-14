# 지구본용 map.json — 투영하지 않은 위경도 그대로. 화면이 d3-geo 정사영으로 돌려 그린다.
#   python3 countries.py → python3 prep_map.py → mapshaper(아래) → python3 build_globe.py
#   mapshaper raw/ne-u-globe.geojson -dissolve u -simplify 20% keep-shapes -o raw/globe.geojson
# 좌표는 0.01° (적도에서 1.1km) 정수로 바꿔 앞 점과의 차이만 적는다
import json
units = json.load(open('raw/countries-ko.json'))
geo = {f['properties']['u']: f['geometry'] for f in json.load(open('raw/globe.geojson'))['features'] if f['geometry']}

def polys(g):
    return g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
def enc(g):
    out = []
    for p in polys(g):
        rings = []
        for r in p:
            flat, px, py = [], 0, 0
            for x, y in r:
                X, Y = round(x * 100), round(y * 100)
                if flat and (X, Y) == (px, py): continue
                flat += [X - px, Y - py]; px, py = X, Y
            if len(flat) >= 8: rings.append(flat)
        if rings: out.append(rings)
    return out

mp = []
for u in units:
    mp.append({'id': u['id'], 'name': u['name'], 'cap': u['cap'], 'al': u['al'], 'reg': u['reg'], 'of': u['of'],
               'lat': u['lat'], 'lng': u['lng'], 'p': enc(geo[u['id']])})
json.dump({'q': 100, 'land': enc(geo['']), 'units': mp}, open('../map.json', 'w'), ensure_ascii=False, separators=(',', ':'))
data = [{k: u[k] for k in ('id', 'name', 'cap', 'reg', 'lat', 'lng')} for u in units]
json.dump(data, open('../data/units.json', 'w'), ensure_ascii=False, indent=1)
print(len(mp), '곳', '빈 곳', [u['name'] for u in mp if not u['p']])
