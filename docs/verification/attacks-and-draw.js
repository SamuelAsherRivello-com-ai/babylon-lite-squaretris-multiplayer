async page => {
  const url='http://127.0.0.1:5179/babylon-lite-tetris-multiplayer-clone/?mute=1';
  await page.goto(url);
  await page.waitForFunction(()=>window.__duelInspect?.().graphicsReady);
  // Leave the prior round through the actual control, never mutate game state.
  if(await page.getByRole('button',{name:'Leave / new room',exact:true}).count())await page.getByRole('button',{name:'Leave / new room',exact:true}).click();
  const code='T'+Math.random().toString(36).slice(2,5).toUpperCase();
  await page.getByRole('textbox',{name:'Room code',exact:true}).fill(code);
  await page.getByRole('button',{name:'Create room',exact:true}).click();
  await page.waitForFunction(()=>window.__duelInspect?.().connection==='connected',null,{timeout:25000});
  const context=await page.context().browser().newContext({viewport:{width:1280,height:900}}),peer=await context.newPage();
  await peer.goto(url+'&room='+code);await peer.waitForFunction(()=>window.__duelInspect?.().connection==='connected',null,{timeout:25000});
  const clients=[page,peer],read=p=>p.evaluate(()=>window.__duelInspect());
  for(const p of clients)await p.addScriptTag({path:'docs/verification/placement-plan.js'});
  await Promise.all(clients.map(p=>p.getByRole('button',{name:'Ready up',exact:true}).click()));
  await Promise.all(clients.map(p=>p.waitForFunction(()=>window.__duelInspect().server.phase==='playing')));
  const keys={left:'ArrowLeft',right:'ArrowRight',cw:'x',ccw:'z'};
  let cancellation=null,insertion=null,steps=0;
  for(;steps<140;steps++){
    const plans=await Promise.all(clients.map(p=>p.evaluate(()=>window.__testPlanPlacement(window.__duelInspect().server.own))));
    if(plans.some(p=>!p))throw Error('No legal placement');
    await Promise.all(clients.map(async(p,i)=>{for(const action of plans[i].actions)await p.keyboard.press(keys[action]);}));
    const before=await read(page),beforePeer=await read(peer);
    if(plans[0].lines>=2&&!cancellation){
      await page.keyboard.press('Space');
      await peer.waitForFunction(()=>window.__duelInspect().server.own.incoming.length>0,null,{timeout:3000});
      const warned=await read(peer);
      await peer.keyboard.press('Space');await peer.waitForFunction(n=>window.__duelInspect().server.own.placements>n,beforePeer.server.own.placements);
      const after=await read(peer);if(after.server.own.incoming.length!==0)throw Error('Cancellation failed');
      cancellation={step:steps,warning:warned.server.own.incoming,cleared:after.server.own.lines-beforePeer.server.own.lines};
    } else if(plans[0].lines>=2&&cancellation&&!insertion){
      await page.keyboard.press('Space');
      await peer.waitForFunction(()=>window.__duelInspect().server.own.incoming.length>0,null,{timeout:3000});
      // Change the receiver's legal aim to a nonclear placement. Wait for maturity.
      const nonclear=await peer.evaluate(()=>window.__testPlanPlacement({...window.__duelInspect().server.own,piece:window.__duelInspect().piece},true));
      if(!nonclear)throw Error('No nonclear placement available');
      for(const action of nonclear.actions)await peer.keyboard.press(keys[action]);
      await peer.waitForTimeout(1150);await peer.keyboard.press('Space');
      await peer.waitForFunction(n=>window.__duelInspect().server.own.placements>n,beforePeer.server.own.placements);
      const after=await read(peer);const garbage=after.server.own.board.flat().filter(v=>v==='G').length;
      if(!garbage)throw Error('Expected matured garbage');
      insertion={step:steps,garbage,lines:after.server.own.lines};
      await peer.screenshot({path:'docs/verification/garbage-inserted.png'});break;
    } else await Promise.all(clients.map(p=>p.keyboard.press('Space')));
    await Promise.all(clients.map((p,i)=>p.waitForFunction(n=>window.__duelInspect().server.own.placements>n||window.__duelInspect().server.phase!=='playing',i?beforePeer.server.own.placements:before.server.own.placements)));
    if((await read(page)).server.phase!=='playing')throw Error('Match ended before attack verification');
  }
  if(!cancellation||!insertion)throw Error('Attack cases not reached');
  // Finish this legal round, request a fresh epoch, then both idle for auto-release draw.
  for(let i=0;i<25;i++){
    if((await read(page)).server.phase!=='playing')break;
    await page.keyboard.press('Space');await page.waitForTimeout(240);
  }
  await page.waitForFunction(()=>window.__duelInspect().server.phase==='results');
  await Promise.all(clients.map(p=>p.getByRole('button',{name:'Request rematch',exact:true}).click()));
  await page.waitForFunction(()=>window.__duelInspect().server.phase==='playing');
  await page.waitForFunction(()=>window.__duelInspect().server.phase==='results',null,{timeout:85000});
  const draw=await Promise.all(clients.map(read));
  if(draw.some(v=>v.server.winner!==null))throw Error('Expected same tick auto-release draw');
  await page.screenshot({path:'docs/verification/auto-draw.png'});
  await context.close();return {steps,cancellation,insertion,draw:draw.map(v=>({winner:v.server.winner,placements:v.server.own.placements,epoch:v.server.epoch}))};
}
