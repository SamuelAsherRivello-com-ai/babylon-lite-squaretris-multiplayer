async page => {
  const url='https://samuelasherrivello.github.io/babylon-lite-tetris-multiplayer-clone/?mute=1';
  const browser=page.context().browser(),aContext=await browser.newContext({viewport:{width:1280,height:1080}}),bContext=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  for(const context of [aContext,bContext])await context.addInitScript({path:'docs/verification/websocket-latency.js'});
  const a=await aContext.newPage(),b=await bContext.newPage(),clients=[a,b],errors=[],failedAssets=[];
  for(const p of clients){p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)failedAssets.push({url:r.url(),status:r.status()});});}
  await a.goto(url);await a.getByRole('button',{name:'Create room',exact:true}).waitFor({timeout:30000});
  const version=await a.locator('#version').innerText();if(version!=='v0.0.1')throw Error('Wrong public version: '+version);
  const devHook=await a.evaluate(()=>typeof window.__duelInspect);if(devHook!=='undefined')throw Error('Development state hook shipped');
  const code=await a.getByRole('textbox',{name:'Room code',exact:true}).inputValue();
  await a.getByRole('button',{name:'Create room',exact:true}).click();await a.getByRole('button',{name:'Ready up',exact:true}).waitFor({timeout:25000});
  await b.goto(url+'&room='+code);await b.getByRole('button',{name:'Ready up',exact:true}).waitFor({timeout:25000});
  await Promise.all(clients.map(p=>p.getByRole('button',{name:'Ready up',exact:true}).click()));
  await Promise.all(clients.map(p=>p.locator('.duel[data-phase=playing]').waitFor()));
  await a.keyboard.press('ArrowLeft');await a.keyboard.press('x');await a.waitForTimeout(400);
  await a.screenshot({path:'docs/verification/public-duel.png'});
  for(let i=0;i<25;i++){
    if(await a.locator('.duel[data-phase=results]').count())break;
    await a.keyboard.press('Space');await a.waitForTimeout(400);
  }
  await Promise.all(clients.map(p=>p.locator('.duel[data-phase=results]').waitFor({timeout:15000})));
  const results=await Promise.all(clients.map(p=>p.locator('.room_panel h2').innerText()));
  if(!results.includes('YOU WIN')||!results.includes('YOU LOSE'))throw Error('Public outcome disagreement: '+results);
  await a.screenshot({path:'docs/verification/public-result.png'});
  await a.getByRole('button',{name:'Request rematch',exact:true}).click();await a.waitForTimeout(250);
  if(!await a.locator('.duel[data-phase=results]').count())throw Error('Unilateral rematch');
  await b.getByRole('button',{name:'Request rematch',exact:true}).click();
  await Promise.all(clients.map(p=>p.locator('.duel[data-phase=playing]').waitFor()));
  await b.reload();await b.locator('.duel[data-phase=playing]').waitFor({timeout:12000});
  if(!await b.getByRole('button',{name:'Release piece',exact:true}).isEnabled())throw Error('Public refresh recovery not playable');
  const shareUrl=b.url();if(/token|credential/i.test(shareUrl))throw Error('Public credential in URL');
  await b.screenshot({path:'docs/verification/public-mobile.png'});
  const adapter=await a.evaluate(async()=>{const adapter=await navigator.gpu.requestAdapter();return {available:!!adapter,isFallback:adapter?.isFallbackAdapter??adapter?.info?.isFallbackAdapter??null};});
  const versionFile=await (await a.request.get(url.split('?')[0]+'version.txt')).text();
  const latency=await Promise.all(clients.map(p=>p.evaluate(()=>window.__relayLatencyStats)));
  if(errors.length||failedAssets.length)throw Error(JSON.stringify({errors,failedAssets}));
  await Promise.all([aContext.close(),bContext.close()]);
  return {url,version,versionFile,code,devHook,results,mutualRematch:true,refreshRecovered:true,hardwareWebGPU:adapter,latency,errors,failedAssets};
}
