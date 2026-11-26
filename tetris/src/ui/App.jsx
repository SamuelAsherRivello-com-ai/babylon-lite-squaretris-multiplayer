import { useEffect, useState } from 'react';
import versionText from '../../../version.txt?raw';
import {ContentShellProvider} from '../shared/ContentShellContext.jsx';
import {readProjectConfig,writeProjectConfigPatch} from '../shared/projectConfigStorage.js';
import {BrowserSurface} from './BrowserSurface.jsx';
import {defaultLayout,selectResponsiveLayout} from './layout.js';
import {Dialog} from './Dialog.jsx';
export function Corner({position,children}) {return <div className={`corner corner_${position}`}>{children}</div>;}
export function App({layout=defaultLayout,content=null,contentPresentation=null,gutters={}}) {
  const [dialog,setDialog]=useState(null);
  const [fullscreen,setFullscreen]=useState(false);
  const [surfaceSize,setSurfaceSize]=useState(()=>({width:globalThis.innerWidth||0,height:globalThis.innerHeight||0}));
  const [prefs,setPrefs]=useState(()=>{
    const saved=readProjectConfig(globalThis.localStorage);
    return {muted:new URLSearchParams(globalThis.location?.search).get('mute')==='1'||saved.muted===true,reduced:saved.reduced===true};
  });
  useEffect(()=>{writeProjectConfigPatch(localStorage,prefs);},[prefs]);
  const toggleFullscreen=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{setFullscreen(false);}};
  useEffect(()=>{const sync=()=>setFullscreen(Boolean(document.fullscreenElement));document.addEventListener('fullscreenchange',sync);return()=>document.removeEventListener('fullscreenchange',sync);},[]);
  useEffect(()=>{const sync=()=>setSurfaceSize({width:window.innerWidth,height:window.innerHeight});window.addEventListener('resize',sync);return()=>window.removeEventListener('resize',sync);},[]);
  useEffect(()=>{
    const shortcut=e=>{
      if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||e.target.closest?.('input,textarea,select,[contenteditable=true]'))return;
      const key=e.key.toLowerCase();
      if(key==='f')void toggleFullscreen();
      if(key==='c'||key==='b')setDialog(v=>v?null:'settings');
      if(key==='escape')setDialog(null);
    };
    window.addEventListener('keydown',shortcut);return()=>window.removeEventListener('keydown',shortcut);
  },[]);
  const activeLayout=selectResponsiveLayout(layout,surfaceSize.width,surfaceSize.height);
  return <ContentShellProvider paused={Boolean(dialog)} preferences={prefs}>
    <BrowserSurface layout={activeLayout} gutters={gutters} ui={<>
      <div className="bottom_bar">
        <div className="corner_actions"><span id="mode_action"/><button className="corner_action" onClick={()=>setDialog('settings')}>Settings</button></div>
        <div className="bottom_identity"><span id="project_title" className="corner-title">Squaretris</span><span aria-hidden="true"> · </span><span id="version" className="corner-body">v{versionText.trim().replace(/^version=|^v/g,'')}</span></div>
      </div>
      {dialog&&<Dialog title="Settings" onClose={()=>setDialog(null)}>
        <div className="dialog_options">
          <label><input type="checkbox" checked={fullscreen} onChange={toggleFullscreen}/> Fullscreen · F</label>
          <label><input type="checkbox" checked={prefs.muted} onChange={e=>setPrefs(v=>({...v,muted:e.target.checked}))}/> Mute sounds</label>
          <label><input type="checkbox" checked={prefs.reduced} onChange={e=>setPrefs(v=>({...v,reduced:e.target.checked}))}/> Reduced effects</label>
          <small>Instructions: Play with WASD keys, or arrow keys, or on-screen buttons.</small>
        </div>
      </Dialog>}
    </>}>{content}</BrowserSurface>
  </ContentShellProvider>;
}
