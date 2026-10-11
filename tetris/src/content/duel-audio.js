const urls = import.meta.glob('./assets/*.wav', {query:'?url',import:'default',eager:true});
export class DuelAudio {
  constructor() { this.buffers=new Map();this.voices=new Set();this.muted=false; }
  async unlock() {
    if (this.muted) return;
    const AudioContext=window.AudioContext||window.webkitAudioContext;
    if (!AudioContext) return;
    this.context??=new AudioContext();
    await this.context.resume();
    if (!this.loading) this.loading=Promise.all(Object.entries(urls).map(async([path,url])=>{
      const bytes=await (await fetch(url)).arrayBuffer();
      const buffer=await this.context.decodeAudioData(bytes);
      this.buffers.set(path.split('/').pop().replace('.wav',''),buffer);
    })).catch(()=>{});
    await this.loading;
  }
  play(name) {
    if(this.muted||this.context?.state!=='running'||!this.buffers.has(name)||this.voices.size>=6)return;
    const source=this.context.createBufferSource(), gain=this.context.createGain();
    source.buffer=this.buffers.get(name); gain.gain.value=.18;
    source.connect(gain).connect(this.context.destination);this.voices.add(source);
    source.onended=()=>{this.voices.delete(source);source.disconnect();gain.disconnect();};source.start();
  }
  mute(value) {this.muted=value;if(value)for(const source of this.voices)source.stop();}
  dispose() {this.mute(true);void this.context?.close();}
}
