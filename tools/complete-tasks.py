"""Mark only evidence-backed task prefixes, verifying CLI locations before/after each edit."""
import argparse,json,subprocess
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('prefixes',nargs='+');a=p.parse_args()
def instructions():
 result=subprocess.run(['cmd','/c','openspec','instructions','apply','--change','add-hidden-board-tetris-duel','--json'],capture_output=True,text=True,encoding='utf-8',check=True)
 return json.loads(result.stdout)
for prefix in a.prefixes:
 before=instructions();task=next(t for t in before['tasks'] if t['description'].startswith(prefix+' '))
 if task['done']:continue
 path=Path(task['sourcePath']);lines=path.read_text(encoding='utf-8').splitlines(True);index=task['line']-1
 assert lines[index].strip()=='- [ ] '+task['description']
 lines[index]=lines[index].replace('- [ ]','- [x]',1);path.write_text(''.join(lines),encoding='utf-8')
 after=instructions();assert next(t for t in after['tasks'] if t['id']==task['id'])['done']
 print(prefix,after['progress'])
