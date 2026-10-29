const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders },
  });
}

function makeId() {
  return `T${Date.now().toString(36).toUpperCase()}`;
}

async function handleApi(request, env, url) {
  if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const parts = url.pathname.split("/").filter(Boolean);
  const id = parts.length > 2 ? decodeURIComponent(parts[2]) : null;

  if (request.method === "GET" && !id) {
    const listed = await env.TASKS_KV.list({ prefix: "task:" });
    const tasks = await Promise.all(listed.keys.map(async (key) => JSON.parse(await env.TASKS_KV.get(key.name))));
    tasks.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return json(tasks);
  }

  if (request.method === "POST" && !id) {
    let body;
    try { body = await request.json(); } catch { return json({ error: "Request body must be valid JSON" }, 400); }
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) return json({ error: "Task title is required" }, 400);
    const task = {
      id: makeId(), title,
      priority: ["Low", "Medium", "High"].includes(body.priority) ? body.priority : "Medium",
      status: ["Pending", "In Progress", "Completed"].includes(body.status) ? body.status : "Pending",
      createdAt: new Date().toISOString(),
    };
    await env.TASKS_KV.put(`task:${task.id}`, JSON.stringify(task));
    return json(task, 201);
  }

  if (id && request.method === "GET") {
    const value = await env.TASKS_KV.get(`task:${id}`);
    return value ? json(JSON.parse(value)) : json({ error: "Task not found" }, 404);
  }

  if (id && request.method === "PUT") {
    const value = await env.TASKS_KV.get(`task:${id}`);
    if (!value) return json({ error: "Task not found" }, 404);
    let body;
    try { body = await request.json(); } catch { return json({ error: "Request body must be valid JSON" }, 400); }
    const old = JSON.parse(value);
    const task = {
      ...old,
      title: typeof body.title === "string" && body.title.trim() ? body.title.trim() : old.title,
      priority: ["Low", "Medium", "High"].includes(body.priority) ? body.priority : old.priority,
      status: ["Pending", "In Progress", "Completed"].includes(body.status) ? body.status : old.status,
    };
    await env.TASKS_KV.put(`task:${id}`, JSON.stringify(task));
    return json(task);
  }

  if (id && request.method === "DELETE") {
    const value = await env.TASKS_KV.get(`task:${id}`);
    if (!value) return json({ error: "Task not found" }, 404);
    await env.TASKS_KV.delete(`task:${id}`);
    return json({ message: "Task deleted", id });
  }
  return json({ error: "Route not found" }, 404);
}

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Student Task Manager</title>
<style>
:root{font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;color:#172033;background:#f4f7fb}*{box-sizing:border-box}body{margin:0}.hero{background:linear-gradient(125deg,#173a70,#3766ba);color:white;padding:38px 20px}.wrap{max-width:1000px;margin:auto}.hero h1{margin:0 0 8px;font-size:clamp(26px,4vw,38px)}.hero p{margin:0;color:#dce7ff}.main{max-width:1000px;margin:24px auto;padding:0 18px}.panel{background:white;border:1px solid #e2e8f0;border-radius:16px;padding:22px;box-shadow:0 8px 25px #1b37650c;margin-bottom:20px}.panel h2{font-size:19px;margin:0 0 16px}.formgrid{display:grid;grid-template-columns:2fr 1fr 1fr auto;gap:12px;align-items:end}label{display:block;font-size:13px;font-weight:650;margin-bottom:7px;color:#526078}input,select{width:100%;padding:12px;border:1px solid #ccd5e3;border-radius:9px;background:white;font:inherit;color:#172033}button{border:0;border-radius:9px;padding:12px 15px;font:inherit;font-weight:650;cursor:pointer}.primary{background:#2456a6;color:white}.secondary{background:#eaf0fb;color:#234d8d}.danger{background:#fff0f0;color:#b42318}.task{display:grid;grid-template-columns:1fr auto;gap:14px;padding:16px 0;border-bottom:1px solid #edf0f5}.task:last-child{border-bottom:0}.task h3{margin:0 0 8px;font-size:16px;overflow-wrap:anywhere}.meta{display:flex;flex-wrap:wrap;gap:8px;font-size:12px;color:#657188}.pill{border-radius:20px;padding:4px 9px;background:#edf2fa}.pill.done{background:#e3f7ec;color:#177245}.actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.actions select{min-width:125px;padding:8px;font-size:13px}.actions button{padding:9px 11px;font-size:13px}.empty{text-align:center;color:#7a879a;padding:28px 10px}.toolbar{display:flex;justify-content:space-between;gap:12px;align-items:center}.count{color:#657188;font-size:13px}.notice{margin:0 0 14px;padding:11px 13px;border-radius:9px;display:none}.notice.error{display:block;background:#fff0f0;color:#a61b1b}.notice.ok{display:block;background:#e8f8ee;color:#166534}.foot{text-align:center;color:#8390a3;font-size:12px;padding:10px 0 30px}@media(max-width:720px){.formgrid{grid-template-columns:1fr 1fr}.formgrid .wide{grid-column:1/-1}.task{grid-template-columns:1fr}.actions{justify-content:flex-start}.toolbar{align-items:flex-start;flex-direction:column}}@media(max-width:420px){.formgrid{grid-template-columns:1fr}.formgrid .wide{grid-column:auto}}
</style></head><body><header class="hero"><div class="wrap"><h1>Student Task Manager</h1><p>Organize academic work with a simple cloud-powered task board.</p></div></header><main class="main"><section class="panel"><h2>Add a new task</h2><div id="notice" class="notice"></div><form id="taskForm"><div class="formgrid"><div class="wide"><label for="title">Task title</label><input id="title" required maxlength="180" placeholder="e.g. Complete Cloud Computing Assignment"></div><div><label for="priority">Priority</label><select id="priority"><option>Medium</option><option>High</option><option>Low</option></select></div><div><label for="status">Status</label><select id="status"><option>Pending</option><option>In Progress</option><option>Completed</option></select></div><div><button class="primary" type="submit">+ Add task</button></div></div></form></section><section class="panel"><div class="toolbar"><h2>My tasks</h2><span id="count" class="count">Loading tasks…</span></div><div id="tasks"><div class="empty">Loading your tasks…</div></div></section><div class="foot">Infrastructure as Code mini project · Terraform + Cloudflare Workers + Workers KV</div></main>
<script>
const $=s=>document.querySelector(s);const notice=$('#notice');const tasksEl=$('#tasks');let tasks=[];
function message(text,type='ok'){notice.textContent=text;notice.className='notice '+type;setTimeout(()=>{notice.className='notice';},3500)}
async function api(path='',options={}){const r=await fetch('/api/tasks'+path,{...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});const data=await r.json().catch(()=>({error:'Unexpected server response'}));if(!r.ok)throw new Error(data.error||'Request failed');return data}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function render(){ $('#count').textContent=tasks.length+' task'+(tasks.length===1?'':'s');if(!tasks.length){tasksEl.innerHTML='<div class="empty">No tasks yet. Add your first task above.</div>';return;}tasksEl.innerHTML=tasks.map(t=>\`<article class="task"><div><h3>\${esc(t.title)}</h3><div class="meta"><span>ID: \${esc(t.id)}</span><span class="pill">\${esc(t.priority)} priority</span><span class="pill \${t.status==='Completed'?'done':''}">\${esc(t.status)}</span><span>Created \${new Date(t.createdAt).toLocaleDateString()}</span></div></div><div class="actions"><select aria-label="Update status" data-status="\${esc(t.id)}"><option \${t.status==='Pending'?'selected':''}>Pending</option><option \${t.status==='In Progress'?'selected':''}>In Progress</option><option \{t.status==='Completed'?'selected':''}>Completed</option></select><button class="secondary" data-edit="\${esc(t.id)}">Edit</button><button class="danger" data-delete="\${esc(t.id)}">Delete</button></div></article>\`).join('')}
async function load(){try{tasks=await api();render()}catch(e){tasksEl.innerHTML='<div class="empty">Could not load tasks. '+esc(e.message)+'</div>';message(e.message,'error')}}
$('#taskForm').addEventListener('submit',async e=>{e.preventDefault();try{await api('',{method:'POST',body:JSON.stringify({title:$('#title').value,priority:$('#priority').value,status:$('#status').value})});$('#title').value='';$('#priority').value='Medium';$('#status').value='Pending';message('Task created successfully');await load()}catch(err){message(err.message,'error')}});
tasksEl.addEventListener('change',async e=>{const id=e.target.dataset.status;if(!id)return;try{await api('/'+encodeURIComponent(id),{method:'PUT',body:JSON.stringify({status:e.target.value})});message('Task status updated');await load()}catch(err){message(err.message,'error')}});
tasksEl.addEventListener('click',async e=>{const del=e.target.dataset.delete;const edit=e.target.dataset.edit;if(del){if(!confirm('Delete this task?'))return;try{await api('/'+encodeURIComponent(del),{method:'DELETE'});message('Task deleted');await load()}catch(err){message(err.message,'error')}}if(edit){const t=tasks.find(x=>x.id===edit);if(!t)return;const title=prompt('Edit task title:',t.title);if(title===null)return;if(!title.trim()){message('Title cannot be empty','error');return}const priority=prompt('Priority: Low, Medium, or High',t.priority);if(priority===null)return;const p=['Low','Medium','High'].find(x=>x.toLowerCase()===priority.trim().toLowerCase());if(!p){message('Priority must be Low, Medium, or High','error');return}try{await api('/'+encodeURIComponent(edit),{method:'PUT',body:JSON.stringify({title:title.trim(),priority:p})});message('Task updated');await load()}catch(err){message(err.message,'error')}}});load();
</script></body></html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/tasks" || url.pathname.startsWith("/api/tasks/")) {
      return handleApi(request, env, url);
    }
    if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method Not Allowed", { status: 405 });
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "X-Content-Type-Options": "nosniff" } });
  },
};