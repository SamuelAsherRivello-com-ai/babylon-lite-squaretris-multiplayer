async page => {
  const settings=await page.context().newPage();
  await settings.goto('edge://settings/appearance');
  const capability=await settings.evaluate(()=>({title:document.title,privateSettings:typeof chrome?.settingsPrivate,body:document.body.innerText.slice(0,120)}));
  await settings.close();return capability;
}
