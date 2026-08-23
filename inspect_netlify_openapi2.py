import json
import urllib.request

url = 'https://open-api.netlify.com/openapi.json'
print('Fetching', url)
with urllib.request.urlopen(url, timeout=30) as resp:
    spec = json.load(resp)

found = []
for path, path_item in spec.get('paths', {}).items():
    if isinstance(path_item, dict):
        for method, op in path_item.items():
            if isinstance(op, dict) and op.get('operationId') == 'updateSite':
                print('FOUND', method, path)
                found.append((path, method, op))
                print(' requestBody keys:', list(op.get('requestBody', {}).keys()))
                for content_type, content in op.get('requestBody', {}).get('content', {}).items():
                    print('  content-type', content_type)
                    print('   schema', content.get('schema'))
                print(' responses keys:', list(op.get('responses', {}).keys()))
                print()

if not found:
    print('No updateSite operationId found')

print('\nSearching component schemas for repo/repository fields...')
for name, schema in spec.get('components', {}).get('schemas', {}).items():
    if not isinstance(schema, dict):
        continue
    props = schema.get('properties', {})
    if not isinstance(props, dict):
        continue
    match = [k for k in props if any(word in k for word in ['repo', 'repository', 'git', 'branch', 'owner', 'provider', 'name', 'url'])]
    if match:
        print('SCHEMA', name, 'matches', match)
        for k in match:
            print(' ', k, json.dumps(props[k], indent=2))
