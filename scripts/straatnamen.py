"""Zoekt per pleintje de dichtstbijzijnde straat via Nominatim (max 1 verzoek per seconde) en bewaart die in een cache."""
import json, os, subprocess, sys, time, urllib.parse

data_path, cache_path = sys.argv[1:3]
data = json.load(open(data_path))
cache = json.load(open(cache_path)) if os.path.exists(cache_path) else {}
for r in data['pleintjes']:
    if r['id'] in cache:
        continue
    q = urllib.parse.urlencode({'format': 'jsonv2', 'lat': r['lat'], 'lon': r['lon'], 'zoom': 17, 'addressdetails': 1})
    url = f'https://nominatim.openstreetmap.org/reverse?{q}'
    try:
        res = subprocess.run(['curl', '-s', '--max-time', '20', '-A', 'paresfootball.com pleintjeskaart', url], capture_output=True, text=True, check=True)
        a = json.loads(res.stdout).get('address', {})
        cache[r['id']] = {'straat': a.get('road') or a.get('pedestrian') or a.get('footway') or '', 'buurt': a.get('neighbourhood') or a.get('suburb') or ''}
    except Exception as ex:
        print('fout', r['id'], ex)
    json.dump(cache, open(cache_path, 'w'), ensure_ascii=False)
    time.sleep(1.1)
for r in data['pleintjes']:
    c = cache.get(r['id'], {})
    r['straat'], r['buurt'] = c.get('straat', ''), c.get('buurt', '')
json.dump(data, open(data_path, 'w'), ensure_ascii=False, indent=1)
print('klaar', sum(1 for r in data['pleintjes'] if r['straat']), 'met straat')
