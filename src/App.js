import { useState, useEffect, useRef } from "react";

const PRIORITIES = ["Alta","Média","Baixa"];
const PCOLOR = { Alta:"#E24B4A", Média:"#BA7517", Baixa:"#1D9E75" };
const DAYS = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];
const HOURS = Array.from({length:15},(_,i)=>i+7);
const PALETTE = ["#378ADD","#1D9E75","#D85A30","#D4537E","#BA7517","#534AB7","#639922","#E24B4A"];

const THEMES = {
  azul:   { name:"Azul",    accent:"#185FA5", accentBg:"#E6F1FB", accentText:"#185FA5", tab:"#378ADD" },
  verde:  { name:"Verde",   accent:"#0F6E56", accentBg:"#E1F5EE", accentText:"#0F6E56", tab:"#1D9E75" },
  roxo:   { name:"Roxo",    accent:"#534AB7", accentBg:"#EEEDFE", accentText:"#3C3489", tab:"#534AB7" },
  coral:  { name:"Coral",   accent:"#993C1D", accentBg:"#FAECE7", accentText:"#993C1D", tab:"#D85A30" },
  escuro: { name:"Escuro",  accent:"#aaa",    accentBg:"#2C2C2A", accentText:"#e0e0e0", tab:"#888" },
};

function uid(){ return Math.random().toString(36).slice(2,8); }
function pad(n){ return String(n).padStart(2,"0"); }
function todayStr(){ const d=new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function formatDate(s){ if(!s) return ""; const [y,m,d]=s.split("-"); return `${d}/${m}/${y}`; }
function diffDays(due){ if(!due) return null; const now=new Date(); now.setHours(0,0,0,0); return Math.round((new Date(due+"T00:00:00")-now)/86400000); }

function load(k,fb){ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):fb; }catch{ return fb; } }
function save(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch{} }

const DEMO_SUBJECTS=[
  {id:"s1",name:"Matemática",color:PALETTE[0]},
  {id:"s2",name:"Português",color:PALETTE[1]},
  {id:"s3",name:"História",color:PALETTE[2]},
];
const DEMO_TASKS=[
  {id:"t1",title:"Lista de exercícios cap. 5",subjectId:"s1",due:todayStr(),priority:"Alta",done:false},
  {id:"t2",title:"Redação argumentativa",subjectId:"s2",due:"2025-05-20",priority:"Média",done:false},
  {id:"t3",name:"Leitura cap. 8",title:"Leitura cap. 8",subjectId:"s3",due:"2025-05-22",priority:"Baixa",done:true},
];
const DEMO_BLOCKS=[
  {id:"b1",subjectId:"s1",day:0,hour:8,duration:2},
  {id:"b2",subjectId:"s2",day:1,hour:10,duration:1},
  {id:"b3",subjectId:"s3",day:3,hour:14,duration:2},
];

// ── Pomodoro ──────────────────────────────────────────────
function Pomodoro({ theme }) {
  const MODES = [
    {label:"Foco",     mins:25, color: theme.tab },
    {label:"Pausa curta", mins:5, color:"#1D9E75"},
    {label:"Pausa longa", mins:15, color:"#534AB7"},
  ];
  const [mode,setMode]=useState(0);
  const [secs,setSecs]=useState(MODES[0].mins*60);
  const [running,setRunning]=useState(false);
  const [cycles,setCycles]=useState(0);
  const ref=useRef(null);

  useEffect(()=>{
    setSecs(MODES[mode].mins*60);
    setRunning(false);
  },[mode]);

  useEffect(()=>{
    if(running){
      ref.current=setInterval(()=>{
        setSecs(s=>{
          if(s<=1){ clearInterval(ref.current); setRunning(false); if(mode===0) setCycles(c=>c+1); return 0; }
          return s-1;
        });
      },1000);
    } else clearInterval(ref.current);
    return ()=>clearInterval(ref.current);
  },[running]);

  const total=MODES[mode].mins*60;
  const pct=((total-secs)/total)*100;
  const r=54; const circ=2*Math.PI*r;
  const m=Math.floor(secs/60); const s=secs%60;
  const col=MODES[mode].color;

  return(
    <div style={{textAlign:"center",padding:"1.5rem 1rem 1rem"}}>
      <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:24,flexWrap:"wrap"}}>
        {MODES.map((mo,i)=>(
          <button key={i} onClick={()=>setMode(i)}
            style={{padding:"6px 14px",fontSize:13,borderRadius:20,border:"0.5px solid",cursor:"pointer",fontWeight:500,
              borderColor:mode===i?mo.color:"#d0d0d0",
              background:mode===i?mo.color+"22":"transparent",
              color:mode===i?mo.color:"#555"}}>
            {mo.label}
          </button>
        ))}
      </div>

      <div style={{position:"relative",width:140,height:140,margin:"0 auto 20px"}}>
        <svg width="140" height="140" style={{transform:"rotate(-90deg)"}}>
          <circle cx="70" cy="70" r={r} fill="none" stroke="#eee" strokeWidth="8"/>
          <circle cx="70" cy="70" r={r} fill="none" stroke={col} strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)} strokeLinecap="round"
            style={{transition:"stroke-dashoffset 0.8s ease"}}/>
        </svg>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}>
          <div style={{fontSize:30,fontWeight:500,color:"#111",lineHeight:1}}>{pad(m)}:{pad(s)}</div>
          <div style={{fontSize:12,color:"#888",marginTop:3}}>{MODES[mode].label}</div>
        </div>
      </div>

      <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:16}}>
        <button onClick={()=>setRunning(r=>!r)}
          style={{padding:"8px 28px",fontSize:14,borderRadius:8,border:"none",cursor:"pointer",
            background:col,color:"#fff",fontWeight:500}}>
          {running?"Pausar":"Iniciar"}
        </button>
        <button onClick={()=>{ setRunning(false); setSecs(MODES[mode].mins*60); }}
          style={{padding:"8px 16px",fontSize:14,borderRadius:8,border:"0.5px solid #ccc",cursor:"pointer",background:"transparent",color:"#555"}}>
          Resetar
        </button>
      </div>
      <div style={{fontSize:13,color:"#888"}}>Ciclos concluídos hoje: <strong style={{color:"#111"}}>{cycles}</strong></div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────
export default function App(){
  const [themeKey,setThemeKey]=useState(()=>load("sf_theme","azul"));
  const theme=THEMES[themeKey]||THEMES.azul;
  const isDark=themeKey==="escuro";

  const bg    = isDark?"#1a1a1a":"#EEF2EC";
  const bgSec = isDark?"#252525":"#E2EAE0";
  const bgCard= isDark?"#2a2a2a":"#F5F8F4";
  const border= isDark?"#444":"#e0e0e0";
  const textP = isDark?"#e0e0e0":"#111";
  const textS = isDark?"#aaa":"#888";
  const inputBg=isDark?"#333":"#fff";
  const inputBd=isDark?"#555":"#ccc";

  useEffect(()=>save("sf_theme",themeKey),[themeKey]);

  // users
  const [users,setUsers]=useState(()=>load("sf_users",[{id:"u1",name:"Estudante",avatar:"E"}]));
  const [activeUser,setActiveUser]=useState(()=>load("sf_activeUser","u1"));
  const [showUserMgr,setShowUserMgr]=useState(false);
  const [newUserName,setNewUserName]=useState("");

  useEffect(()=>save("sf_users",users),[users]);
  useEffect(()=>save("sf_activeUser",activeUser),[activeUser]);

  const uKey=id=>({subjects:`sf_sub_${id}`,tasks:`sf_tsk_${id}`,blocks:`sf_blk_${id}`});

  const [subjects,setSubjects]=useState(()=>load(uKey(activeUser).subjects,DEMO_SUBJECTS));
  const [tasks,setTasks]=useState(()=>load(uKey(activeUser).tasks,DEMO_TASKS));
  const [blocks,setBlocks]=useState(()=>load(uKey(activeUser).blocks,DEMO_BLOCKS));

  useEffect(()=>{ setSubjects(load(uKey(activeUser).subjects,DEMO_SUBJECTS)); setTasks(load(uKey(activeUser).tasks,DEMO_TASKS)); setBlocks(load(uKey(activeUser).blocks,DEMO_BLOCKS)); },[activeUser]);
  useEffect(()=>save(uKey(activeUser).subjects,subjects),[subjects,activeUser]);
  useEffect(()=>save(uKey(activeUser).tasks,tasks),[tasks,activeUser]);
  useEffect(()=>save(uKey(activeUser).blocks,blocks),[blocks,activeUser]);

  function addUser(){ if(!newUserName.trim()) return; const id=uid(); const u={id,name:newUserName.trim(),avatar:newUserName.trim()[0].toUpperCase()}; setUsers(p=>[...p,u]); setNewUserName(""); }
  function deleteUser(id){ if(users.length===1) return; setUsers(p=>p.filter(u=>u.id!==id)); if(activeUser===id) setActiveUser(users.find(u=>u.id!==id).id); }
  function switchUser(id){ setActiveUser(id); setShowUserMgr(false); setTab("dashboard"); }

  const [tab,setTab]=useState("dashboard");
  const [filter,setFilter]=useState("Todas");
  const [statsTab,setStatsTab]=useState("progresso");
  const [exportMsg,setExportMsg]=useState("");
  const [showTF,setShowTF]=useState(false);
  const [showSF,setShowSF]=useState(false);
  const [showBF,setShowBF]=useState(false);
  const [newTask,setNewTask]=useState({title:"",subjectId:"",due:"",priority:"Média"});
  const [newSub,setNewSub]=useState({name:"",color:PALETTE[0]});
  const [newBlock,setNewBlock]=useState({subjectId:"",day:0,hour:8,duration:1});

  const subMap=Object.fromEntries(subjects.map(s=>[s.id,s]));
  const pending=tasks.filter(t=>!t.done);
  const done=tasks.filter(t=>t.done);
  const urgent=pending.filter(t=>t.priority==="Alta");
  const today=todayStr();
  const overdue=pending.filter(t=>t.due&&t.due<today);
  const dueToday=pending.filter(t=>t.due===today);
  const todayIdx=new Date().getDay()===0?6:new Date().getDay()-1;

  function addTask(){ if(!newTask.title.trim()) return; setTasks(p=>[...p,{...newTask,id:uid(),done:false}]); setNewTask({title:"",subjectId:"",due:"",priority:"Média"}); setShowTF(false); }
  function addSubject(){ if(!newSub.name.trim()) return; setSubjects(p=>[...p,{...newSub,id:uid()}]); setNewSub({name:"",color:PALETTE[subjects.length%PALETTE.length]}); setShowSF(false); }
  function addBlock(){ if(!newBlock.subjectId) return; setBlocks(p=>[...p,{...newBlock,id:uid()}]); setShowBF(false); }
  function toggleTask(id){ setTasks(p=>p.map(t=>t.id===id?{...t,done:!t.done}:t)); }
  function deleteTask(id){ setTasks(p=>p.filter(t=>t.id!==id)); }
  function deleteBlock(id){ setBlocks(p=>p.filter(b=>b.id!==id)); }
  function deleteSub(id){ setSubjects(p=>p.filter(s=>s.id!==id)); setTasks(p=>p.filter(t=>t.subjectId!==id)); setBlocks(p=>p.filter(b=>b.subjectId!==id)); }

  const filteredTasks=filter==="Todas"?tasks:filter==="Pendentes"?tasks.filter(t=>!t.done):filter==="Concluídas"?tasks.filter(t=>t.done):tasks.filter(t=>t.priority===filter);

  function exportTasks(){ const lines=["Tarefas — StudyFlow","", ...tasks.map(t=>`[${t.done?"✓":" "}] ${t.title} | ${subMap[t.subjectId]?.name||"-"} | ${formatDate(t.due)||"-"} | ${t.priority}`)]; const blob=new Blob([lines.join("\n")],{type:"text/plain"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="studyflow_tarefas.txt"; a.click(); setExportMsg("Exportado!"); setTimeout(()=>setExportMsg(""),2500); }
  function exportSchedule(){ const lines=["Cronograma — StudyFlow",""]; DAYS.forEach((d,di)=>{ const db=blocks.filter(b=>b.day===di).sort((a,b)=>a.hour-b.hour); if(db.length){ lines.push(d+":"); db.forEach(b=>lines.push(`  ${pad(b.hour)}:00–${pad(b.hour+b.duration)}:00  ${subMap[b.subjectId]?.name||"?"}`)); } }); const blob=new Blob([lines.join("\n")],{type:"text/plain"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="studyflow_cronograma.txt"; a.click(); setExportMsg("Exportado!"); setTimeout(()=>setExportMsg(""),2500); }

  const totalHours=subjects.map(sub=>({...sub,hours:blocks.filter(b=>b.subjectId===sub.id).reduce((a,b)=>a+b.duration,0),done:tasks.filter(t=>t.subjectId===sub.id&&t.done).length,total:tasks.filter(t=>t.subjectId===sub.id).length}));
  const maxHours=Math.max(...totalHours.map(s=>s.hours),1);
  const curUser=users.find(u=>u.id===activeUser)||users[0];

  const c={
    card:{background:bgCard,border:`0.5px solid ${border}`,borderRadius:10,padding:"1rem 1.25rem",marginBottom:12},
    inp:{width:"100%",padding:"7px 10px",fontSize:13,border:`0.5px solid ${inputBd}`,borderRadius:6,boxSizing:"border-box",marginBottom:8,background:inputBg,color:textP},
    sel:{width:"100%",padding:"7px 10px",fontSize:13,border:`0.5px solid ${inputBd}`,borderRadius:6,boxSizing:"border-box",marginBottom:8,background:inputBg,color:textP},
    btn:(v)=>({padding:"7px 16px",fontSize:13,borderRadius:6,cursor:"pointer",fontWeight:500,border:v==="primary"?"none":v==="danger"?"0.5px solid #fcc":"0.5px solid "+inputBd,background:v==="primary"?theme.tab:v==="danger"?"#fff0f0":"transparent",color:v==="primary"?"#fff":v==="danger"?"#c00":textP}),
    tab:(a)=>({padding:"6px 14px",fontSize:13,borderRadius:6,border:"0.5px solid",borderColor:a?theme.tab:border,background:a?theme.accentBg:"transparent",color:a?theme.accentText:textS,cursor:"pointer",fontWeight:a?500:400}),
    badge:(col)=>({display:"inline-block",fontSize:11,padding:"2px 8px",borderRadius:4,background:col+"22",color:col,fontWeight:500}),
    dot:(col)=>({width:11,height:11,borderRadius:"50%",background:col,display:"inline-block",marginRight:5,flexShrink:0}),
    trow:{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 0",borderBottom:`0.5px solid ${border}`},
    alert:(col)=>({background:col+"18",border:`0.5px solid ${col}44`,borderRadius:8,padding:"8px 12px",marginBottom:8,fontSize:13,color:col,display:"flex",alignItems:"center",gap:8}),
    mcrd:{flex:"1 1 110px",background:bgSec,borderRadius:8,padding:"10px 14px",minWidth:90},
  };

  const TABS=["dashboard","tarefas","cronograma","matérias","pomodoro","estatísticas"];

  return(
    <div style={{fontFamily:"sans-serif",maxWidth:820,margin:"0 auto",padding:"0 0 3rem",background:bg,minHeight:"100vh",color:textP}}>

      {/* Header */}
      <div style={{padding:"1rem 1.5rem 0",borderBottom:`0.5px solid ${border}`,marginBottom:"1.2rem"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.8rem",flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <div>
              <div style={{fontSize:20,fontWeight:500,color:textP,lineHeight:1.2}}>StudyFlow</div>
              <div style={{fontSize:12,color:textS,marginTop:3,maxWidth:420,lineHeight:1.6}}>
                Seu assistente de estudos completo — gerencie tarefas com prazos e prioridades, monte seu cronograma semanal, controle matérias, use o timer Pomodoro para manter o foco e acompanhe seu progresso. Suporte a múltiplos perfis de usuário.
              </div>
            </div>
            {exportMsg&&<span style={{fontSize:12,background:"#e6f7ed",color:"#1D9E75",padding:"3px 10px",borderRadius:20}}>{exportMsg}</span>}
          </div>

          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            {/* Temas */}
            <div style={{display:"flex",gap:5,alignItems:"center"}}>
              {Object.entries(THEMES).map(([k,th])=>(
                <div key={k} title={th.name} onClick={()=>setThemeKey(k)}
                  style={{width:18,height:18,borderRadius:"50%",background:th.tab,cursor:"pointer",
                    border:themeKey===k?"3px solid "+textP:"2px solid transparent",transition:"border .15s"}}/>
              ))}
            </div>

            {/* Usuário */}
            <div style={{position:"relative"}}>
              <button onClick={()=>setShowUserMgr(v=>!v)}
                style={{display:"flex",alignItems:"center",gap:7,padding:"5px 10px",borderRadius:20,
                  border:`0.5px solid ${border}`,background:bgSec,cursor:"pointer",color:textP,fontSize:13}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:theme.tab,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:12,fontWeight:500,color:"#fff",flexShrink:0}}>
                  {curUser?.avatar||"?"}
                </div>
                {curUser?.name}
                <span style={{fontSize:10,color:textS}}>▾</span>
              </button>

              {showUserMgr&&(
                <div style={{position:"absolute",right:0,top:"calc(100% + 6px)",zIndex:99,
                  background:bgCard,border:`0.5px solid ${border}`,borderRadius:10,
                  padding:"10px",minWidth:220,boxShadow:"0 4px 16px rgba(0,0,0,0.12)"}}>
                  <div style={{fontSize:12,color:textS,marginBottom:8,fontWeight:500}}>Perfis</div>
                  {users.map(u=>(
                    <div key={u.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 4px",
                      borderRadius:6,cursor:"pointer",background:u.id===activeUser?theme.accentBg:"transparent",
                      marginBottom:2}} onClick={()=>switchUser(u.id)}>
                      <div style={{width:28,height:28,borderRadius:"50%",background:u.id===activeUser?theme.tab:textS,
                        display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:500,color:"#fff",flexShrink:0}}>
                        {u.avatar}
                      </div>
                      <span style={{flex:1,fontSize:13,color:u.id===activeUser?theme.accentText:textP}}>{u.name}</span>
                      {users.length>1&&<button onClick={e=>{e.stopPropagation();deleteUser(u.id);}}
                        style={{background:"none",border:"none",cursor:"pointer",color:"#E24B4A",fontSize:14,padding:0}}>✕</button>}
                    </div>
                  ))}
                  <div style={{borderTop:`0.5px solid ${border}`,marginTop:8,paddingTop:8,display:"flex",gap:6}}>
                    <input value={newUserName} onChange={e=>setNewUserName(e.target.value)}
                      placeholder="Novo usuário" onKeyDown={e=>e.key==="Enter"&&addUser()}
                      style={{...c.inp,marginBottom:0,flex:1,padding:"5px 8px",fontSize:12}}/>
                    <button style={{...c.btn("primary"),padding:"5px 10px",fontSize:12}} onClick={addUser}>+</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {TABS.map(t=>(
            <button key={t} style={c.tab(tab===t)} onClick={()=>{ setTab(t); setShowUserMgr(false); }}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{padding:"0 1.5rem"}} onClick={()=>showUserMgr&&setShowUserMgr(false)}>

        {/* DASHBOARD */}
        {tab==="dashboard"&&(
          <>
            {overdue.length>0&&<div style={c.alert("#E24B4A")}><span>⚠</span><span><strong>{overdue.length} vencida{overdue.length>1?"s":""}:</strong> {overdue.map(t=>t.title).join(", ")}</span></div>}
            {dueToday.length>0&&<div style={c.alert("#BA7517")}><span>🔔</span><span><strong>Hoje: </strong>{dueToday.map(t=>t.title).join(", ")}</span></div>}
            <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
              {[{l:"Pendentes",v:pending.length,col:textP},{l:"Urgentes",v:urgent.length,col:urgent.length?"#E24B4A":textP},{l:"Vencidas",v:overdue.length,col:overdue.length?"#E24B4A":textP},{l:"Concluídas",v:done.length,col:"#1D9E75"},{l:"Matérias",v:subjects.length,col:textP}].map(m=>(
                <div key={m.l} style={c.mcrd}><div style={{fontSize:12,color:textS,marginBottom:4}}>{m.l}</div><div style={{fontSize:22,fontWeight:500,color:m.col}}>{m.v}</div></div>
              ))}
            </div>
            <div style={c.card}>
              <div style={{fontSize:14,fontWeight:500,marginBottom:10,color:textP}}>Próximas tarefas</div>
              {pending.length===0&&<div style={{fontSize:13,color:textS}}>Sem tarefas pendentes.</div>}
              {pending.slice(0,6).map(t=>{ const diff=diffDays(t.due); const flag=diff!==null&&diff<=2; return(
                <div key={t.id} style={c.trow}>
                  <input type="checkbox" style={{width:17,height:17,marginTop:2,cursor:"pointer",accentColor:theme.tab,flexShrink:0}} checked={t.done} onChange={()=>toggleTask(t.id)}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:500,color:textP}}>{t.title}</div>
                    <div style={{fontSize:12,color:textS,marginTop:2,display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                      {subMap[t.subjectId]&&<span style={{display:"flex",alignItems:"center"}}><span style={c.dot(subMap[t.subjectId].color)}/>{subMap[t.subjectId].name}</span>}
                      {t.due&&<span style={{color:flag?"#E24B4A":textS}}>{diff===0?"Hoje":diff<0?`Venceu há ${Math.abs(diff)}d`:`em ${diff}d`}</span>}
                      <span style={c.badge(PCOLOR[t.priority])}>{t.priority}</span>
                    </div>
                  </div>
                </div>
              );})}
            </div>
            <div style={c.card}>
              <div style={{fontSize:14,fontWeight:500,marginBottom:10,color:textP}}>Hoje — {DAYS[todayIdx]}</div>
              {blocks.filter(b=>b.day===todayIdx).length===0?<div style={{fontSize:13,color:textS}}>Nenhum bloco hoje.</div>
                :blocks.filter(b=>b.day===todayIdx).sort((a,b)=>a.hour-b.hour).map(b=>(
                  <div key={b.id} style={{...c.trow,alignItems:"center"}}>
                    <span style={c.dot(subMap[b.subjectId]?.color||"#aaa")}/>
                    <span style={{fontSize:13,color:textP}}>{subMap[b.subjectId]?.name||"?"} — {pad(b.hour)}:00 às {pad(b.hour+b.duration)}:00</span>
                  </div>
                ))}
            </div>
          </>
        )}

        {/* TAREFAS */}
        {tab==="tarefas"&&(
          <>
            <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
              {["Todas","Pendentes","Concluídas","Alta","Média","Baixa"].map(f=>(
                <button key={f} style={c.tab(filter===f)} onClick={()=>setFilter(f)}>{f}</button>
              ))}
              <div style={{marginLeft:"auto",display:"flex",gap:8}}>
                <button style={c.btn("primary")} onClick={()=>setShowTF(v=>!v)}>+ Nova</button>
                <button style={c.btn()} onClick={exportTasks}>↓ Exportar</button>
              </div>
            </div>
            {showTF&&(
              <div style={c.card}>
                <div style={{fontSize:13,fontWeight:500,marginBottom:8,color:textP}}>Nova tarefa</div>
                <input style={c.inp} placeholder="Título" value={newTask.title} onChange={e=>setNewTask(p=>({...p,title:e.target.value}))}/>
                <select style={c.sel} value={newTask.subjectId} onChange={e=>setNewTask(p=>({...p,subjectId:e.target.value}))}>
                  <option value="">Matéria (opcional)</option>
                  {subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input style={c.inp} type="date" value={newTask.due} onChange={e=>setNewTask(p=>({...p,due:e.target.value}))}/>
                <select style={c.sel} value={newTask.priority} onChange={e=>setNewTask(p=>({...p,priority:e.target.value}))}>
                  {PRIORITIES.map(p=><option key={p}>{p}</option>)}
                </select>
                <div style={{display:"flex",gap:8}}>
                  <button style={c.btn("primary")} onClick={addTask}>Salvar</button>
                  <button style={c.btn()} onClick={()=>setShowTF(false)}>Cancelar</button>
                </div>
              </div>
            )}
            <div style={c.card}>
              {filteredTasks.length===0&&<div style={{fontSize:13,color:textS}}>Nenhuma tarefa encontrada.</div>}
              {filteredTasks.map(t=>{ const diff=diffDays(t.due); const flag=!t.done&&diff!==null&&diff<=2; return(
                <div key={t.id} style={c.trow}>
                  <input type="checkbox" style={{width:17,height:17,marginTop:2,cursor:"pointer",accentColor:theme.tab,flexShrink:0}} checked={t.done} onChange={()=>toggleTask(t.id)}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:500,color:t.done?textS:textP,textDecoration:t.done?"line-through":"none"}}>{t.title}</div>
                    <div style={{fontSize:12,color:textS,marginTop:2,display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
                      {subMap[t.subjectId]&&<span style={{display:"flex",alignItems:"center"}}><span style={c.dot(subMap[t.subjectId].color)}/>{subMap[t.subjectId].name}</span>}
                      {t.due&&<span style={{color:flag?"#E24B4A":textS}}>{diff===0?"Hoje":diff<0?`Venceu há ${Math.abs(diff)}d`:`${formatDate(t.due)} (${diff}d)`}</span>}
                      <span style={c.badge(PCOLOR[t.priority])}>{t.priority}</span>
                    </div>
                  </div>
                  <button style={{...c.btn("danger"),padding:"4px 8px",fontSize:12}} onClick={()=>deleteTask(t.id)}>✕</button>
                </div>
              );})}
            </div>
          </>
        )}

        {/* CRONOGRAMA */}
        {tab==="cronograma"&&(
          <>
            <div style={{display:"flex",gap:8,marginBottom:12,justifyContent:"flex-end"}}>
              <button style={c.btn("primary")} onClick={()=>setShowBF(v=>!v)}>+ Novo bloco</button>
              <button style={c.btn()} onClick={exportSchedule}>↓ Exportar</button>
            </div>
            {showBF&&(
              <div style={c.card}>
                <div style={{fontSize:13,fontWeight:500,marginBottom:8,color:textP}}>Novo bloco</div>
                <select style={c.sel} value={newBlock.subjectId} onChange={e=>setNewBlock(p=>({...p,subjectId:e.target.value}))}>
                  <option value="">Selecionar matéria</option>
                  {subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select style={c.sel} value={newBlock.day} onChange={e=>setNewBlock(p=>({...p,day:+e.target.value}))}>
                  {DAYS.map((d,i)=><option key={i} value={i}>{d}</option>)}
                </select>
                <select style={c.sel} value={newBlock.hour} onChange={e=>setNewBlock(p=>({...p,hour:+e.target.value}))}>
                  {HOURS.map(h=><option key={h} value={h}>{pad(h)}:00</option>)}
                </select>
                <select style={c.sel} value={newBlock.duration} onChange={e=>setNewBlock(p=>({...p,duration:+e.target.value}))}>
                  {[1,2,3,4].map(d=><option key={d} value={d}>{d}h</option>)}
                </select>
                <div style={{display:"flex",gap:8}}>
                  <button style={c.btn("primary")} onClick={addBlock}>Salvar</button>
                  <button style={c.btn()} onClick={()=>setShowBF(false)}>Cancelar</button>
                </div>
              </div>
            )}
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:520}}>
                <thead>
                  <tr>
                    <th style={{width:40,padding:"6px 4px",color:textS,fontWeight:400,borderBottom:`0.5px solid ${border}`}}></th>
                    {DAYS.map((d,i)=>(
                      <th key={d} style={{padding:"6px 4px",fontWeight:500,textAlign:"center",borderBottom:`0.5px solid ${border}`,minWidth:68,
                        color:i===todayIdx?theme.accentText:textS,background:i===todayIdx?theme.accentBg:"transparent"}}>
                        {d}{i===todayIdx&&<span style={{fontSize:9,marginLeft:3,color:theme.tab}}> hoje</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HOURS.map(h=>(
                    <tr key={h}>
                      <td style={{padding:"2px 6px 2px 0",color:textS,fontSize:11,textAlign:"right",verticalAlign:"top",paddingTop:4}}>{pad(h)}h</td>
                      {DAYS.map((_,di)=>{
                        const blk=blocks.find(b=>b.day===di&&b.hour===h);
                        const cont=blocks.find(b=>b.day===di&&b.hour<h&&b.hour+b.duration>h);
                        if(cont) return null;
                        return(
                          <td key={di} rowSpan={blk?blk.duration:1}
                            style={{border:`0.5px solid ${border}`,padding:2,verticalAlign:"top",height:26,background:di===todayIdx?theme.accentBg+"66":"transparent"}}>
                            {blk&&subMap[blk.subjectId]&&(
                              <div style={{background:subMap[blk.subjectId].color+"22",borderLeft:`3px solid ${subMap[blk.subjectId].color}`,borderRadius:4,padding:"2px 5px",height:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",gap:4}}>
                                <span style={{color:subMap[blk.subjectId].color,fontSize:11,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{subMap[blk.subjectId].name}</span>
                                <button onClick={()=>deleteBlock(blk.id)} style={{background:"none",border:"none",cursor:"pointer",color:subMap[blk.subjectId].color,fontSize:13,padding:0,flexShrink:0}}>✕</button>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* MATÉRIAS */}
        {tab==="matérias"&&(
          <>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
              <button style={c.btn("primary")} onClick={()=>setShowSF(v=>!v)}>+ Nova matéria</button>
            </div>
            {showSF&&(
              <div style={c.card}>
                <div style={{fontSize:13,fontWeight:500,marginBottom:8,color:textP}}>Nova matéria</div>
                <input style={c.inp} placeholder="Nome" value={newSub.name} onChange={e=>setNewSub(p=>({...p,name:e.target.value}))}/>
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:12,color:textS,marginBottom:6}}>Cor</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {PALETTE.map(col=>(
                      <div key={col} onClick={()=>setNewSub(p=>({...p,color:col}))}
                        style={{width:24,height:24,borderRadius:"50%",background:col,cursor:"pointer",border:newSub.color===col?"3px solid "+textP:"2px solid transparent"}}/>
                    ))}
                  </div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button style={c.btn("primary")} onClick={addSubject}>Salvar</button>
                  <button style={c.btn()} onClick={()=>setShowSF(false)}>Cancelar</button>
                </div>
              </div>
            )}
            <div style={c.card}>
              {subjects.length===0&&<div style={{fontSize:13,color:textS}}>Nenhuma matéria.</div>}
              {subjects.map(sub=>{ const tAll=tasks.filter(t=>t.subjectId===sub.id); const tDone=tAll.filter(t=>t.done); const bHrs=blocks.filter(b=>b.subjectId===sub.id).reduce((a,b)=>a+b.duration,0); const pct=tAll.length?Math.round(tDone.length/tAll.length*100):0; return(
                <div key={sub.id} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 0",borderBottom:`0.5px solid ${border}`,flexWrap:"wrap"}}>
                  <div style={{width:14,height:14,borderRadius:"50%",background:sub.color,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:160}}>
                    <div style={{fontSize:13,fontWeight:500,color:textP,marginBottom:4}}>{sub.name}</div>
                    <div style={{fontSize:12,color:textS,marginBottom:5}}>{tAll.length} tarefa{tAll.length!==1?"s":""} · {bHrs}h · {pct}% concluído</div>
                    <div style={{height:5,background:isDark?"#444":"#eee",borderRadius:4,overflow:"hidden",maxWidth:260}}>
                      <div style={{width:pct+"%",height:"100%",background:sub.color,borderRadius:4}}/>
                    </div>
                  </div>
                  <button style={{...c.btn("danger"),padding:"4px 8px",fontSize:12}} onClick={()=>deleteSub(sub.id)}>✕</button>
                </div>
              );})}
            </div>
          </>
        )}

        {/* POMODORO */}
        {tab==="pomodoro"&&(
          <div style={c.card}>
            <div style={{fontSize:14,fontWeight:500,marginBottom:4,color:textP}}>Modo de estudo — Pomodoro</div>
            <div style={{fontSize:12,color:textS,marginBottom:4}}>25 min de foco · 5 min de pausa curta · 15 min de pausa longa</div>
            <Pomodoro theme={theme}/>
          </div>
        )}

        {/* ESTATÍSTICAS */}
        {tab==="estatísticas"&&(
          <>
            <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
              {["progresso","horas","prioridades"].map(t=>(
                <button key={t} style={c.tab(statsTab===t)} onClick={()=>setStatsTab(t)}>
                  {t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>
            {statsTab==="progresso"&&(
              <div style={c.card}>
                <div style={{fontSize:14,fontWeight:500,marginBottom:12,color:textP}}>Progresso por matéria</div>
                {subjects.length===0&&<div style={{fontSize:13,color:textS}}>Sem matérias.</div>}
                {subjects.map(sub=>{ const all=tasks.filter(t=>t.subjectId===sub.id); const dn=all.filter(t=>t.done); const pct=all.length?Math.round(dn.length/all.length*100):0; return(
                  <div key={sub.id} style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4,color:textP}}>
                      <span style={{display:"flex",alignItems:"center",gap:6}}><span style={c.dot(sub.color)}/>{sub.name}</span>
                      <span style={{color:textS}}>{dn.length}/{all.length} · {pct}%</span>
                    </div>
                    <div style={{height:8,background:isDark?"#444":"#eee",borderRadius:4,overflow:"hidden"}}>
                      <div style={{width:pct+"%",height:"100%",background:sub.color,borderRadius:4}}/>
                    </div>
                  </div>
                );})}
                <div style={{marginTop:16,paddingTop:12,borderTop:`0.5px solid ${border}`,display:"flex",gap:16,flexWrap:"wrap"}}>
                  {[{l:"Concluídas",v:done.length,col:"#1D9E75"},{l:"Pendentes",v:pending.length,col:theme.tab},{l:"Taxa geral",v:(tasks.length?Math.round(done.length/tasks.length*100):0)+"%",col:textP}].map(m=>(
                    <div key={m.l}><span style={{fontSize:12,color:textS}}>{m.l}</span><br/><span style={{fontSize:20,fontWeight:500,color:m.col}}>{m.v}</span></div>
                  ))}
                </div>
              </div>
            )}
            {statsTab==="horas"&&(
              <div style={c.card}>
                <div style={{fontSize:14,fontWeight:500,marginBottom:12,color:textP}}>Horas agendadas por matéria</div>
                {totalHours.filter(s=>s.hours>0).length===0&&<div style={{fontSize:13,color:textS}}>Nenhum bloco ainda.</div>}
                {totalHours.filter(s=>s.hours>0).map(sub=>(
                  <div key={sub.id} style={{marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4,color:textP}}>
                      <span style={{display:"flex",alignItems:"center",gap:6}}><span style={c.dot(sub.color)}/>{sub.name}</span>
                      <span style={{color:textS}}>{sub.hours}h</span>
                    </div>
                    <div style={{height:16,background:isDark?"#444":"#eee",borderRadius:4,overflow:"hidden"}}>
                      <div style={{width:Math.round(sub.hours/maxHours*100)+"%",height:"100%",background:sub.color,borderRadius:4,display:"flex",alignItems:"center",paddingLeft:6}}>
                        {sub.hours/maxHours>0.2&&<span style={{fontSize:11,color:"#fff",fontWeight:500}}>{sub.hours}h</span>}
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{marginTop:14,paddingTop:12,borderTop:`0.5px solid ${border}`,fontSize:13,color:textS}}>
                  Total: <strong style={{color:textP}}>{totalHours.reduce((a,b)=>a+b.hours,0)}h</strong>
                </div>
              </div>
            )}
            {statsTab==="prioridades"&&(
              <div style={c.card}>
                <div style={{fontSize:14,fontWeight:500,marginBottom:12,color:textP}}>Distribuição por prioridade</div>
                {PRIORITIES.map(p=>{ const all=tasks.filter(t=>t.priority===p); const dn=all.filter(t=>t.done); const pct=tasks.length?Math.round(all.length/tasks.length*100):0; return(
                  <div key={p} style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}>
                      <span style={c.badge(PCOLOR[p])}>{p}</span>
                      <span style={{color:textS}}>{all.length} tarefas · {dn.length} concluídas</span>
                    </div>
                    <div style={{height:8,background:isDark?"#444":"#eee",borderRadius:4,overflow:"hidden"}}>
                      <div style={{width:pct+"%",height:"100%",background:PCOLOR[p],borderRadius:4}}/>
                    </div>
                  </div>
                );})}
              </div>
            )}
          </>
        )}

      </div>

      {/* Footer */}
      <div style={{textAlign:"center",marginTop:"2.5rem",padding:"1rem 1.5rem",borderTop:`0.5px solid ${border}`}}>
        <span style={{fontSize:13,color:textS}}>Elaborado por </span>
        <a href="mailto:josanaroiz@gmail.com"
          style={{fontSize:13,fontWeight:500,color:theme.tab,textDecoration:"none"}}>
          Josana Roiz
        </a>
      </div>
    </div>
  );
}