import urllib.request
import re

url = 'https://open-api.netlify.com/#operation/updateSite'
print('Fetching', url)
with urllib.request.urlopen(url, timeout=30) as resp:
    txt = resp.read().decode('utf-8', errors='ignore')

for term in ['updateSite', 'getSite', 'build_settings', 'repository', 'repo', 'git']:
    print('===', term)
    for i, line in enumerate(txt.splitlines()):
        if term in line:
            start = max(0, i-3)
            end = min(len(txt.splitlines()), i+4)
            print('\n'.join(txt.splitlines()[start:end]))
            print('---')
            if i > 50:
                break
