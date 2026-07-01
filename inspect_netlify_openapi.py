import json
import urllib.request

url = 'https://open-api.netlify.com/openapi.json'
print('Fetching', url)
with urllib.request.urlopen(url, timeout=30) as resp:
    spec = json.load(resp)

# search for updateSite operation
for path, path_item in spec.get('paths', {}).items():
    if not isinstance(path_item, dict):
        continue
    for method, op in path_item.items():
        if not isinstance(op, dict):
            continue
        if op.get('operationId') == 'updateSite':
            print('FOUND updateSite', method, path)
            body = op.get('requestBody', {}).get('content', {})
            for ctype, content in body.items():
                print('  content-type', ctype)
                schema = content.get('schema', {})
                print('  schema ref', schema.get('$ref'))
                print('  schema type', schema.get('type'))
                print('  schema keys', sorted(k for k in schema.keys() if k != 'description'))

# Print schema definitions for request body type
refs = set()
for path_item in spec.get('paths', {}).values():
    if not isinstance(path_item, dict):
        continue
    for op in path_item.values():
        if not isinstance(op, dict):
            continue
        if op.get('operationId') == 'updateSite':
            for content in op.get('requestBody', {}).get('content', {}).values():
                schema = content.get('schema', {})
                if isinstance(schema, dict) and '$ref' in schema:
                    refs.add(schema['$ref'].split('/')[-1])

for ref in refs:
    schema_def = spec.get('components', {}).get('schemas', {}).get(ref)
    if schema_def:
        print('\nSCHEMA', ref)
        print('properties:', sorted(schema_def.get('properties', {}).keys()))
        for key in ['repo', 'repository', 'git', 'build_settings', 'buildImage', 'build_image', 'repository_url', 'repo_url', 'provider', 'owner', 'name', 'branch', 'url']:
            if key in schema_def.get('properties', {}):
                print('---', key)
                print(json.dumps(schema_def['properties'][key], indent=2))

# Search for any component schema with repository-related fields
print('\nRepository-related schema matches:')
for name, schema_def in spec.get('components', {}).get('schemas', {}).items():
    if not isinstance(schema_def, dict):
        continue
    props = schema_def.get('properties', {})
    if any(k in props for k in ['repo', 'repository', 'git', 'repo_url', 'repository_url', 'repo_id', 'provider', 'owner', 'branch', 'name']):
        print('SCHEMA MATCH', name)
        for key in ['repo', 'repository', 'git', 'repo_url', 'repository_url', 'repo_id', 'provider', 'owner', 'branch', 'name', 'url']:
            if key in props:
                print('  ', key, json.dumps(props[key], indent=2))
