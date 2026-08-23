import json
import urllib.request

url = 'https://open-api.netlify.com/openapi.json'
with urllib.request.urlopen(url, timeout=30) as resp:
    spec = json.load(resp)

# print path item types around /sites/{site_id}
for path in ['/sites/{site_id}', '/sites/{site_id}/repos', '/sites/{site_id}/repo', '/repos', '/sites']:
    if path in spec.get('paths', {}):
        print(f'PATH {path}')
        print(spec['paths'][path])
        print('---')

# search for repo or git in paths
for path, path_item in spec.get('paths', {}).items():
    if 'repo' in path or 'git' in path:
        print('PATH', path)
        if isinstance(path_item, dict):
            print('  methods', list(path_item.keys()))
        else:
            print('  type', type(path_item))
        print('---')

# print updateSite request schema keys if available
site_path = spec.get('paths', {}).get('/sites/{site_id}')
print('site_path type', type(site_path))
if isinstance(site_path, dict):
    for method, op in site_path.items():
        if isinstance(op, dict) and op.get('operationId') == 'updateSite':
            print('updateSite method', method)
            print('body', op.get('requestBody'))
            if op.get('requestBody'):
                for ctype, content in op['requestBody'].get('content', {}).items():
                    print(' content-type', ctype)
                    schema = content.get('schema')
                    print('  schema type', type(schema).__name__)
                    print('  schema', schema)

# search for repoInfo references in all schemas
for name, schema in spec.get('components', {}).get('schemas', {}).items():
    if isinstance(schema, dict):
        if 'repoInfo' in json.dumps(schema):
            print('SCHEMA_REFERENCE', name)
