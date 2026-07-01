import json
import urllib.request

url = 'https://open-api.netlify.com'
print('Fetching', url)
with urllib.request.urlopen(url) as resp:
    spec = json.load(resp)

# Print operationId keys related to updateSite and getSite
print('Paths with updateSite / getSite:')
for path, path_item in spec.get('paths', {}).items():
    for method, op in path_item.items():
        if op.get('operationId') in ('updateSite', 'getSite'):
            print(path, method, op.get('operationId'))
            print(json.dumps(op, indent=2)[:2000])
            print('---')

# Print schema for updateSite request body if present
update_site = None
for path_item in spec.get('paths', {}).values():
    update = path_item.get('patch') or path_item.get('put')
    if update and update.get('operationId') == 'updateSite':
        update_site = update
        break
if update_site:
    req_body = update_site.get('requestBody', {})
    print('Request body content types:', list(req_body.get('content', {}).keys()))
    for ctype, content in req_body.get('content', {}).items():
        schema_ref = content.get('schema', {}).get('$ref')
        print('Schema ref:', schema_ref)
        if schema_ref:
            ref = schema_ref.split('/')[-1]
            schema = spec['components']['schemas'][ref]
            print('Schema properties:', list(schema.get('properties', {}).keys()))
            print(json.dumps({k:v for k,v in schema.items() if k!='properties'}, indent=2))
            if 'properties' in schema:
                for prop, prop_schema in schema['properties'].items():
                    if prop in ('repository', 'repo', 'build_settings', 'github'):
                        print(prop, json.dumps(prop_schema, indent=2))
    
else:
    print('updateSite operation not found')
