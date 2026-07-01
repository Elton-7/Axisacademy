import json
import urllib.request

url = 'https://open-api.netlify.com/openapi.json'
with urllib.request.urlopen(url, timeout=30) as resp:
    spec = json.load(resp)

for path, path_item in spec.get('paths', {}).items():
    if path == '/sites/{site_id}':
        for method, op in path_item.items():
            if op.get('operationId') == 'updateSite':
                print('METHOD', method)
                rb = op.get('requestBody', {})
                print('requestBody keys:', rb.keys())
                content = rb.get('content', {})
                for ctype, data in content.items():
                    print('ctype', ctype)
                    print('schema', data.get('schema'))
                    schema = data.get('schema', {})
                    if '$ref' in schema:
                        ref = schema['$ref'].split('/')[-1]
                        print('REF', ref)
                        print('SCHEMA PROPS', sorted(spec['components']['schemas'][ref].get('properties', {}).keys()))
                        print('SCHEMA snippet', {k:v for k,v in spec['components']['schemas'][ref].items() if k != 'properties'})
                        print('---')

for name, schema_def in spec.get('components', {}).get('schemas', {}).items():
    if name == 'site' or name == 'repoInfo':
        print('SCHEMA', name)
        print(json.dumps(schema_def, indent=2)[:2000])
