async page => {
  const browser = page.context().browser();
  const peerContext = await browser.newContext();
  try {
    const peer = await peerContext.newPage();
    await peer.goto('https://samuelasherrivello.github.io/github-repository-template/');
    await page.evaluate(() => sessionStorage.setItem('tetris-isolation-probe','local-only'));
    const result = await peer.evaluate(async () => ({
      separateStorage:sessionStorage.getItem('tetris-isolation-probe')===null,
      webgpu:!!(await navigator.gpu?.requestAdapter()),secure:isSecureContext,
    }));
    if (!result.separateStorage || !result.webgpu) throw Error(JSON.stringify(result));
    return result;
  } finally {
    await page.evaluate(() => sessionStorage.removeItem('tetris-isolation-probe'));
    await peerContext.close();
  }
}
