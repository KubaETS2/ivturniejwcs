/* Publiczny renderer turnieju. Wymaga supabase-config.js oraz Supabase JS v2. */
(()=>{
 const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const db=window.supabase?.createClient(window.SUPABASE_URL,window.SUPABASE_PUBLISHABLE_KEY);
 const root=document.getElementById('tournamentPublic'); if(!db||!root)return;
 const fmt=n=>Number.isFinite(+n)?+n:0;
 function calc(state){return (state.groups||[]).map(g=>{const rows=g.teams.map(t=>({id:t.id,name:t.name,M:0,W:0,R:0,P:0,rf:0,ra:0,Pkt:0}));
  (state.matches||[]).filter(m=>m.group===g.name&&m.played).forEach(m=>{const a=rows.find(x=>x.id===m.team1Id),b=rows.find(x=>x.id===m.team2Id);if(!a||!b)return;a.M++;b.M++;const mapsA=(m.maps||[]).filter(x=>x.a!==null&&x.b!==null).reduce((s,x)=>s+(x.a>x.b?1:0),0);const mapsB=(m.maps||[]).filter(x=>x.a!==null&&x.b!==null).reduce((s,x)=>s+(x.b>x.a?1:0),0);if(mapsA>mapsB){a.W++;b.P++}else if(mapsB>mapsA){b.W++;a.P++}else{a.R++;b.R++}a.Pkt+=mapsA;b.Pkt+=mapsB;(m.maps||[]).forEach(x=>{a.rf+=fmt(x.a);a.ra+=fmt(x.b);b.rf+=fmt(x.b);b.ra+=fmt(x.a)})});
  rows.forEach(r=>{r.diff=r.rf-r.ra;const o=state.standingsOverrides?.[r.id];if(o){['M','W','R','P','rf','ra','Pkt'].forEach(k=>{if(o[k]!==undefined&&o[k]!==null)r[k]=fmt(o[k])});r.diff=r.rf-r.ra}});
  rows.sort((a,b)=>b.Pkt-a.Pkt||b.diff-a.diff||b.rf-a.rf||a.name.localeCompare(b.name,'pl'));return {name:g.name,rows};});}
 function render(state){const groups=calc(state);let html='';if(!groups.length){root.innerHTML='<p class="note">Faza grupowa nie została jeszcze skonfigurowana.</p>';return}
  html+='<h3>FAZA GRUPOWA</h3><div class="group-tables">';groups.forEach(g=>{html+=`<div class="panel group-table"><h3>${safe(g.name)}</h3><div class="table-scroll"><table><thead><tr><th>Drużyna</th><th>M</th><th>W</th><th>R</th><th>P</th><th>Rundy</th><th>Pkt</th></tr></thead><tbody>${g.rows.map(r=>`<tr><td>${safe(r.name)}</td><td>${r.M}</td><td>${r.W}</td><td>${r.R}</td><td>${r.P}</td><td>${r.rf}:${r.ra}</td><td><b>${r.Pkt}</b></td></tr>`).join('')}</tbody></table></div><p class="note">Awans: dwie najlepsze drużyny.</p></div>`});html+='</div>';
  html+='<h3 style="margin-top:28px">MECZE GRUPOWE</h3><div class="results">';(state.matches||[]).forEach(m=>{html+=`<div class="result"><div><small>${safe(m.group)} · BO2</small><strong>${safe(m.team1)} vs ${safe(m.team2)}</strong></div><div class="scorebig">${m.played?(m.maps||[]).map(x=>`${x.a}:${x.b}`).join(' / '):'—'}</div></div>`});html+='</div>';
  const allDone=(state.matches||[]).length>0&&(state.matches||[]).every(m=>m.played);if(allDone){const qualifiers=groups.flatMap(g=>g.rows.slice(0,2).map((r,i)=>({...r,group:g.name,place:i+1})));html+='<h3 style="margin-top:28px">AWANS DO FAZY PUCHAROWEJ</h3><div class="teamlist">'+qualifiers.map(q=>`<div class="teamcard"><div><small>${safe(q.group)} · ${q.place}. MIEJSCE</small><strong>${safe(q.name)}</strong></div></div>`).join('')+'</div><p class="note">Drabinka play-off: zwycięzca grupy A gra z drugim zespołem grupy B, zwycięzca B z drugim A; analogicznie C/D. Faza pucharowa BO3.</p>'}
  root.innerHTML=html;
 }
 db.from('tournament_state').select('state').eq('id',1).maybeSingle().then(({data,error})=>{if(error){root.textContent='Nie udało się pobrać danych turnieju: '+error.message;return}render(data?.state||{});});
})();
