/* Wspólny mechanizm nawigacji. Wariant wybierany przez data-nav na body. */
(()=>{
 const host=document.getElementById('site-navbar'); if(!host)return;
 const page=(location.pathname.split('/').pop()||'home.html').toLowerCase();
 const admin=page==='admin.html', auth=['login.html','register.html'].includes(page);
 const logo='https://static-cdn.jtvnw.net/jtv_user_pictures/08e1bb79-1557-4e2f-ba28-0937f6eeb71d-profile_image-70x70.png';
 const brand=`<a class="brand" href="home.html"><div class="logo"><img src="${logo}" alt="BlazePL007"></div><div>BLAZEPL007<small>${admin?'PANEL ADMINISTRATORA':'COMMUNITY TOURNAMENT'}</small></div></a>`;
 const item=(file,label)=>page===file?'':`<a href="${file}">${label}</a>`;
 const faceit='<a href="https://www.faceit.com/pl/club/634e9c39-5dce-42ab-976b-c02d03d7420c" target="_blank" rel="noopener noreferrer">FACEIT</a>';
 const links=admin?[item('admin.html','PANEL'),item('home.html','STRONA GŁÓWNA'),item('teams.html','DRUŻYNY'),item('stats.html','STATYSTYKI'),item('info.html','INFORMACJE'),item('archive.html','ARCHIWUM'),faceit].join(''):[item('home.html','STRONA GŁÓWNA'),item('bracket.html','DRABINKA'),item('results.html','WYNIKI'),item('teams.html','DRUŻYNY'),item('stats.html','STATYSTYKI'),item('info.html','INFORMACJE'),item('archive.html','ARCHIWUM'),faceit].join('');
 host.innerHTML=`<nav class="site-nav ${admin?'admin-nav':auth?'auth-nav':'public-nav'}"><div class="wrap inner">${brand}<button class="nav-toggle" type="button" aria-label="Otwórz menu" aria-expanded="false">☰</button><div class="navlinks">${links}</div><div class="nav-actions">${admin?'<button class="btn ghost" id="logout" type="button">WYLOGUJ</button>':auth?'<a class="btn ghost" href="home.html">STRONA GŁÓWNA</a>':'<a class="btn" id="accountNavBtn" href="login.html">LOGOWANIE</a><a class="btn ghost hidden" id="adminNavBtn" href="admin.html">ADMIN PANEL</a>'}</div></div></nav>`;
 const toggle=host.querySelector('.nav-toggle'),nav=host.querySelector('.site-nav');
 toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('menu-open');toggle.setAttribute('aria-expanded',String(open));});
 if(admin||auth)return;
 const initAuthNav=()=>{
  if(!window.supabase||!window.SUPABASE_URL||!window.SUPABASE_PUBLISHABLE_KEY)return;
  const db=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,storage:window.localStorage}});
  const account=host.querySelector('#accountNavBtn'),adminBtn=host.querySelector('#adminNavBtn');let seq=0;
  const update=async session=>{
   const signed=!!session?.user;
   account.textContent=signed?'KONTO':'LOGOWANIE';
   account.href=signed?'account.html':'login.html';
   adminBtn.classList.add('hidden');
   if(signed){
    const n=++seq;
    try{const {data,error}=await db.rpc('is_admin_member');if(n===seq&&!error&&data===true)adminBtn.classList.remove('hidden')}catch(_){}
   }else{seq++}
  };
  db.auth.getSession().then(({data})=>update(data.session));
  db.auth.onAuthStateChange((_event,session)=>update(session));
 };
 // navbar.js jest wczytywany w <head>, a Supabase w dalszej części strony.
 // Inicjalizacja po load gwarantuje, że biblioteka i konfiguracja są już dostępne.
 if(document.readyState==='complete')initAuthNav();
 else window.addEventListener('load',initAuthNav,{once:true});
})();