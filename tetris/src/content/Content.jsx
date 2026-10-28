import { useEffect, useRef, useState } from 'react';
import { MultiplayerClient, suggestRoomCode, readRoomCode, buildRoomLink } from '@rmc/multiplayer-client';
import { cells, landing, SHAPES } from '@rmc/multiplayer-client/tetris-duel';
import { DuelCanvas } from './DuelCanvas.jsx';
import { DuelPrediction } from './duel-state.js';
import { SoloGame } from './solo-state.js';
import { initialGameMode } from './mode-flow.js';
import { DuelControls, KEY_ACTIONS } from './duel-controls.js';
import { DuelAudio } from './duel-audio.js';
import { useContentShell } from '../shared/ContentShellContext.jsx';

const endpoint = import.meta.env.VITE_MULTIPLAYER_SERVER_URL || 'https://rmc-colyseus-multiplayer-server.vercel.app';
const buttons = [['left', '←', 'Move left'], ['ccw', '↶', 'Rotate counterclockwise'], ['commit', 'DROP', 'Release piece'], ['cw', '↷', 'Rotate clockwise'], ['right', '→', 'Move right']];

function QueuePreview({ queue = [] }) {
  return <div className="queue_preview" aria-label="Next five pieces">
    {queue.slice(0, 5).map((shape, index) => <div className="queue_piece" key={`${shape}-${index}`} aria-label={`Next piece ${index + 1}: ${shape}`}>
      <span className="queue_piece_name">{shape}</span>
      <span className="queue_piece_cells" aria-hidden="true">
        {cells(shape).map(([x, y], cell) => <i key={cell} style={{ gridColumn: x + 1, gridRow: y + 1 }} data-color={SHAPES.indexOf(shape)} />)}
      </span>
    </div>)}
  </div>;
}

export function Content() {
  const { paused, preferences } = useContentShell();
  const [graphicsReady, setGraphicsReady] = useState(false);
  const [mode, setMode] = useState(() => initialGameMode(readRoomCode()));
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [code, setCode] = useState(() => readRoomCode() || suggestRoomCode());
  const [share, setShare] = useState('');
  const [held, setHeld] = useState([]);
  const [clock, setClock] = useState(0);
  const [flash, setFlash] = useState(false);
  const model = useRef(new DuelPrediction());
  const client = useRef(null);
  const controls = useRef(null);
  const audio = useRef(null);
  const blocked = useRef(true);
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const [, refresh] = useState(0);
  const sound = () => audio.current ??= new DuelAudio();
  const actionRef = useRef(null);

  actionRef.current = (action) => {
    if (blocked.current) return;
    const before = model.current.read().piece;
    const result = model.current.command(action);
    if (!result) return;
    if (modeRef.current === 'multiplayer') client.current?.send('input', result);
    const after = model.current.read().piece;
    if (action === 'commit') sound().play('release');
    else if (before?.x !== after?.x || before?.rotation !== after?.rotation) sound().play(action === 'left' || action === 'right' ? 'move' : 'rotate');
    refresh((value) => value + 1);
  };

  controls.current ??= new DuelControls((action) => actionRef.current(action), setHeld);
  const visible = model.current.read();
  const server = mode === 'multiplayer' ? visible.server : null;
  const own = mode === 'solo' ? visible.own : server?.own;
  const phase = mode === 'solo' ? visible.phase : server?.phase;
  const active = phase === 'playing' && (mode === 'solo' || mode === 'multiplayer');
  blocked.current = paused || !graphicsReady || !active || (mode === 'multiplayer' && (status !== 'connected' || server?.paused));

  useEffect(() => { sound().mute(preferences.muted === true); }, [preferences.muted]);
  useEffect(() => {
    if (blocked.current) controls.current.reset();
  }, [paused, graphicsReady, status, mode, phase, server?.paused]);

  const selectSolo = () => {
    void sound().unlock();
    client.current?.disconnect();
    client.current = null;
    model.current = new SoloGame();
    setStatus('idle'); setError(''); setShare(''); setMode('solo'); refresh((value) => value + 1);
    const url = new URL(location.href); url.searchParams.delete('room'); history.replaceState(null, '', url);
  };
  const selectMultiplayer = () => { setError(''); setMode('multiplayer'); };
  const connect = (create = false) => {
    if (!/^[A-Z0-9]{4}$/.test(code)) { setError('Enter four letters or numbers.'); return; }
    void sound().unlock();
    client.current?.disconnect(); model.current = new DuelPrediction(); setError(''); setShare(''); setMode('multiplayer');
    const connection = new MultiplayerClient(endpoint, 'tetris-duel', { code, create }); client.current = connection;
    let last = null;
    connection.subscribe((state) => {
      if (client.current !== connection) return;
      setStatus(state.status); setError(state.error || '');
      model.current.connected = state.status === 'connected';
      if (state.gameState && model.current.receive(state.gameState)) {
        const current = model.current.server;
        if (last && last.epoch === current.epoch) {
          if (current.own.lines > last.own.lines) { sound().play('clear'); setFlash(true); setTimeout(() => setFlash(false), 180); }
          if (current.own.incoming.some((packet) => !last.own.incoming.some((previous) => previous.id === packet.id))) sound().play('warning');
          if (current.own.piece?.stage === 'falling' && last.own.piece?.stage !== 'falling' && model.current.commitAnchor?.id !== current.own.piece.id) sound().play('release');
          if (current.phase === 'results' && last.phase !== 'results') sound().play('result');
        }
        last = current; refresh((value) => value + 1);
      }
      if (state.status === 'connected') {
        setShare(buildRoomLink(state.code));
        const url = new URL(location.href); url.searchParams.set('room', state.code); history.replaceState(null, '', url);
      }
    });
    void connection.connect().catch((failure) => { if (client.current === connection) setError(failure.message || 'Connection failed. Create a new room.'); });
  };

  const autoJoined = useRef(false);
  useEffect(() => {
    if (!graphicsReady || mode !== 'multiplayer' || autoJoined.current || !readRoomCode()) return;
    let cancelled = false;
    queueMicrotask(() => { if (!cancelled) { autoJoined.current = true; connect(false); } });
    return () => { cancelled = true; };
  }, [graphicsReady, mode]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (mode === 'solo') {
        const before = model.current.read();
        model.current.advance(20);
        const after = model.current.read();
        if (after.own.lines > before.own.lines) { sound().play('clear'); setFlash(true); setTimeout(() => setFlash(false), 180); }
        if (after.phase === 'results' && before.phase !== 'results') sound().play('result');
      }
      setClock((value) => value + 1);
    }, 20);
    const down = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.target.closest?.('input,textarea,select,[contenteditable=true],[role=dialog]')) return;
      const action = KEY_ACTIONS[event.key] ?? KEY_ACTIONS[event.key.toLowerCase()];
      if (!action) return;
      event.preventDefault();
      if (!event.repeat && !blocked.current) { void sound().unlock(); controls.current.press('key:' + event.code, action); }
    };
    const up = (event) => controls.current.release('key:' + event.code);
    const reset = () => controls.current.reset();
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', reset);
    document.addEventListener('visibilitychange', reset);
    return () => {
      clearInterval(timer); window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', reset); document.removeEventListener('visibilitychange', reset); controls.current.reset();
    };
  }, [mode]);

  useEffect(() => () => { client.current?.disconnect(); audio.current?.dispose(); }, []);
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    window.__duelInspect = () => structuredClone({ ...model.current.read(), connection: client.current?.state?.status, graphicsReady, mode });
    return () => { delete window.__duelInspect; };
  }, [graphicsReady, mode]);

  const timer = visible.piece?.stage === 'aiming' ? Math.max(0, (visible.piece.deadline - visible.time) / 1000).toFixed(1) : '↓';
  const incoming = own?.incoming?.reduce((sum, packet) => sum + packet.rows, 0) || 0;
  const warning = incoming ? (own.incoming[0].eligibleAt <= visible.time ? 'NEXT DROP' : Math.max(0, (own.incoming[0].eligibleAt - visible.time) / 1000).toFixed(1) + ' s') : '';
  const result = server?.winner === null ? 'DRAW' : server?.winner === own?.seat ? 'YOU WIN' : 'YOU LOSE';
  const leaveMultiplayer = () => {
    client.current?.disconnect(); client.current = null; model.current = new DuelPrediction(); setStatus('idle'); setError(''); setShare(''); setMode('multiplayer');
    const url = new URL(location.href); url.searchParams.delete('room'); history.replaceState(null, '', url);
  };
  const backToModes = () => {
    client.current?.disconnect(); client.current = null; model.current = new DuelPrediction(); setStatus('idle'); setError(''); setShare(''); setMode('choice');
    const url = new URL(location.href); url.searchParams.delete('room'); history.replaceState(null, '', url);
  };
  const leaveSolo = () => { model.current = new SoloGame(); setMode('choice'); refresh((value) => value + 1); };
  const buttonRow = <div className="duel_controls">{buttons.map(([action, label, title]) => <button key={action} type="button" aria-label={title} data-action={action} data-held={held.includes(action)} disabled={blocked.current}
    onPointerDown={(event) => { event.preventDefault(); if (blocked.current) return; event.currentTarget.setPointerCapture(event.pointerId); void sound().unlock(); controls.current.press('pointer:' + event.pointerId, action); }}
    onPointerUp={(event) => controls.current.release('pointer:' + event.pointerId)} onPointerCancel={(event) => controls.current.release('pointer:' + event.pointerId)} onLostPointerCapture={(event) => controls.current.release('pointer:' + event.pointerId)}
    onClick={(event) => { if (event.detail === 0) actionRef.current(action); }}>{label}</button>)}</div>;

  return <div className="duel" data-mode={mode} data-phase={phase || 'start'} data-effects={preferences.reduced ? 'reduced' : 'normal'} data-flash={flash && !preferences.reduced}>
    <div className="board_stage">
      <DuelCanvas readModel={() => model.current.read()} onReady={setGraphicsReady} />
      <div className="opponent_label">{mode === 'solo' ? 'SOLO RUN' : `OPPONENT AIM ${server?.opponent && !server.opponent.connected ? '· OFFLINE' : ''}`}</div>
      <div className="own_label">YOUR AIM <span>{active ? (visible.piece?.stage === 'aiming' ? timer + ' s' : 'RELEASED') : '5 s to release'}</span></div>
      <div className="board_label">YOUR WELL <span>{mode === 'multiplayer' ? `${code} · ${status}` : 'LOCAL'}</span></div>
      {active && visible.piece?.stage === 'aiming' && own && landing(own.board, visible.piece) === null && <div className="blocked_entry" role="status">ENTRY BLOCKED · MOVE NOW</div>}
      {mode === 'solo' && phase === 'results' && <div className="solo_board_result" role="status">RUN OVER</div>}
      {mode === 'solo' && active && <button className="mobile_back" onClick={leaveSolo}>Modes</button>}
      {active && buttonRow}
    </div>
    <aside className="game_hud" aria-label="Game HUD">
      {mode === 'solo' && phase === 'playing' && <>
        <h1>Squaretris</h1>
        <div className="hud_stats"><div><span>LINES</span><strong>{own?.lines || 0}</strong></div><div><span>PIECES</span><strong>{own?.placements || 0}</strong></div><div><span>TIME</span><strong>{Math.floor(clock * 20 / 1000)}s</strong></div></div>
        <div className="next_heading">NEXT</div><QueuePreview queue={own?.queue} />
        <p className="hud_help">← → / A D move. X / ↑ rotate. Z turn back. Space releases the piece.</p>
        <button className="hud_secondary" onClick={leaveSolo}>Back to modes</button>
        {buttonRow}
      </>}
      {mode === 'solo' && phase === 'results' && <section className="hud_panel">
        <h2>Run over</h2><p>Top out · {own?.lines || 0} lines · {own?.placements || 0} pieces</p>
        <button onClick={selectSolo}>Play again</button><button className="hud_secondary" onClick={leaveSolo}>Back to modes</button>
      </section>}
      {mode === 'choice' && <section className="hud_panel mode_panel" aria-label="Choose game mode">
        <h1>Squaretris</h1><p>Aim. Release. Clear rows.</p>
        <button onClick={selectSolo}>Single Player</button><button className="hud_secondary" onClick={selectMultiplayer}>Multiplayer</button>
      </section>}
      {mode === 'multiplayer' && active && <>
        <h2>Room {code}</h2>
        <div className="hud_stats"><div><span>LINES</span><strong>{own?.lines || 0}</strong></div><div><span>INCOMING</span><strong className={incoming ? 'danger' : ''}>{incoming ? `+${incoming}` : '—'}</strong></div><div><span>RIVAL HEIGHT</span><strong>{server?.opponent?.height || 0}</strong></div></div>
        {warning && <div className="incoming_warning">{warning}</div>}
        <div className="next_heading">NEXT</div><QueuePreview queue={own?.queue} />
        <div className="connection_status">{status}</div>
        {buttonRow}
      </>}
      {mode === 'multiplayer' && !active && <section className="hud_panel room_panel" aria-label="Multiplayer room">
        {!server ? <><h2>Multiplayer</h2><p>Create a room or join a friend's private board.</p>
          <label>ROOM CODE<input aria-label="Room code" value={code} maxLength={4} autoCapitalize="characters" spellCheck="false" onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} /></label>
          <div className="room_actions"><button onClick={() => connect(true)} disabled={['connecting', 'reconnecting'].includes(status)}>Create room</button><button onClick={() => connect(false)} disabled={['connecting', 'reconnecting'].includes(status)}>Join room</button></div>
          <p className="hud_help">← → / A D move. X / ↑ rotate. Z turn back. Space releases the piece.</p>
        </> : server.paused || status !== 'connected' ? <><h2>{['error', 'offline', 'full'].includes(status) ? 'Connection ended' : 'Reconnecting…'}</h2><p>Both clocks pause after the server detects a disconnect. Each seat has 15 seconds of recovery per match.</p><button onClick={() => location.reload()}>Reload to recover seat</button></> :
          phase === 'countdown' ? <><h2 className="countdown">{Math.max(1, Math.ceil((server.startsAt - visible.time) / 1000))}</h2><p>Both players ready. Same pieces, separate boards.</p></> :
            phase === 'lobby' ? <><h2>{server.opponent ? 'Your rival is here' : 'Invite a friend'}</h2><p>{server.opponent ? `${own.name} vs ${server.opponent.name}` : 'Share this link. Two players, two private boards.'}</p>{share && <input aria-label="Share room link" readOnly value={share} onFocus={(event) => event.target.select()} />}<button onClick={() => { void sound().unlock(); client.current.send('ready', { ready: !own.ready }); }}>{own.ready ? 'Ready · undo' : 'Ready up'}</button><p>{server.opponent?.ready ? 'Rival ready' : 'Waiting for rival to ready up'}</p></> :
              <><h2>{phase === 'aborted' ? 'Room expired' : result}</h2><p>{own.lines} lines · {own.placements} pieces</p><button onClick={() => client.current.send('rematch', { ready: !own.ready })}>{own.ready ? 'Rematch requested · undo' : 'Request rematch'}</button><p>Both players must agree.</p></>}
        {error && <p role="alert" className="error">{String(error)}<br />If the free relay expired, create a new room.</p>}
        <div className="connection_status" role="status">{status}</div>
        <button className="hud_secondary" onClick={leaveMultiplayer}>Leave / new room</button>
        <button className="hud_secondary" onClick={backToModes}>Back to modes</button>
      </section>}
    </aside>
  </div>;
}
