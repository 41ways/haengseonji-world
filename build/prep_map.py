# Natural Earth 나라 경계에 칸 id(u)를 붙인다. 칸이 아닌 땅(속령·분쟁지·남극)은 u="" 로 남긴다
import json
from countries import NE_ALIAS
ids = {u['id'] for u in json.load(open('raw/countries-ko.json'))}
d = json.load(open('raw/ne_countries.geojson'))
for f in d['features']:
    a = NE_ALIAS.get(f['properties']['ADM0_A3'], f['properties']['ADM0_A3'])
    f['properties'] = {'u': a if a in ids else ''}
json.dump(d, open('raw/ne-u-globe.geojson', 'w'))
print(len(d['features']), 'features,', len({f['properties']['u'] for f in d['features']} - {''}), '곳이 지도에 있음')
