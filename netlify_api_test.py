import os
import json
import urllib.request

token = os.environ.get('NETLIFY_AUTH_TOKEN')
if not token:
    raise SystemExit('Missing NETLIFY_AUTH_TOKEN')

url = 'https://api.netlify.com/api/v1/sites/de7a77b6-4fc1-41cb-8d6a-54e0cbd6d29a'
req = urllib.request.Request(url, headers={'Authorization': 'Bearer ' + token})
with urllib.request.urlopen(req) as resp:
    data = json.load(resp)
print(json.dumps(data, indent=2))
