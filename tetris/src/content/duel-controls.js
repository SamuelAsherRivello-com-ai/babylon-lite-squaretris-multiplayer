export const KEY_ACTIONS = {ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',ArrowUp:'cw',x:'cw',z:'ccw',' ':'commit'};

/** Separate owners allow keyboard + multiple pointers without duplicate repeat loops. */
export class DuelControls {
  constructor(send, changed = () => {}) { this.send=send; this.changed=changed; this.owners=new Map(); this.timers=new Map(); }
  press(owner, action) {
    if (this.owners.has(owner)) return;
    const held=[...this.owners.values()].includes(action);
    this.owners.set(owner,action);
    if (!held) {
      this.send(action);
      if (action==='left'||action==='right') {
        const timeout=setTimeout(()=>{this.send(action); this.timers.set(action,setInterval(()=>this.send(action),50));},150);
        this.timers.set(action,timeout);
      }
    }
    this.changed([...this.owners.values()]);
  }
  release(owner) {
    const action=this.owners.get(owner);
    this.owners.delete(owner);
    if (![...this.owners.values()].includes(action)) { clearTimeout(this.timers.get(action)); clearInterval(this.timers.get(action)); this.timers.delete(action); }
    this.changed([...this.owners.values()]);
  }
  reset() { for(const timer of this.timers.values()) {clearTimeout(timer);clearInterval(timer);} this.timers.clear();this.owners.clear();this.changed([]); }
}
