import urllib.request

urls = [
    'https://open-api.netlify.com',
    'https://open-api.netlify.com/openapi.json',
    'https://open-api.netlify.com/openapi.yaml',
    'https://open-api.netlify.com/swagger.json'
]
for url in urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'python-urllib/3'})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
            print('URL:', url)
            print('Status:', resp.status)
            print('CT:', resp.getheader('Content-Type'))
            print('Len:', len(data))
            print('Snippet:', data[:500].decode('utf-8', errors='replace'))
            print('---')
    except Exception as e:
        print('URL:', url, 'ERROR:', repr(e))
