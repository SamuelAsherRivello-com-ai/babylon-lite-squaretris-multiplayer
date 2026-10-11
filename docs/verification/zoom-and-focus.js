async page => {
  await page.goto('http://127.0.0.1:5179/babylon-lite-tetris-multiplayer-clone/?mute=1');
  await page.waitForFunction(()=>window.__duelInspect?.().graphicsReady);
  const cdp=await page.context().newCDPSession(page);
  const samples=[];
  for(const zoom of [1,1.25,1.5,2]) {
    // Browser zoom changes CSS viewport and DPR inversely; emulate both explicitly.
    await cdp.send('Emulation.setDeviceMetricsOverride',{width:Math.round(1280/zoom),height:Math.round(900/zoom),deviceScaleFactor:zoom,mobile:false});
    await page.waitForTimeout(150);
    const sample=await page.evaluate(()=>{const v=document.querySelector('#viewport'),c=document.querySelector('canvas');return {css:[v.clientWidth,v.clientHeight],backing:[c.width,c.height],dpr:devicePixelRatio};});
    if(sample.backing[0]!==Math.floor(sample.css[0]*zoom))throw Error('Zoom/DPR backing mismatch');
    samples.push({zoom,...sample});
  }
  await cdp.send('Emulation.clearDeviceMetricsOverride');
  // Room-code form owns arrows, Space and letters; no match command is generated.
  const field=page.getByRole('textbox',{name:'Room code',exact:true});
  await field.fill('ABC');await field.focus();await page.keyboard.press('ArrowLeft');await page.keyboard.press('x');
  const value=await field.inputValue();if(!value.includes('X'))throw Error('Form did not own game key');
  return {zoom:'CSS viewport/DPR emulation; actual browser-menu zoom unverified',samples,formValue:value};
}
