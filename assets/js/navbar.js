/* Wspólny mechanizm nawigacji. Wariant wybierany przez data-nav na body. */
(()=>{
 const host=document.getElementById('site-navbar'); if(!host)return;
 const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
 const admin=page==='admin.html', auth=['login.html','register.html'].includes(page);
  const logo='https://static-cdn.jtvnw.net/jtv_user_pictures/08e1bb79-1557-4e2f-ba28-0937f6eeb71d-profile_image-70x70.png';
 const brand=`<a class="brand" href="index.html"><div class="logo"><img src="${logo}" alt="BlazePL007"></div><div>BLAZEPL007<small>${admin?'PANEL ADMINISTRATORA':'COMMUNITY TOURNAMENT'}</small></div></a>`;
 const item=(file,label)=>page===file?'':`<a href="${file}">${label}</a>`;
 const links=admin?[item('admin.html','PANEL'),item('index.html','STRONA GŁÓWNA'),item('teams.html','DRUŻYNY'),item('stats.html','STATYSTYKI')].join(''):auth?[item('index.html','STRONA GŁÓWNA'),item('bracket.html','DRABINKA'),item('results.html','WYNIKI'),item('teams.html','DRUŻYNY'),item('stats.html','STATYSTYKI')].join(''):[item('index.html','STRONA GŁÓWNA'),item('bracket.html','DRABINKA'),item('results.html','WYNIKI'),item('teams.html','DRUŻYNY'),item('stats.html','STATYSTYKI')].join('');
 host.innerHTML=`<nav class="site-nav ${admin?'admin-nav':auth?'auth-nav':'public-nav'}"><div class="wrap inner">${brand}<button class="nav-toggle" type="button" aria-label="Otwórz menu" aria-expanded="false">☰</button><div class="navlinks">${links}</div><div class="nav-actions">${admin?'<button class="btn ghost" id="logout" type="button">WYLOGUJ</button>':auth?'<a class="btn ghost" href="index.html">STRONA GŁÓWNA</a>':'<a class="btn" id="accountNavBtn" href="login.html">LOGOWANIE</a><a class="btn ghost hidden" id="adminNavBtn" href="admin.html">ADMIN PANEL</a>'}</div></div></nav>`;
 const toggle=host.querySelector('.nav-toggle'), nav=host.querySelector('.site-nav');
 toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('menu-open');toggle.setAttribute('aria-expanded',String(open));});
 if(!admin&&!auth&&window.supabase&&window.SUPABASE_URL&&window.SUPABASE_PUBLISHABLE_KEY){
  const db=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,storage:window.localStorage}});
  const account=host.querySelector('#accountNavBtn'),adminBtn=host.querySelector('#adminNavBtn');let seq=0;
  const update=async session=>{const signed=!!session?.user;account.textContent=signed?'KONTO':'LOGOWANIE';account.href=signed?'register.html':'login.html';adminBtn.classList.add('hidden');if(signed){const n=++seq;try{const {data,error}=await db.rpc('is_admin_member');if(n===seq&&!error&&data===true)adminBtn.classList.remove('hidden')}catch(_){}}};
  db.auth.getSession().then(({data})=>update(data.session));db.auth.onAuthStateChange((_e,s)=>update(s));
 }
})();
