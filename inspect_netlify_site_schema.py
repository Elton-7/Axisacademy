import json
import urllib.request

url = 'https://open-api.netlify.com/openapi.json'
with urllib.request.urlopen(url, timeout=30) as resp:
    spec = json.load(resp)

site_schema = spec['components']['schemas'].get('site')
print('site properties:', sorted(site_schema.get('properties', {}).keys()))
for key in ['repo', 'repoInfo', 'repository', 'repo_info', 'repo_url', 'repo_path', 'repo_branch', 'git_provider', 'provider', 'allowed_branches', 'public_repo']:
    if key in site_schema.get('properties', {}):
        print('\nPROP', key)
        print(json.dumps(site_schema['properties'][key], indent=2))

repo_schema = spec['components']['schemas'].get('repoInfo')
print('\nrepoInfo properties:', sorted(repo_schema.get('properties', {}).keys()))
print(json.dumps(repo_schema, indent=2))
