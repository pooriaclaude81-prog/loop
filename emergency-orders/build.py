#!/usr/bin/env python3
"""Concatenate src/data/*.js into src/template.html -> index.html and validate links."""
import glob, os, re, subprocess, sys, json
here = os.path.dirname(os.path.abspath(__file__))
pre = "const CLUSTERS=[],TOPICS=[],VARIANTS=[];\nconst C=o=>CLUSTERS.push(o);\nconst T=o=>TOPICS.push(o);\nconst V=o=>VARIANTS.push(o);\n"
data = "".join(open(f, encoding="utf-8").read() + "\n" for f in sorted(glob.glob(os.path.join(here, "src/data/*.js"))))
js = pre + data
check = js + r"""
const ids=new Set(),err=[];
const tid=new Set(TOPICS.map(t=>t.id)),cid=new Set(CLUSTERS.map(c=>c.id));
TOPICS.forEach(t=>{if(!cid.has(t.cluster))err.push('topic '+t.id+' bad cluster '+t.cluster)});
VARIANTS.forEach(v=>{if(ids.has(v.id))err.push('dup '+v.id);ids.add(v.id);
  if(!/^[a-z0-9-]+$/.test(v.id))err.push('bad id '+v.id);
  if(!tid.has(v.topic))err.push(v.id+' bad topic '+v.topic);
  if(!['A','B','AB'].includes(v.src))err.push(v.id+' bad src');
  if(!v.n)err.push(v.id+' no name');if(!v.sc)err.push(v.id+' no scenario');});
const refs=s=>{const r=[];String(s).replace(/\[\[([a-z0-9-]+)\|/g,(m,i)=>r.push(i));return r};
VARIANTS.forEach(v=>{
  const strs=[];const walk=x=>{if(typeof x==='string')strs.push(x);else if(Array.isArray(x))x.forEach(walk);else if(x&&typeof x==='object')Object.values(x).forEach(walk)};
  walk(v);strs.forEach(s=>refs(s).forEach(i=>{if(!ids.has(i))err.push(v.id+' -> missing [['+i+']]')}));
  const g=x=>{if(Array.isArray(x))x.forEach(g);else if(x&&typeof x==='object'){if(x.go)x.go.forEach(i=>{if(!ids.has(i))err.push(v.id+' go missing '+i)});Object.values(x).forEach(g)}};g(v.br);
});
TOPICS.forEach(t=>{if(!VARIANTS.some(v=>v.topic===t.id))err.push('topic without variants '+t.id)});
console.log(JSON.stringify({clusters:CLUSTERS.length,topics:TOPICS.length,variants:VARIANTS.length,errors:err}));
"""
import tempfile
tf = tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8"); tf.write(check); tf.close()
r = subprocess.run(["node", tf.name], capture_output=True, text=True)
os.unlink(tf.name)
if r.returncode:
    print(r.stderr); sys.exit(1)
res = json.loads(r.stdout.strip().splitlines()[-1])
print(res)
tpl = open(os.path.join(here, "src/template.html"), encoding="utf-8").read()
out = tpl.replace("/*DATA*/", js.replace("</script", "<\\/script"))
open(os.path.join(here, "index.html"), "w", encoding="utf-8").write(out)
print("index.html bytes:", len(out.encode()))
sys.exit(1 if res["errors"] else 0)
