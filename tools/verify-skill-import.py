from pathlib import Path
import hashlib
import json
import re
root=Path(__file__).resolve().parent.parent
metadata=json.loads((root/'docs/skills-import.json').read_text(encoding='utf-8'))
managed=[]
def hashes(folder):return {p.relative_to(folder).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in folder.rglob('*') if p.is_file()}
for skill in metadata['skills']:
 folder=root/'.agents/skills'/skill['name']
 text=(folder/'SKILL.md').read_text(encoding='utf-8')
 assert re.search(r'^name: '+re.escape(skill['name'])+r'\s*$',text,re.M)
 actual=hashes(folder)
 if actual!=skill['files']:
  assert skill['name'].startswith('openspec-') and 'generatedBy: "1.14.0"' in text
  assert hashes(root/'docs/skill-source-notices/library-openspec'/skill['name'])==skill['files']
  managed.append({'name':skill['name'],'generator':'OpenSpec 1.14.0','files':actual})
 for variant in skill.get('preservedVariants',[]):
  assert hashes(root/'docs/skill-source-notices/library-duplicates'/skill['name']/Path(variant['source']).parent.name)==variant['files']
assert (root/'.agents/skills/.openspec-target').read_text(encoding='utf-8').strip()=='codex'
(root/'docs/skills-generator-ownership.json').write_text(json.dumps({'sourceRevision':metadata['revision'],'managedOverrides':managed,'autocompleteUI':'Unverified; Codex was not reopened'},indent=2)+'\n',encoding='utf-8')
print(f"Verified {metadata['count']} real imported skills; {len(managed)} explicit compatible-generator overrides")
