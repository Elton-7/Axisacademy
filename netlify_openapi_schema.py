import json
import urllib.request

url = 'https://open-api.netlify.com'
print('Fetching OpenAPI spec from', url)
with urllib.request.urlopen(url) as resp:
    spec = json.load(resp)

for path, path_item in spec.get('paths', {}).items():
    for method, op in path_item.items():
        if op.get('operationId') in ('updateSite', 'getSite'):
            print('===', op.get('operationId'), method, path)
            print('  requestBody content types:', list(op.get('requestBody', {}).get('content', {}).keys()))
            content = op.get('requestBody', {}).get('content', {})
            for ctype, value in content.items():
                schema = value.get('schema', {})
                print('  schema:', schema)
            print()

# Print updateSite schema properties if referenced
update_site = None
for path_item in spec.get('paths', {}).values():
    for method, op in path_item.items():
        if op.get('operationId') == 'updateSite':
            update_site = op
            break
    if update_site:
        break

if update_site:
    content = update_site.get('requestBody', {}).get('content', {})
    for ctype, value in content.items():
        schema = value.get('schema', {})
        ref = schema.get('$ref')
        if ref and ref.startswith('#/'):
            name = ref.split('/')[-1]
            schema_def = spec['components']['schemas'][name]
            print('Schema name:', name)
            print('Properties:', list(schema_def.get('properties', {}).keys()))
            for key in ['repository', 'repo', 'build_settings', 'git', 'git_provider', 'git_repository', 'branches', 'repo_id']:
                if key in schema_def.get('properties', {}):
                    print('---', key, json.dumps(schema_def['properties'][key], indent=2))
            if 'properties' in schema_def:
                for prop, prop_schema in schema_def['properties'].items():
                    if prop in ('repository', 'repo', 'build_settings', 'github', 'git', 'repository_id'):
                        print(prop, json.dumps(prop_schema, indent=2))
else:
    print('updateSite operation not found')
