"""Maakt src/data/pleintjes-amsterdam.json uit OpenStreetMap-data (ODbL) en stadsdelen (data.amsterdam.nl).

Gebruik: python3 -I scripts/pleintjes.py data-raw/amsterdam.json data-raw/stadsdelen.geojson src/data/pleintjes-amsterdam.json
"""
import json, math, re, sys

src, sd_path, out = sys.argv[1:4]
els = json.load(open(src))['elements']
stadsdelen = json.load(open(sd_path))['features']

def ring_area_centroid(pts):
    # pts: [(lon, lat)], equirectangular projection to metres around the ring's mean latitude
    lat0 = sum(p[1] for p in pts) / len(pts)
    kx, ky = 111320 * math.cos(math.radians(lat0)), 110540
    xy = [(p[0] * kx, p[1] * ky) for p in pts]
    a = cx = cy = 0.0
    for (x1, y1), (x2, y2) in zip(xy, xy[1:] + xy[:1]):
        c = x1 * y2 - x2 * y1
        a += c; cx += (x1 + x2) * c; cy += (y1 + y2) * c
    a /= 2
    if abs(a) < 1e-9:
        return 0, sum(p[0] for p in pts) / len(pts), lat0
    return abs(a), cx / (6 * a) / kx, cy / (6 * a) / ky

def inside(lon, lat, ring):
    hit = False
    for (x1, y1), (x2, y2) in zip(ring, ring[1:] + ring[:1]):
        if (y1 > lat) != (y2 > lat) and lon < (x2 - x1) * (lat - y1) / (y2 - y1) + x1:
            hit = not hit
    return hit

def stadsdeel(lon, lat):
    for f in stadsdelen:
        g = f['geometry']
        polys = [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']
        for poly in polys:
            if inside(lon, lat, poly[0]) and not any(inside(lon, lat, h) for h in poly[1:]):
                return f['properties']['naam']
    return None

SPECIAAL = re.compile(r'cruyff|krajicek|court|kooi|panna|playground|trapveld', re.I)
rows = []
for e in els:
    t = e.get('tags', {})
    if e['type'] == 'way' and 'geometry' in e:
        pts = [(g['lon'], g['lat']) for g in e['geometry']]
    elif e['type'] == 'relation':
        outer = [m for m in e.get('members', []) if m.get('role') == 'outer' and 'geometry' in m]
        if not outer:
            continue
        pts = [(g['lon'], g['lat']) for g in outer[0]['geometry']]
    else:
        continue
    area, lon, lat = ring_area_centroid(pts)
    naam = t.get('name', '')
    access = t.get('access', '')
    rows.append(dict(id=f"{e['type'][0]}{e['id']}", naam=naam, sport=t.get('sport', ''), surface=t.get('surface', ''),
                     access=access, area=round(area), lat=round(lat, 6), lon=round(lon, 6), speciaal=bool(SPECIAAL.search(naam))))

if '--stats' in sys.argv:
    import collections
    print('totaal', len(rows))
    print('access', collections.Counter(r['access'] for r in rows).most_common())
    print('surface', collections.Counter(r['surface'] for r in rows).most_common(10))
    for lim in (800, 1500, 2500, 4000):
        print('area <', lim, sum(r['area'] < lim for r in rows))
    print('met naam', [r['naam'] for r in rows if r['naam']][:60])
    sys.exit()

# Pleintje = openbaar en klein (geen volwaardig clubveld), of een bekend type court.
PRIVE = {'private', 'no', 'customers', 'members'}
sel = [r for r in rows if r['access'] not in PRIVE and r['area'] >= 80 and (r['area'] < 2500 or r['speciaal'])]
for r in sel:
    r['stadsdeel'] = stadsdeel(r['lon'], r['lat']) or 'Overig'
sel.sort(key=lambda r: (r['stadsdeel'], r['naam'] == '', r['naam']))
json.dump({'bron': 'OpenStreetMap-bijdragers (ODbL), stadsdelen: Gemeente Amsterdam', 'pleintjes': sel},
          open(out, 'w'), ensure_ascii=False, indent=1)
print('geselecteerd', len(sel), 'van', len(rows))
