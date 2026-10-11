async page => {
  const browser=page.context().browser(),context=await browser.newContext({viewport:{width:1280,height:900}}),other=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await Promise.all([context,other].map(c=>c.addInitScript({path:'docs/verification/websocket-latency.js'})));
  const a=await context.newPage(),b=await other.newPage(),clients=[a,b],errors=[];
  for(const p of clients)p.on('pageerror',e=>errors.push(e.message));
  const base='http://127.0.0.1:5179/babylon-lite-tetris-multiplayer-clone/?mute=1';
  await a.goto(base);await a.waitForFunction(()=>window.__duelInspect?.().graphicsReady);
  const code=await a.getByRole('textbox',{name:'Room code',exact:true}).inputValue();
  await a.getByRole('button',{name:'Create room',exact:true}).click();await a.waitForFunction(()=>window.__duelInspect?.().connection==='connected',null,{timeout:25000});
  await b.goto(base+'&room='+code);await b.waitForFunction(()=>window.__duelInspect?.().connection==='connected',null,{timeout:25000});
  await Promise.all(clients.map(p=>p.getByRole('button',{name:'Ready up',exact:true}).click()));
  await a.waitForFunction(()=>window.__duelInspect().server.phase==='playing');
  const before=await a.evaluate(()=>window.__duelInspect());
  await a.keyboard.press('ArrowLeft');
  const immediate=await a.evaluate(()=>window.__duelInspect());
  if(immediate.piece.x!==before.piece.x-1)throw Error('Local aim did not predict under latency');
  await a.waitForFunction(x=>window.__duelInspect().server.own.piece.x===x,immediate.piece.x);
  await a.keyboard.press('Space');await a.waitForFunction(()=>window.__duelInspect().server.own.placements===1);
  await a.waitForTimeout(400);if((await a.evaluate(()=>window.__duelInspect().server.own.placements))!==1)throw Error('Duplicate placement');
  // Concurrent touch delivered through the real browser input pipeline.
  const cdp=await other.newCDPSession(b);
  const left=await b.getByRole('button',{name:'Move left',exact:true}).boundingBox(),rotate=await b.getByRole('button',{name:'Rotate clockwise',exact:true}).boundingBox();
  const touch=(id,box)=>({id,x:box.x+box.width/2,y:box.y+box.height/2});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touch(1,left)]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touch(1,left),touch(2,rotate)]});
  await b.waitForTimeout(180);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
  const canceled=await b.locator('[data-held=true]').count();if(canceled)throw Error('Stuck touch input');
  await b.screenshot({path:'docs/verification/mobile-touch.png'});
  // Settings neutralize input but the five-second auto-release keeps running.
  const settingsBefore=await a.evaluate(()=>window.__duelInspect().server.own.placements);
  await a.getByRole('button',{name:'Settings · C',exact:true}).click();
  await a.waitForFunction(n=>window.__duelInspect().server.own.placements>n,settingsBefore,{timeout:7000});
  await a.getByRole('button',{name:'Close dialog',exact:true}).click();
  // Reload uses the SDK's existing rotating session credential.
  const seat=await b.evaluate(()=>({seat:window.__duelInspect().server.own.seat,epoch:window.__duelInspect().server.epoch,placements:window.__duelInspect().server.own.placements}));
  await b.reload();await b.waitForFunction(()=>window.__duelInspect?.().connection==='connected',null,{timeout:12000});
  const recovered=await b.evaluate(()=>window.__duelInspect());
  if(recovered.server.own.seat!==seat.seat||recovered.server.epoch!==seat.epoch||recovered.server.own.placements<seat.placements)throw Error('Refresh recovery lost seat');
  await other.setOffline(true);
  await b.evaluate(()=>globalThis.__testRelaySockets.find(socket=>socket.url.includes('rmc-colyseus')&&socket.readyState===1)?.close(4010,'Test transient interruption'));
  await a.waitForFunction(()=>window.__duelInspect().server.paused===true,null,{timeout:6000});
  const pausedTime=await a.evaluate(()=>window.__duelInspect().server.serverTime);
  await a.waitForTimeout(350);
  if((await a.evaluate(()=>window.__duelInspect().server.serverTime))!==pausedTime)throw Error('Server clock continued while peer offline');
  await other.setOffline(false);
  await b.waitForFunction(()=>window.__duelInspect().connection==='connected',null,{timeout:12000});
  const stats=await Promise.all(clients.map(p=>p.evaluate(()=>window.__relayLatencyStats)));
  const tokensInUrl=clients.some(p=>/token|credential/i.test(p.url()));if(tokensInUrl)throw Error('Credential in URL');
  await Promise.all([context.close(),other.close()]);
  return {code,immediate:{predicted:immediate.piece.x,authoritative:immediate.server.own.piece.x},touch:{canceled},settingsDeadlineContinued:true,interruptionPausedServerClock:true,recovered:{sameSeat:true,epoch:recovered.server.epoch},stats,errors};
}
