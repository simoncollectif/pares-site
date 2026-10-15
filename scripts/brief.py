"""Beheer van de PARES-backend vanuit de terminal.

Sleutels staan in data-raw/backend.json (niet in git): webUrl en adminToken.

  python3 -I scripts/brief.py stats
  python3 -I scripts/brief.py review
  python3 -I scripts/brief.py hide <reactie-id>
  python3 -I scripts/brief.py test  "Onderwerp" pad/naar/brief.html   # alleen naar Simon
  python3 -I scripts/brief.py send  "Onderwerp" pad/naar/brief.html   # naar alle actieve inschrijvers

Gebruikt curl (de Python-installatie op deze Mac vertrouwt de HTTPS-certificaten niet).
"""
import json, subprocess, sys

cfg = json.load(open('data-raw/backend.json'))


def call(payload):
    payload['token'] = cfg['adminToken']
    res = subprocess.run(['curl', '-sL', '-H', 'Content-Type: text/plain', '--data-binary', '@-', cfg['webUrl']],
                         input=json.dumps(payload), capture_output=True, text=True, check=True)
    return json.loads(res.stdout)


cmd = sys.argv[1] if len(sys.argv) > 1 else 'stats'
if cmd in ('stats', 'review'):
    print(json.dumps(call({'action': cmd}), indent=1, ensure_ascii=False, default=str))
elif cmd == 'hide':
    print(call({'action': 'hide', 'id': sys.argv[2]}))
elif cmd in ('test', 'send'):
    onderwerp, pad = sys.argv[2], sys.argv[3]
    print(call({'action': 'send', 'onderwerp': onderwerp, 'html': open(pad, encoding='utf-8').read(), 'test': cmd == 'test'}))
else:
    print(__doc__)
