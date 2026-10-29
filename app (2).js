window.__main=1;
const URL_='https://esjvprhomofdahmpdizl.supabase.co',KEY='sb_publishable_DP2OWoX5FS4W0PGvmMBgIA_LdVoow7e';
const ST={s:null};
try{ST.s=JSON.parse(localStorage.getItem('bic.s')||'null')}catch(e){}
function save(s){ST.s=s;try{s?localStorage.setItem('bic.s',JSON.stringify(s)):localStorage.removeItem('bic.s')}catch(e){}}
function mkSession(j){return {access_token:j.access_token,refresh_token:j.refresh_token,expires_at:j.expires_at||Math.floor(Date.now()/1000)+(j.expires_in||3600),user:j.user}}
async function tok(){const s=ST.s;if(!s)return null;
if(s.expires_at-Date.now()/1000<60){try{const r=await fetch(URL_+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:s.refresh_token})});const j=await r.json();if(!r.ok){save(null);return null}save(mkSession(j))}catch(e){return s.access_token}}
return ST.s.access_token}
async function api(path,o){o=o||{};const t=await tok();const h=Object.assign({apikey:KEY,Authorization:'Bearer '+(t||KEY)},o.headers||{});let body=o.body;
if(o.json!==undefined){h['Content-Type']='application/json';body=JSON.stringify(o.json)}
try{const r=await fetch(URL_+path,{method:o.method||'GET',headers:h,body:body});const tx=await r.text();let d=null;try{d=tx?JSON.parse(tx):null}catch(e){d=tx}
if(!r.ok)return {data:null,error:{message:(d&&(d.message||d.msg||d.error_description||d.error))||('Request failed ('+r.status+')')}};
return {data:d,error:null}}catch(e){return {data:null,error:{message:'Network error. Please check your connection.'}}}}
function from(t){const b={m:'GET',f:[],sel:'*',ord:[],body:null,single:false,maybe:false,ret:false,lim:0,up:false};
const o={select(c){b.sel=c||'*';if(b.m!=='GET')b.ret=true;return o},
eq(c,v){b.f.push(c+'=eq.'+encodeURIComponent(v));return o},
order(c,op){b.ord.push(c+'.'+((op&&op.ascending===false)?'desc':'asc'));return o},
insert(d){b.m='POST';b.body=d;return o},update(d){b.m='PATCH';b.body=d;return o},delete(){b.m='DELETE';return o},
limit(n){b.lim=n;return o},upsert(d){b.m='POST';b.body=d;b.up=true;return o},
maybeSingle(){b.maybe=true;return o},single(){b.single=true;return o},
then(res,rej){return exec().then(res,rej)}};
async function exec(){const p=[];if(b.m==='GET'||b.ret)p.push('select='+encodeURIComponent(b.sel));b.f.forEach(x=>p.push(x));if(b.ord.length)p.push('order='+b.ord.join(','));if(b.maybe)p.push('limit=1');if(b.lim)p.push('limit='+b.lim);if(b.up)p.push('on_conflict=key');
const h={};if(b.ret)h.Prefer='return=representation';if(b.up)h.Prefer='resolution=merge-duplicates';if(b.single)h.Accept='application/vnd.pgrst.object+json';
const r=await api('/rest/v1/'+t+(p.length?'?'+p.join('&'):''),{method:b.m,headers:h,json:b.body===null?undefined:b.body});
if(!r.error&&b.maybe&&Array.isArray(r.data))r.data=r.data[0]||null;return r}
return o}
const SB={
from,
rpc(fn,args){return {then(res,rej){return api('/rest/v1/rpc/'+fn,{method:'POST',json:args||{}}).then(res,rej)}}},
auth:{
async signUp(a){const r=await api('/auth/v1/signup?redirect_to='+encodeURIComponent(a.options.emailRedirectTo),{method:'POST',json:{email:a.email,password:a.password,data:a.options.data}});
if(r.error)return {data:{user:null},error:r.error};return {data:{user:r.data&&(r.data.user||r.data)},error:null}},
async signInWithPassword(a){const r=await api('/auth/v1/token?grant_type=password',{method:'POST',json:{email:a.email,password:a.password}});
if(r.error)return {error:r.error};save(mkSession(r.data));return {error:null}},
async signOut(){if(ST.s)await api('/auth/v1/logout',{method:'POST'});save(null);return {error:null}},
async getSession(){await tok();return {data:{session:ST.s}}},
async resetPasswordForEmail(e,o){return api('/auth/v1/recover?redirect_to='+encodeURIComponent(o.redirectTo),{method:'POST',json:{email:e}}).then(r=>({error:r.error}))},
async updateUser(a){return api('/auth/v1/user',{method:'PUT',json:a}).then(r=>({error:r.error}))}},
storage:{from(bk){return {
upload(path,file,o){return api('/storage/v1/object/'+bk+'/'+path,{method:'POST',body:file,headers:{'Content-Type':(o&&o.contentType)||file.type,'cache-control':'max-age=3600'}})},
remove(paths){return api('/storage/v1/object/'+bk,{method:'DELETE',json:{prefixes:paths}})},
async createSignedUrl(path,sec){const r=await api('/storage/v1/object/sign/'+bk+'/'+path,{method:'POST',json:{expiresIn:sec}});
if(r.error)return {data:null,error:r.error};return {data:{signedUrl:URL_+'/storage/v1'+r.data.signedURL},error:null}},
getPublicUrl(path){return {data:{publicUrl:URL_+'/storage/v1/object/public/'+bk+'/'+path}}}}}},
functions:{invoke(name,o){return api('/functions/v1/'+name,{method:'POST',json:o&&o.body})}}
};
async function handleHash(){const h=location.hash;
if(/error_description=/.test(h)){const p=new URLSearchParams(h.slice(1));history.replaceState(null,'',location.pathname);alert((p.get('error_description')||'Link error').replace(/\+/g,' '));return}
if(!/access_token=/.test(h))return;
const p=new URLSearchParams(h.slice(1)),at=p.get('access_token'),type=p.get('type');
let u=null;try{const r=await fetch(URL_+'/auth/v1/user',{headers:{apikey:KEY,Authorization:'Bearer '+at}});if(r.ok)u=await r.json()}catch(e){}
save({access_token:at,refresh_token:p.get('refresh_token'),expires_at:Math.floor(Date.now()/1000)+(parseInt(p.get('expires_in'))||3600),user:u});
history.replaceState(null,'',location.pathname);location.hash=type==='recovery'?'#reset':'#home'}

const BASE=location.origin+location.pathname;
const $=s=>document.querySelector(s);
const esc=t=>String(t==null?'':t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ini=n=>(n||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
const av=(n,u)=>u?`<img class="av" src="${esc(u)}" alt="${esc(n)}">`:`<div class="av">${ini(n)}</div>`;
const S={sess:null,prof:null,rows:[],cfg:{}};
const approved=()=>S.prof&&(S.prof.status==='approved'||S.prof.is_admin);
const isAdmin=()=>S.prof&&S.prof.is_admin;
async function q(p){const {data,error}=await p;if(error){console.error(error);return null}return data}
async function run(p){const {error}=await p;if(error){alert(error.message);return false}return true}
function msg(id,t,bad){const e=$('#'+id);if(!e)return;e.hidden=false;e.className='msg'+(bad?' err':'');e.textContent=t}
async function loadProf(){S.prof=null;if(S.sess){S.prof=await q(SB.from('profiles').select('*').eq('id',S.sess.user.id).maybeSingle())}}
function pw(id,l){return `<label>${l}</label><input id="${id}" type="password" autocomplete="off"><label class="chk"><input type="checkbox" onchange="$('#${id}').type=this.checked?'text':'password'"> Show password</label><br>`}
function gate(t){return `<h1>${t}</h1><div class="note">${S.sess?'Your account is awaiting administrator approval. You will see this page once you are approved.':'Please <a href="#login">log in</a> or <a href="#register">register</a> to see this page.'}</div>`}
function menuItems(){const o=[['home','Home'],['executives','Executives'],['staff','Staff'],['alumni','Alumni'],['students','Students'],['announcements','Announcements'],['community','Community']];
if(S.sess){o.push(['profile','My profile'],['logout','Log out'])}else{o.push(['login','Log in'],['register','Register'])}
o.push(['privacy','Privacy'],['guidelines','Guidelines'],['contact','Contact'],['admin','Admin login']);return o}
function brand(){const c=S.cfg||{},im=(u,a)=>u?'<img class="lg" src="'+esc(u)+'" alt="'+a+'">':'';
const l=im(c.logo_ibbul,'IBBUL')+im(c.logo_nabs,'NABS IBBUL Chapter');
$('#brand').innerHTML=(l||'<span class="mark">B</span>')+'<span>BIDA IBBUL CONNECT</span>';$('#flogos').innerHTML=l}
function nav(){const h=(location.hash||'#home').slice(1);
$('#nav').innerHTML=(S.prof&&S.prof.full_name?'<div class="hi">Hi, '+esc(S.prof.full_name.split(' ')[0])+'</div>':'')+menuItems().map(x=>x[0]==='logout'?'<a href="#" onclick="logout();return false">'+x[1]+'</a>':'<a href="#'+x[0]+'" class="'+(h==x[0]?'on':'')+'">'+x[1]+'</a>').join('');brand()}
function toggleMenu(){const d=$('#drawer');d.hidden=!d.hidden;document.body.style.overflow=d.hidden?'':'hidden'}
function closeMenu(){const d=$('#drawer');if(d)d.hidden=true;if(document.body)document.body.style.overflow=''}
async function loadCfg(){const r=await q(SB.from('site_settings').select('*'))||[];S.cfg={};r.forEach(x=>{S.cfg[x.key]=x.value});brand()}
async function logout(){await SB.auth.signOut();S.sess=null;S.prof=null;location.hash='#home';draw()}
async function login(admin){const e=$('#e').value.trim(),p=$('#p').value;if(!e||!p)return msg('lm','Enter your email and password.',1);
const {error}=await SB.auth.signInWithPassword({email:e,password:p});if(error)return msg('lm',error.message,1);
const {data}=await SB.auth.getSession();S.sess=data.session;await loadProf();
if(admin&&!isAdmin()){await SB.auth.signOut();S.sess=null;S.prof=null;draw();return alert('This account is not an administrator.')}
location.hash=admin?'#admin':'#home';draw()}
function prev(i){const f=i.files[0],b=$('#rfp');b.textContent='';if(!f)return;if(f.type.startsWith('image/')){const m=document.createElement('img');m.src=URL.createObjectURL(f);m.alt='Preview';m.style.cssText='max-width:140px;border-radius:12px;display:block;margin-bottom:6px';b.appendChild(m)}b.appendChild(document.createTextNode(f.name))}
async function register(){
const n=$('#rn').value.trim(),e=$('#re').value.trim(),p=$('#rp').value,ind=$('#ri').value.trim(),f=$('#rf').files[0];
if(!n||!e||!ind)return msg('rm','Please fill in your name, email and indigene.',1);
const role=$('#rt').value,dep=$('#rd').value.trim(),yr=$('#ry').value.trim(),lv=$('#rl').value.trim();
if(!dep)return msg('rm','Please choose or enter your department.',1);
if(role==='alumni'&&!/^(19|20)\d{2}$/.test(yr))return msg('rm','Please enter your year of graduation, for example 2022.',1);
if(p.length<8)return msg('rm','Password must be at least 8 characters.',1);
if(!f||f.size>5242880||!/^(image\/(jpeg|png|webp)|application\/pdf)$/.test(f.type))return msg('rm','Upload a JPG, PNG, WebP or PDF under 5 MB.',1);
$('#rb').disabled=true;msg('rm','Creating your account…');
const ext=(f.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'');
const path=crypto.randomUUID()+'/indigene.'+ext;
const up=await SB.storage.from('indigene-docs').upload(path,f,{contentType:f.type});
if(up.error){$('#rb').disabled=false;return msg('rm','Upload failed: '+up.error.message,1)}
const {data,error}=await SB.auth.signUp({email:e,password:p,options:{emailRedirectTo:BASE,data:{full_name:n,role_type:role,indigene_of:ind,indigene_doc_path:path,department:dep,grad_year:role==='alumni'?yr:'',level:role==='student'?lv:''}}});
$('#rb').disabled=false;
if(error)return msg('rm',error.message,1);
if(data.user&&data.user.identities&&data.user.identities.length===0)return msg('rm','This email is already registered. Try logging in.',1);
msg('rm','Almost done. Check your email to verify your address. After that, an administrator will approve your account.')}
async function forgot(){const e=$('#fe').value.trim();if(!e)return;const {error}=await SB.auth.resetPasswordForEmail(e,{redirectTo:BASE});msg('fm',error?error.message:'If that email is registered, a time-limited reset link has been sent.',!!error)}
async function newPw(){const p=$('#np').value;if(p.length<8)return msg('nm','Password must be at least 8 characters.',1);const {error}=await SB.auth.updateUser({password:p});msg('nm',error?error.message:'Password updated. You can now continue.',!!error);if(!error)setTimeout(()=>{location.hash='#home'},1200)}
async function saveProf(){const v=id=>$('#'+id).value.trim(),c=id=>$('#'+id).checked;
const ok=await run(SB.from('profiles').update({full_name:v('pn'),department:v('pd'),level:v('pl'),grad_year:v('py'),interests:v('pi'),career:v('pc'),bio:v('pb'),phone:v('pp'),show_details:c('ps'),share_email:c('pe'),share_phone:c('ph'),email_notifications:c('pm')}).eq('id',S.sess.user.id));
if(ok){await loadProf();nav();msg('pmsg','Profile saved.')}}
function flt(){const t=($('#sq')||{value:''}).value.toLowerCase(),d=($('#sf')||{value:''}).value;
const r=S.rows.filter(x=>(!d||x.department===d)&&(!t||[x.full_name,x.department,x.interests,x.career].join(' ').toLowerCase().includes(t)));
const sub=x=>[x.department,x.role_type=='alumni'?(x.grad_year?'Class of '+x.grad_year:''):x.role_type=='student'?(x.level?x.level+' Level':''):''].filter(Boolean).map(esc).join(' · ');
$('#list').innerHTML=r.map(x=>`<div class="card">${av(x.full_name)}<b>${esc(x.full_name)}</b><div class="mu">${sub(x)}</div>${x.career?`<div class="mu">${esc(x.career)}</div>`:''}${x.interests?`<span class="tag">${esc(x.interests)}</span>`:''}${x.email?`<div class="mu">✉ ${esc(x.email)}</div>`:''}${x.phone?`<div class="mu">☎ ${esc(x.phone)}</div>`:''}</div>`).join('')||'<p class="mu">No matches yet.</p>'}
async function people(kind,title){if(!approved())return gate(title);S.rows=await q(SB.from('directory').select('*').eq('role_type',kind))||[];
window.after=flt;const ds=[...new Set(S.rows.map(x=>x.department).filter(Boolean))];
return `<h1>${title}</h1><div class="row"><input id="sq" placeholder="Search name, interest or career" oninput="flt()"><select id="sf" onchange="flt()"><option value="">All departments</option>${ds.map(d=>`<option>${esc(d)}</option>`).join('')}</select></div><div id="list" class="grid"></div>`}
const V={
home:async()=>{const c=await q(SB.rpc('member_counts')),L=(u,a)=>u?`<img class="lg" src="${esc(u)}" alt="${a}">`:'',lg=L(S.cfg.logo_ibbul,'IBBUL')+L(S.cfg.logo_nabs,'NABS IBBUL Chapter');
return `${lg?`<div class="lgs">${lg}</div>`:''}<section class="hero"><span class="pill">IBBUL · NABS Chapter</span><h1>Where the BIDA community connects</h1><p>Students, alumni and staff of Ibrahim Badamasi Babangida University, Lapai: meet, mentor and stay in the loop.</p><div class="cta">${S.sess?'<a class="btn w" href="#alumni">Explore alumni</a>':'<a class="btn w" href="#register">Create account</a><a class="btn g" href="#login">Log in</a>'}</div></section>${c?`<div class="stats">${[['Members',c.total],['Students',c.students],['Staff',c.staff],['Alumni',c.alumni]].map(x=>`<div class="card stat"><b>${Number(x[1]||0).toLocaleString()}</b><span class="mu">${x[0]}</span></div>`).join('')}</div>`:''}
<h2>Explore</h2><div class="grid">${[['executives','🏛️','NABS Executives','Meet the current team'],['staff','🧑‍🏫','Staff','Mentors and lecturers'],['alumni','🎓','Alumni','Graduates by year and field'],['students','👥','Students','Connect with peers'],['announcements','📣','Announcements','News and events']].map(x=>`<a class="card" href="#${x[0]}"><div class="ico">${x[1]}</div><b>${x[2]}</b><div class="mu">${x[3]}</div></a>`).join('')}</div>
<h2>How it works</h2><div class="steps"><div class="card"><b>1</b>Register as a student, alumni or staff</div><div class="card"><b>2</b>Verify your email</div><div class="card"><b>3</b>Get approved and start connecting</div></div>`},
executives:async()=>{const t=await q(SB.from('exec_teams').select('*').order('is_current',{ascending:false}).order('created_at',{ascending:false}))||[],m=await q(SB.from('exec_members').select('*').order('sort'))||[];
return `<h1>NABS IBBUL Chapter Executives</h1>`+(t.map(x=>`<h2>${esc(x.session)} ${x.is_current?'<span class="tag">Current</span>':'<span class="tag" style="background:var(--bd);color:var(--mu)">Archived</span>'}</h2><div class="grid">${m.filter(y=>y.team_id===x.id).map(y=>`<div class="card">${av(y.name,y.photo_url)}<b>${esc(y.name)}</b><div class="mu">${esc(y.position)}</div></div>`).join('')||'<p class="mu">No members added yet.</p>'}</div>`).join('')||'<p class="mu">No executive teams yet.</p>')},
staff:()=>people('staff','Staff'),alumni:()=>people('alumni','Alumni'),students:()=>people('student','Students'),
announcements:async()=>{if(!approved())return gate('Announcements');const n=await q(SB.from('announcements').select('*').order('created_at',{ascending:false}))||[];
return `<h1>Announcements</h1>`+(n.map(x=>`<div class="card" style="margin-bottom:12px"><span class="tag">${esc(x.kind)}</span><h3 style="margin:.3em 0">${esc(x.title)}</h3><div class="mu" style="white-space:pre-wrap">${esc(x.body||'')}</div><div class="mu">${new Date(x.created_at).toLocaleDateString()}</div></div>`).join('')||'<p class="mu">No announcements yet.</p>')},
community:async()=>{if(!approved())return gate('Community');
const p=await q(SB.from('posts').select('*').order('created_at',{ascending:false}).limit(50))||[];
return `<h1>Community</h1><div class="card" style="margin-bottom:14px"><textarea id="pt" rows="3" maxlength="1000" placeholder="Share something with the BIDA community…"></textarea><div class="row" style="align-items:center"><span class="mu" style="flex:1">Be respectful. Only approved members can see posts.</span><button class="btn s" style="flex:0" onclick="sendPost()">Post</button></div></div>`+(p.map(x=>`<div class="card" style="margin-bottom:12px"><div style="display:flex;gap:10px;align-items:center"><div class="av" style="width:42px;height:42px;margin:0">${ini(x.author_name)}</div><div><b>${esc(x.author_name||'Member')}</b> <span class="tag">${esc(x.author_role)}</span><div class="mu">${new Date(x.created_at).toLocaleString()}</div></div></div><div style="white-space:pre-wrap;margin:10px 0 4px">${esc(x.body)}</div>${(S.sess&&x.author_id===S.sess.user.id)||isAdmin()?`<button class="btn d s" onclick="delPost('${x.id}')">Delete</button>`:''}</div>`).join('')||'<p class="mu">No posts yet. Be the first to post.</p>')},
login:async()=>`<div class="form card"><h1>Log in</h1><label>Email</label><input id="e" type="email" autocomplete="email">${pw('p','Password')}<button class="btn" onclick="login(false)">Log in</button> <a href="#forgot">Forgot password?</a><div id="lm" hidden></div></div>`,
forgot:async()=>`<div class="form card"><h1>Reset password</h1><label>Email</label><input type="email" id="fe"><button class="btn" onclick="forgot()">Send reset link</button><div id="fm" hidden></div></div>`,
reset:async()=>`<div class="form card"><h1>Choose a new password</h1>${pw('np','New password')}<button class="btn" onclick="newPw()">Save password</button><div id="nm" hidden></div></div>`,
register:async()=>`<div class="form card"><h1>Create your account</h1><p class="mu">Students, alumni and staff all register here. An administrator approves every account.</p><label>Full name</label><input id="rn"><label>Email</label><input id="re" type="email" autocomplete="email"><label>I am a</label><select id="rt" onchange="roleChange()"><option value="student">Student</option><option value="alumni">Alumni</option><option value="staff">Staff</option></select>
<div><label>Department *</label><input id="rd" list="deps" placeholder="Choose or type your department"><datalist id="deps">${['Accounting','Biochemistry','Biology','Business Administration','Chemistry','Computer Science','Economics','Education','English','History','Islamic Studies','Linguistics','Mass Communication','Mathematics','Microbiology','Physics','Political Science','Sociology'].map(d=>`<option value="${d}">`).join('')}</datalist></div>
<div id="f-yr" hidden><label>Year of graduation *</label><input id="ry" inputmode="numeric" maxlength="4" placeholder="e.g. 2022"></div>
<div id="f-lv"><label>Level (optional)</label><input id="rl" placeholder="e.g. 300"></div>
<label>Indigene of (town or LGA) *</label><input id="ri" placeholder="e.g. Bida">
<label>Upload your indigene picture or certificate (photo or PDF, max 5 MB) *</label><input id="rf" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onchange="prev(this)"><div id="rfp" class="mu"></div>
<div class="note">Only administrators can see this upload. It is used to verify your membership and is never shown on your public profile.</div>${pw('rp','Password (at least 8 characters)')}
<button class="btn" id="rb" onclick="register()">Create account</button><div id="rm" hidden></div></div>`,
profile:async()=>{if(!S.sess)return gate('My profile');const p=S.prof||{};const f=(id,l,v)=>`<label>${l}</label><input id="${id}" value="${esc(v)}">`;const c=(id,l,v)=>`<label class="chk"><input type="checkbox" id="${id}" ${v?'checked':''}> ${l}</label>`;
const alum=await alumCard(p);
return `<div class="form card"><h1>My profile</h1><p class="mu">Status: <span class="tag">${esc(p.status||'unknown')}</span> <span class="tag">${esc(p.role_type||'')}</span></p>${f('pn','Full name',p.full_name)}${f('pd','Department',p.department)}${f('pl','Level (students)',p.level)}${f('py','Graduation year (alumni)',p.grad_year)}${f('pi','Interests',p.interests)}${f('pc','Position, career field or goals',p.career)}<label>Short bio</label><textarea id="pb" rows="3">${esc(p.bio)}</textarea>${f('pp','Phone (optional)',p.phone)}
<h2>Privacy</h2>${c('ps','Show my department, level, year and interests to members',p.show_details)}${c('pe','Share my email with members',p.share_email)}${c('ph','Share my phone number with members',p.share_phone)}<br>${c('pm','Email me about announcements and events',p.email_notifications)}<br>
<button class="btn" onclick="saveProf()">Save profile</button><div id="pmsg" hidden></div></div>${alum}`},
privacy:async()=>`<h1>Privacy</h1><p>We collect only what members provide. Emails and phone numbers are never shown unless you choose to share them. Passwords are stored hashed, never in readable text. Indigene documents are visible only to administrators.</p>`,
guidelines:async()=>`<h1>Community guidelines</h1><p>Be respectful, keep information accurate, protect others’ privacy, and report abuse to an administrator.</p>`,
contact:async()=>`<h1>Contact</h1><p class="mu">Add your official contact details here.</p>`,
admin:async()=>{if(!isAdmin())return `<div class="form card admin"><h1>Admin portal</h1><div class="note">Administrators only. Sign in with your admin account.</div><label>Admin email</label><input id="e" type="email">${pw('p','Password')}<button class="btn" onclick="login(true)">Sign in</button><div id="lm" hidden></div></div>`;
const mem=await q(SB.from('profiles').select('*').order('created_at',{ascending:false}))||[],teams=await q(SB.from('exec_teams').select('*').order('created_at',{ascending:false}))||[],ex=await q(SB.from('exec_members').select('*').order('sort'))||[],nw=await q(SB.from('announcements').select('*').order('created_at',{ascending:false}))||[];
const rq=await q(SB.from('alumni_requests').select('*').eq('status','pending').order('created_at',{ascending:false}))||[];
mem.sort((a,b)=>(a.status=='pending'?0:1)-(b.status=='pending'?0:1));
return `<div class="card admin"><h1>Administration</h1>
<h2>Alumni switch requests (${rq.length})</h2>${rq.map(r=>{const m=mem.find(x=>x.id===r.user_id)||{};return `<div class="card" style="margin-bottom:10px;box-shadow:none"><b>${esc(m.full_name||'Member')}</b> <span class="tag">${esc(m.department||'')}</span><div class="mu">Matric: ${esc(r.matric_no)} · Graduated: ${esc(r.grad_year)}</div><button class="btn o s" onclick="viewDoc(this,'${esc(r.letter_path||'')}')">View admission letter</button> <button class="btn s" onclick="resolveReq('${r.id}',true)">Approve</button> <button class="btn d s" onclick="resolveReq('${r.id}',false)">Reject</button></div>`}).join('')||'<p class="mu">No pending requests.</p>'}
<h2>Members (${mem.length})</h2>${mem.map(p=>`<div class="card" style="margin-bottom:10px;box-shadow:none"><b>${esc(p.full_name)}</b> <span class="tag">${esc(p.status)}</span><span class="tag">${esc(p.role_type)}</span>${p.is_admin?'<span class="tag">admin</span>':''}<div class="mu">${esc(p.email)} · indigene: ${esc(p.indigene_of||'')}</div>${p.indigene_doc_path?`<button class="btn o s" onclick="viewDoc(this,'${esc(p.indigene_doc_path)}')">View indigene document</button> `:''}<button class="btn s" onclick="setSt('${p.id}','approved')">Approve</button> <button class="btn d s" onclick="setSt('${p.id}','suspended')">Suspend</button> ${p.is_admin?'':`<button class="btn d s" onclick="delMember('${p.id}','${esc(p.indigene_doc_path||'')}')">Delete</button>`}</div>`).join('')}
<h2>Executive teams</h2>${teams.map(t=>`<div class="card" style="margin-bottom:10px;box-shadow:none"><b>${esc(t.session)}</b> ${t.is_current?'<span class="tag">Current</span>':`<button class="btn o s" onclick="curTeam('${t.id}')">Make current</button>`} <button class="btn d s" onclick="del('exec_teams','${t.id}')">Delete team</button>${ex.filter(m=>m.team_id===t.id).map(m=>`<div class="mu">${esc(m.name)}, ${esc(m.position)} <a href="#" onclick="del('exec_members','${m.id}');return false">remove</a></div>`).join('')}
<div class="row"><input id="en-${t.id}" placeholder="Name"><input id="ep-${t.id}" placeholder="Position"><input id="ef-${t.id}" type="file" accept="image/jpeg,image/png,image/webp" title="Photo (optional)"><button class="btn s" style="flex:0" onclick="addEx('${t.id}')">Add</button></div></div>`).join('')}
<div class="row"><input id="ts" placeholder="New session e.g. 2026/2027"><button class="btn s" style="flex:0" onclick="addTeam()">Create team</button></div>
<h2>Site logos</h2><div class="row">${[['logo_ibbul','IBBUL logo','lg1'],['logo_nabs','NABS IBBUL Chapter logo','lg2']].map(x=>`<div class="card" style="box-shadow:none"><label>${x[1]}</label>${S.cfg[x[0]]?`<img class="lg" style="height:56px;max-width:100%;display:block;margin:6px 0" src="${esc(S.cfg[x[0]])}" alt="${x[1]}">`:'<p class="mu">Not set</p>'}<input id="${x[2]}" type="file" accept="image/jpeg,image/png,image/webp"><button class="btn s" onclick="saveLogo('${x[0]}','${x[2]}')">Save</button> ${S.cfg[x[0]]?`<button class="btn d s" onclick="removeLogo('${x[0]}')">Remove</button>`:''}</div>`).join('')}</div>
<h2>Announcements</h2>${nw.map(n=>`<div class="mu">${esc(n.title)} <a href="#" onclick="del('announcements','${n.id}');return false">delete</a></div>`).join('')}
<input id="nt" placeholder="Title"><textarea id="nb" rows="3" placeholder="Message"></textarea><select id="nk"><option>Announcement</option><option>Event</option><option>Update</option></select><label class="chk"><input type="checkbox" id="nem" checked> Also email members who opted in</label><br><button class="btn" onclick="postNews()">Publish</button></div>`}};
async function viewDoc(b,path){const {data,error}=await SB.storage.from('indigene-docs').createSignedUrl(path,120);if(error)return alert(error.message);b.outerHTML=`<a class="btn o s" href="${esc(data.signedUrl)}" target="_blank" rel="noopener">Open document</a> `}
async function setSt(id,s){if(await run(SB.rpc('admin_set_status',{uid:id,new_status:s})))draw()}
async function curTeam(id){if(await run(SB.rpc('admin_set_current_team',{team:id})))draw()}
async function del(t,id){if(!confirm('Delete this item?'))return;if(await run(SB.from(t).delete().eq('id',id)))draw()}
async function addTeam(){const s=$('#ts').value.trim();if(s&&await run(SB.from('exec_teams').insert({session:s})))draw()}
async function upPhoto(inp){const f=inp&&inp.files[0];if(!f)return '';if(f.size>2097152||!/^image\/(jpeg|png|webp)$/.test(f.type)){alert('Photo must be a JPG, PNG or WebP under 2 MB.');return null}
const ext=f.type==='image/jpeg'?'jpg':f.type.split('/')[1],path=crypto.randomUUID()+'.'+ext;
const {error}=await SB.storage.from('photos').upload(path,f,{contentType:f.type});if(error){alert(error.message);return null}
return SB.storage.from('photos').getPublicUrl(path).data.publicUrl}
async function addEx(t){const n=$('#en-'+t).value.trim(),p=$('#ep-'+t).value.trim();if(!n||!p)return;const u=await upPhoto($('#ef-'+t));if(u===null)return;if(await run(SB.from('exec_members').insert({team_id:t,name:n,position:p,photo_url:u||null})))draw()}
async function delMember(id,path){if(!confirm('Permanently delete this member and their uploaded document?'))return;if(path)await SB.storage.from('indigene-docs').remove([path]);if(await run(SB.rpc('admin_delete_member',{uid:id})))draw()}
async function postNews(){const t=$('#nt').value.trim();if(!t)return;const {data,error}=await SB.from('announcements').insert({title:t,body:$('#nb').value,kind:$('#nk').value}).select('id').single();if(error)return alert(error.message);
if($('#nem').checked){const r=await SB.functions.invoke('swift-function',{body:{id:data.id}});alert(r.error?'Posted, but the emails were not sent. Email sending is not set up yet.':'Posted and emailed to members.')}draw()}
function roleChange(){const r=$('#rt').value;$('#f-yr').hidden=r!=='alumni';$('#f-lv').hidden=r!=='student'}
async function sendPost(){const t=$('#pt').value.trim();if(!t)return;if(await run(SB.from('posts').insert({body:t})))draw()}
async function delPost(id){if(confirm('Delete this post?')&&await run(SB.from('posts').delete().eq('id',id)))draw()}
async function saveLogo(key,id){const u=await upPhoto($('#'+id));if(!u)return alert('Choose an image first (JPG, PNG or WebP, under 2 MB).');if(await run(SB.from('site_settings').upsert({key:key,value:u}))){await loadCfg();draw()}}
async function removeLogo(key){if(confirm('Remove this logo?')&&await run(SB.from('site_settings').delete().eq('key',key))){await loadCfg();draw()}}
async function alumCard(p){if(p.role_type!=='student')return '';
const r=(await q(SB.from('alumni_requests').select('*').eq('user_id',S.sess.user.id).order('created_at',{ascending:false}).limit(1))||[])[0];
if(r&&r.status==='pending')return '<div class="form card"><h2>Graduated?</h2><div class="note">Your request to switch to alumni is waiting for an administrator to review it.</div></div>';
return `<div class="form card"><h2>Graduated? Switch to alumni</h2>${r&&r.status==='rejected'?'<div class="note">Your last request was not approved. You can send a new one.</div>':''}<p class="mu">Fill in your details and an administrator will review them.</p><label>Matric number *</label><input id="am"><label>Year of graduation *</label><input id="ay" inputmode="numeric" maxlength="4" placeholder="e.g. 2025"><label>Admission letter (photo or PDF, max 5 MB) *</label><input id="af" type="file" accept="image/jpeg,image/png,image/webp,application/pdf"><button class="btn" onclick="reqAlumni()">Send request</button><div id="amsg" hidden></div></div>`}
async function reqAlumni(){const m=$('#am').value.trim(),y=$('#ay').value.trim(),f=$('#af').files[0];
if(!m)return msg('amsg','Please enter your matric number.',1);
if(!/^(19|20)\d{2}$/.test(y))return msg('amsg','Please enter your year of graduation, for example 2025.',1);
if(!f||f.size>5242880||!/^(image\/(jpeg|png|webp)|application\/pdf)$/.test(f.type))return msg('amsg','Upload your admission letter (JPG, PNG, WebP or PDF under 5 MB).',1);
msg('amsg','Sending…');
const ext=(f.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,''),path='alumni/'+S.sess.user.id+'/'+crypto.randomUUID()+'.'+ext;
const up=await SB.storage.from('indigene-docs').upload(path,f,{contentType:f.type});if(up.error)return msg('amsg','Upload failed: '+up.error.message,1);
const r=await SB.from('alumni_requests').insert({user_id:S.sess.user.id,matric_no:m,grad_year:y,letter_path:path});
if(r.error)return msg('amsg',r.error.message,1);draw()}
async function resolveReq(id,ok){if(await run(SB.rpc('admin_resolve_alumni_request',{req:id,approve:ok})))draw()}
let seq=0;
async function draw(){closeMenu();const my=++seq,h=(location.hash||'#home').slice(1);let html;
try{html=await (V[h]||V.home)()}catch(e){console.error(e);html='<p>Something went wrong. Please refresh.</p>'}
if(my!==seq)return;$('#app').innerHTML=html;nav();window.scrollTo(0,0);if(window.after){const f=window.after;window.after=null;f()}}
addEventListener('hashchange',draw);
$('#nav').addEventListener('click',e=>{if(e.target.closest&&e.target.closest('a'))closeMenu()});
draw();
(async()=>{try{await handleHash();const {data}=await SB.auth.getSession();S.sess=data.session;await loadProf();await loadCfg()}catch(e){console.error(e)}draw()})();
