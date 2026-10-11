import {createContext,useContext,useState,useEffect} from 'react';
import {readProjectConfig,writeProjectConfigPatch} from '../../shared/projectConfigStorage.js';
import {isRenderResolutionPreset,renderResolutionPresets,cycleRenderResolutionPreset} from './render-resolution.js';
const Context=createContext({renderPreset:'native',setRenderScale(){},setRenderResolutionInfo(){}});
export function BabylonPresentationProvider({children}) {
  const [renderPreset,setRenderPreset]=useState(()=>{const value=readProjectConfig(globalThis.localStorage).renderPreset;return isRenderResolutionPreset(value)?value:'native';});
  const [renderScale,setRenderScale]=useState(1),[renderResolutionInfo,setRenderResolutionInfo]=useState(null);
  useEffect(()=>{writeProjectConfigPatch(localStorage,{renderPreset});},[renderPreset]);
  useEffect(()=>{
    const cycle=e=>{
      if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||e.target.closest?.('input,textarea,select,[contenteditable=true]'))return;
      if(e.key.toLowerCase()==='r')setRenderPreset(cycleRenderResolutionPreset);
    };
    window.addEventListener('keydown',cycle);return()=>window.removeEventListener('keydown',cycle);
  },[]);
  return <Context.Provider value={{renderPreset,setRenderPreset,renderScale,setRenderScale,renderResolutionInfo,setRenderResolutionInfo}}>{children}</Context.Provider>;
}
export function useBabylonPresentation(){return useContext(Context);}
export function BabylonLiteSettings(){
  const {renderPreset,setRenderPreset,renderScale,renderResolutionInfo:info}=useBabylonPresentation();
  return <><label>Render resolution · R <select value={renderPreset} onChange={e=>setRenderPreset(e.target.value)}>{renderResolutionPresets.map(v=><option key={v}>{v}</option>)}</select></label>
    <small>Babylon Lite · PixelPerfect2D<br/>{info?`${info.width}×${info.height} render / ${info.nativeWidth}×${info.nativeHeight} native`:'Initializing WebGPU…'}<br/>Render scale: {renderScale}×<br/>Fractional DPR or reduced resolution may soften pixel spacing.</small></>;
}
