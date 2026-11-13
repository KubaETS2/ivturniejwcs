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
 function render(state){
  const groups=calc(state);
  let html='';
  const playoffMatches=Array.isArray(state.playoffs)?state.playoffs:[];
  const finalStandings=Array.isArray(state.finalStandings)?state.finalStandings:[];
  if(state.playoffsClosed&&finalStandings.length){html+='<section class="panel final-standings"><div class="eyebrow">OFICJALNE WYNIKI</div><h2>KLASYFIKACJA KOŃCOWA</h2><ol class="final-standings-list">'+finalStandings.slice().sort((a,b)=>a.place-b.place).map(r=>`<li><span class="final-place">${fmt(r.place)}.</span><strong>${safe(r.name)}</strong>${r.place===1?'<span class="champion-tag">MISTRZ</span>':''}</li>`).join('')+'</ol></section>'; }
  const labels={R16:'1/8 FINAŁU',QF:'ĆWIERĆFINAŁY',SF:'PÓŁFINAŁY',FINAL:'WIELKI FINAŁ',THIRD:'MECZ O 3. MIEJSCE'};
  const order=['R16','QF','SF','THIRD','FINAL'];

  // Faza pucharowa jest prezentowana na samej górze strony drabinki.
  html+='<div class="public-playoffs">';
  html+='<div class="head"><div><div class="eyebrow">DECYDUJĄCE MECZE</div><h2>FAZA PUCHAROWA</h2><p>Drabinka turniejowa · BO3</p></div></div>';
  if(playoffMatches.length){
   html+='<div class="playoff-rounds">';
   order.filter(r=>playoffMatches.some(m=>m.round===r)).forEach(r=>{
    html+=`<section class="panel playoff-round"><h3>${labels[r]}</h3><div class="results">`;
    playoffMatches.filter(m=>m.round===r).sort((a,b)=>a.index-b.index).forEach(m=>{
     const score=(m.maps||[]).filter(x=>x&&x.a!==null&&x.b!==null).map(x=>`${x.a}:${x.b}`).join(' / ');
     html+=`<div class="result"><div><small>${m.date?safe(m.date+' · '+(m.time||'')):'Termin do ustalenia'}</small><strong>${safe(m.team1||'Oczekuje na drużynę')} vs ${safe(m.team2||'Oczekuje na drużynę')}</strong>${m.winnerName?`<small>AWANS: ${safe(m.winnerName)}</small>`:''}</div><div class="scorebig">${score||'—'}</div></div>`;
    });
    html+='</div></section>';
   });
   html+='</div>';
  }else{
   html+='<div class="panel"><p class="note">Faza pucharowa pojawi się tutaj po zakończeniu fazy grupowej i utworzeniu drabinki przez administratora.</p></div>';
  }
  html+='</div>';

  if(!groups.length){html+='<div class="panel"><p class="note">Faza grupowa nie została jeszcze skonfigurowana.</p></div>';root.innerHTML=html;return;}

  // Dotychczasowe tabele i mecze grupowe są schowane w rozwijanej sekcji.
  html+='<details class="panel group-stage-accordion"><summary><span><b>FAZA GRUPOWA</b><small>Tabele grupowe, wyniki i awanse</small></span><span class="accordion-mark">+</span></summary><div class="group-stage-content">';
  html+='<h3>TABELE GRUPOWE</h3><div class="group-tables">';
  groups.forEach(g=>{html+=`<div class="panel group-table"><h3>${safe(g.name)}</h3><div class="table-scroll"><table><thead><tr><th>Drużyna</th><th>M</th><th>W</th><th>R</th><th>P</th><th>Rundy</th><th>Pkt</th></tr></thead><tbody>${g.rows.map(r=>`<tr><td>${safe(r.name)}</td><td>${r.M}</td><td>${r.W}</td><td>${r.R}</td><td>${r.P}</td><td>${r.rf}:${r.ra}</td><td><b>${r.Pkt}</b></td></tr>`).join('')}</tbody></table></div><p class="note">Awans: dwie najlepsze drużyny.</p></div>`});
  html+='</div><h3 style="margin-top:28px">MECZE GRUPOWE</h3><div class="results">';
  (state.matches||[]).forEach(m=>{html+=`<div class="result"><div><small>${safe(m.group)} · BO2</small><strong>${safe(m.team1)} vs ${safe(m.team2)}</strong></div><div class="scorebig">${m.played?(m.maps||[]).map(x=>`${x.name?safe(x.name)+' ':''}${x.a}:${x.b}`).join(' / '):'—'}</div></div>`});
  html+='</div>';
  const allDone=(state.matches||[]).length>0&&(state.matches||[]).every(m=>m.played);
  if(allDone){const qualifiers=groups.flatMap(g=>g.rows.slice(0,2).map((r,i)=>({...r,group:g.name,place:i+1})));html+='<h3 style="margin-top:28px">AWANS DO FAZY PUCHAROWEJ</h3><div class="teamlist">'+qualifiers.map(q=>`<div class="teamcard"><div><small>${safe(q.group)} · ${q.place}. MIEJSCE</small><strong>${safe(q.name)}</strong></div></div>`).join('')+'</div>';}
  html+='</div></details>';
  root.innerHTML=html;
 }
 db.from('tournament_state').select('state').eq('id',1).maybeSingle().then(({data,error})=>{if(error){root.textContent='Nie udało się pobrać danych turnieju: '+error.message;return}render(data?.state||{});});
})();
