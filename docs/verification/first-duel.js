async page => {
  await page.waitForFunction(()=>window.__duelInspect?.().graphicsReady);
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  const code=await page.getByRole('textbox',{name:'Room code',exact:true}).inputValue();
  await page.getByRole('button',{name:'Create room',exact:true}).click();
  await page.waitForFunction(()=>window.__duelInspect?.().connection==='connected',null,{timeout:25000});
  const context=await page.context().browser().newContext({viewport:{width:1280,height:900}});
  const peer=await context.newPage();peer.on('pageerror',e=>errors.push(e.message));
  await peer.goto(`http://127.0.0.1:5179/babylon-lite-tetris-multiplayer-clone/?mute=1&room=${code}`);
  await peer.waitForFunction(()=>window.__duelInspect?.().connection==='connected',null,{timeout:25000});
  await Promise.all([page,peer].map(p=>p.getByRole('button',{name:'Ready up',exact:true}).click()));
  await Promise.all([page,peer].map(p=>p.waitForFunction(()=>window.__duelInspect?.().server?.phase==='playing')));
  await page.keyboard.press('ArrowLeft');await page.keyboard.press('x');
  await page.waitForTimeout(180);
  await page.screenshot({path:'docs/verification/duel-aim.png'});
  const initial=await Promise.all([page,peer].map(p=>p.evaluate(()=>window.__duelInspect())));
  if(initial[0].server.own.board.length!==24||initial[1].server.opponent.board)throw Error('Private projection invalid');
  await page.keyboard.press('Space');
  const immediate=await page.evaluate(()=>window.__duelInspect());
  if(immediate.piece.stage!=='falling')throw Error('Commit prediction missing');
  await page.waitForTimeout(300);
  await page.screenshot({path:'docs/verification/duel-placed.png'});
  const placed=await page.evaluate(()=>window.__duelInspect());
  if(placed.server.own.placements<1)throw Error('Commit did not settle');
  for(let i=0;i<20;i++){
    if(await page.evaluate(()=>window.__duelInspect().server.phase!=='playing'))break;
    await page.keyboard.press('Space');await page.waitForTimeout(250);
  }
  await page.waitForFunction(()=>window.__duelInspect().server.phase==='results',null,{timeout:15000});
  const results=await Promise.all([page,peer].map(p=>p.evaluate(()=>window.__duelInspect())));
  await page.screenshot({path:'docs/verification/duel-results.png'});
  await Promise.all([page,peer].map(p=>p.getByRole('button',{name:'Request rematch',exact:true}).click()));
  await page.waitForFunction(()=>window.__duelInspect().server.phase==='playing');
  const rematch=await page.evaluate(()=>window.__duelInspect());
  if(rematch.server.epoch!==results[0].server.epoch+1||rematch.server.own.placements!==0)throw Error('Rematch failed');
  await peer.close();await context.close();
  return {code,initial:initial.map(v=>({piece:v.piece,opponent:v.server.opponent})),immediate:immediate.piece,placed:placed.server.own.placements,results:results.map(v=>({seat:v.server.own.seat,winner:v.server.winner})),rematchEpoch:rematch.server.epoch,errors};
}
