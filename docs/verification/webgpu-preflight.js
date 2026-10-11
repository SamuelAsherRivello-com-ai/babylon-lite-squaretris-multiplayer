async page => {
  const result = await page.evaluate(async () => {
    const adapter = await navigator.gpu?.requestAdapter();
    return {secure:isSecureContext,webgpu:!!adapter,info:adapter?.info?.description,
      canvas:!!document.querySelector('canvas'), title:document.title};
  });
  return result;
}
