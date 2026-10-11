import {useEffect,useRef,useState} from 'react';
import {MultiplayerClient,suggestRoomCode,readRoomCode,buildRoomLink} from '@rmc/multiplayer-client';
import {landing} from '@rmc/multiplayer-client/tetris-duel';
import {DuelCanvas} from './DuelCanvas.jsx';
import {DuelPrediction} from './duel-state.js';
import {DuelControls,KEY_ACTIONS} from './duel-controls.js';
import {DuelAudio} from './duel-audio.js';
import {useContentShell} from '../shared/ContentShellContext.jsx';

const endpoint=import.meta.env.VITE_MULTIPLAYER_SERVER_URL||'https://rmc-colyseus-multiplayer-server.vercel.app';
const buttons=[['left','←','Move left'],['ccw','↶','Rotate counterclockwise'],['commit','DROP','Release piece'],['cw','↷','Rotate clockwise'],['right','→','Move right']];
export function Content(){
  const {paused,preferences}=useContentShell();
  const [graphicsReady,setGraphicsReady]=useState(false),[status,setStatus]=useState('idle'),[error,setError]=useState('');
  const [code,setCode]=useState(()=>readRoomCode()||suggestRoomCode());
  const [share,setShare]=useState(''),[held,setHeld]=useState([]),[,setClock]=useState(0),[flash,setFlash]=useState(false);
  const model=useRef(new DuelPrediction()),client=useRef(null),controls=useRef(null),audio=useRef(null),blocked=useRef(true);
  const [,refresh]=useState(0);
  const sound=()=>audio.current??=(new DuelAudio());
  const actionRef=useRef(null);
  actionRef.current=action=>{
    if(blocked.current)return;
    const before=model.current.read().piece,input=model.current.command(action);
    if(!input)return;
    client.current?.send('input',input);
    const after=model.current.read().piece;
    if(action==='commit')sound().play('release');
    else if(before.x!==after.x||before.rotation!==after.rotation)sound().play(action==='left'||action==='right'?'move':'rotate');
    refresh(v=>v+1);
  };
  controls.current??=new DuelControls(action=>actionRef.current(action),setHeld);
  const visible=model.current.read(),server=visible.server,own=server?.own;
  blocked.current=paused||!graphicsReady||status!=='connected'||server?.phase!=='playing'||server.paused;
  useEffect(()=>{sound().mute(preferences.muted===true);},[preferences.muted]);
  useEffect(()=>{if(blocked.current)controls.current.reset();},[paused,graphicsReady,status,server?.phase,server?.paused]);

  const connect=(create=false)=>{
    if(!/^[A-Z0-9]{4}$/.test(code)){setError('Enter four letters or numbers.');return;}
    void sound().unlock();
    client.current?.disconnect();model.current=new DuelPrediction();setError('');setShare('');
    const connection=new MultiplayerClient(endpoint,'tetris-duel',{code,create});client.current=connection;
    let last=null;
    connection.subscribe(state=>{
      if(client.current!==connection)return;
      setStatus(state.status);setError(state.error||'');
      model.current.connected=state.status==='connected';
      if(state.gameState&&model.current.receive(state.gameState)){
        const current=model.current.server;
        if(last&&last.epoch===current.epoch){
          if(current.own.lines>last.own.lines){sound().play('clear');setFlash(true);setTimeout(()=>setFlash(false),180);}
          if(current.own.incoming.some(packet=>!last.own.incoming.some(p=>p.id===packet.id)))sound().play('warning');
          if(current.own.piece?.stage==='falling'&&last.own.piece?.stage!=='falling'&&model.current.commitAnchor?.id!==current.own.piece.id)sound().play('release');
          if(current.phase==='results'&&last.phase!=='results')sound().play('result');
        }
        last=current;refresh(v=>v+1);
      }
      if(state.status==='connected'){
        setShare(buildRoomLink(state.code));
        const url=new URL(location.href);url.searchParams.set('room',state.code);history.replaceState(null,'',url);
      }
    });
    void connection.connect().catch(failure=>{if(client.current===connection)setError(failure.message||'Connection failed. Create a new room.');});
  };
  const autoJoined=useRef(false),connectRef=useRef(connect);connectRef.current=connect;
  useEffect(()=>{
    if(!graphicsReady||autoJoined.current||!readRoomCode())return;
    let cancelled=false;queueMicrotask(()=>{if(!cancelled){autoJoined.current=true;connectRef.current(false);}});return()=>{cancelled=true;};
  },[graphicsReady]);
  useEffect(()=>{
    const timer=setInterval(()=>setClock(performance.now()),50);
    const down=e=>{
      if(e.ctrlKey||e.metaKey||e.altKey||e.target.closest?.('input,textarea,select,[contenteditable=true],[role=dialog]'))return;
      const action=KEY_ACTIONS[e.key]??KEY_ACTIONS[e.key.toLowerCase()];if(!action)return;
      e.preventDefault();if(!e.repeat&&!blocked.current){void sound().unlock();controls.current.press('key:'+e.code,action);}
    };
    const up=e=>controls.current.release('key:'+e.code),reset=()=>controls.current.reset();
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',reset);
    document.addEventListener('visibilitychange',reset);
    return()=>{clearInterval(timer);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',reset);document.removeEventListener('visibilitychange',reset);controls.current.reset();};
  },[]);
  useEffect(()=>()=>{client.current?.disconnect();audio.current?.dispose();},[]);
  useEffect(()=>{
    if(!import.meta.env.DEV)return;
    window.__duelInspect=()=>structuredClone({...model.current.read(),connection:client.current?.state?.status,graphicsReady});
    return()=>{delete window.__duelInspect;};
  },[graphicsReady]);
  const phase=server?.phase;
  const active=phase==='playing';
  const timer=visible.piece?.stage==='aiming'?Math.max(0,(visible.piece.deadline-visible.time)/1000).toFixed(1):'↓';
  const incoming=own?.incoming?.reduce((sum,p)=>sum+p.rows,0)||0;
  const warning=incoming?(own.incoming[0].eligibleAt<=visible.time?'NEXT DROP':Math.max(0,(own.incoming[0].eligibleAt-visible.time)/1000).toFixed(1)+' s'):'';
  const result=server?.winner===null?'DRAW':server?.winner===own?.seat?'YOU WIN':'YOU LOSE';
  const leave=()=>{client.current?.disconnect();client.current=null;model.current=new DuelPrediction();setStatus('idle');setError('');setShare('');const url=new URL(location.href);url.searchParams.delete('room');history.replaceState(null,'',url);};
  return <div className="duel" data-phase={phase||'start'} data-effects={preferences.reduced?'reduced':'normal'} data-flash={flash&&!preferences.reduced}>
    <DuelCanvas readModel={()=>model.current.read()} onReady={setGraphicsReady}/>
    <div className="duel_overlay">
      <div className="opponent_label">OPPONENT AIM {server?.opponent&&!server.opponent.connected?'· OFFLINE':''}</div>
      <div className="own_label">YOUR AIM <span>{active?(visible.piece?.stage==='aiming'?timer+' s':'RELEASED'):'5 s to release'}</span></div>
      <div className="board_label">YOUR WELL <span>{code} · {status}</span></div>
      <div className="next_label">NEXT</div>
      <div className="side_status"><span>LINES</span><strong>{own?.lines||0}</strong><span>INCOMING</span><strong className={incoming?'danger':''}>{incoming?`+${incoming}`:'—'}</strong>{warning&&<span className="danger">{warning}</span>}<span>RIVAL</span><strong>{server?.opponent?.height||0}</strong><span>ROWS HIGH</span></div>
      {active&&visible.piece?.stage==='aiming'&&landing(own.board,visible.piece)===null&&<div className="blocked_entry" role="status">ENTRY BLOCKED · MOVE NOW</div>}
      <div className="duel_controls">{buttons.map(([action,label,title])=><button key={action} type="button" aria-label={title} data-action={action} data-held={held.includes(action)} disabled={blocked.current}
        onPointerDown={e=>{e.preventDefault();if(blocked.current)return;e.currentTarget.setPointerCapture(e.pointerId);void sound().unlock();controls.current.press('pointer:'+e.pointerId,action);}}
        onPointerUp={e=>controls.current.release('pointer:'+e.pointerId)} onPointerCancel={e=>controls.current.release('pointer:'+e.pointerId)} onLostPointerCapture={e=>controls.current.release('pointer:'+e.pointerId)}
        onClick={e=>{if(e.detail===0)actionRef.current(action);}}>{label}</button>)}</div>
      {graphicsReady&&(!active||server?.paused||status!=='connected')&&<section className="room_panel" aria-label="Multiplayer room">
        {!server?<><div className="eyebrow">PRIVATE BOARD · SHARED PRESSURE</div><h1>Tetris<br/>Multiplayer Clone</h1><p>Aim. Release. Clear rows.<br/>Outlast one friend.</p>
          <label>ROOM CODE<input aria-label="Room code" value={code} maxLength={4} autoCapitalize="characters" spellCheck="false" onChange={e=>setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,''))}/></label>
          <div className="room_actions"><button onClick={()=>connect(true)} disabled={['connecting','reconnecting'].includes(status)}>Create room</button><button onClick={()=>connect(false)} disabled={['connecting','reconnecting'].includes(status)}>Join room</button></div>
          <p className="instructions">← → / A D move · X / ↑ rotate<br/>Z turn back · Space release<br/>Or use the five buttons below.</p></>:
          server.paused||status!=='connected'?<><h2>{['error','offline','full'].includes(status)?'Connection ended':'Reconnecting…'}</h2><p>Both clocks pause after the server detects a disconnect. Each seat has 15 seconds of recovery per match.</p><button onClick={()=>location.reload()}>Reload to recover seat</button></>:
          phase==='countdown'?<><div className="eyebrow">BOTH PLAYERS READY</div><h2 className="countdown">{Math.max(1,Math.ceil((server.startsAt-visible.time)/1000))}</h2><p>Same pieces. Separate boards.</p></>:
          phase==='lobby'?<><div className="eyebrow">ROOM {code}</div><h2>{server.opponent?'Your rival is here':'Invite a friend'}</h2><p>{server.opponent?`${own.name} vs ${server.opponent.name}`:'Share this link. Two players, two private boards.'}</p>{share&&<input aria-label="Share room link" readOnly value={share} onFocus={e=>e.target.select()}/>}<button onClick={()=>{void sound().unlock();client.current.send('ready',{ready:!own.ready});}}>{own.ready?'Ready · undo':'Ready up'}</button><p>{server.opponent?.ready?'Rival ready':'Waiting for rival to ready up'}</p></>:
          <><div className="eyebrow">{phase==='aborted'?'ROOM ENDED':'MATCH COMPLETE'}</div><h2>{phase==='aborted'?'Room expired':result}</h2><p>{own.lines} lines · {own.placements} pieces</p><button onClick={()=>client.current.send('rematch',{ready:!own.ready})}>{own.ready?'Rematch requested · undo':'Request rematch'}</button><p>Both players must agree.</p></>}
        {error&&<p role="alert" className="error">{String(error)}<br/>If the free relay expired, create a new room.</p>}
        <div className="connection_status" role="status">{status}</div>
        {(server||status!=='idle')&&<button className="text_button" onClick={leave}>Leave / new room</button>}
      </section>}
    </div>
  </div>;
}
