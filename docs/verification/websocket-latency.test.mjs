import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {test} from 'node:test';

const source = await readFile(new URL('./websocket-latency.js', import.meta.url),'utf8');
function setup(settings={oneWayMs:30,jitterMs:25}) {
  class Socket extends EventTarget {
    static OPEN=1; static CLOSED=3;
    readyState=1; sent=[];
    send(value) { this.sent.push(value); }
    close() { this.readyState=3; this.dispatchEvent(new Event('close')); }
  }
  const context = vm.createContext({WebSocket:Socket, MessageEvent, ArrayBuffer, Math,
    performance, setTimeout, clearTimeout, __relayLatencySettings:settings});
  vm.runInContext(source,context);
  return {socket:new context.WebSocket(),stats:context.__relayLatencyStats};
}
const wait = ms => new Promise(resolve => setTimeout(resolve,ms));

test('jitter delays actual bytes/events and preserves both directions in FIFO order',async()=>{
  const {socket,stats}=setup(); const messages=[];
  socket.addEventListener('message',event=>messages.push(event.data));
  for(let n=0;n<20;n++) {
    socket.send(String(n));
    socket.dispatchEvent(new MessageEvent('message',{data:String(n)}));
  }
  assert.equal(socket.sent.length,0); assert.equal(messages.length,0);
  await wait(100);
  const expected=Array.from({length:20},(_,n)=>String(n));
  assert.deepEqual(socket.sent,expected); assert.deepEqual(messages,expected);
  assert.equal(stats.sent,20); assert.equal(stats.received,20);
});
test('queued binary data is copied and socket close cancels pending callbacks',async()=>{
  const {socket,stats}=setup({oneWayMs:30,jitterMs:0});
  const data=new Uint8Array([1,2,3]); socket.send(data); data[0]=99;
  await wait(50); assert.deepEqual([...new Uint8Array(socket.sent[0])],[1,2,3]);
  let received=0; socket.addEventListener('message',()=>received++);
  socket.send('canceled'); socket.dispatchEvent(new MessageEvent('message',{data:'canceled'}));
  socket.close(); await wait(50);
  assert.equal(socket.sent.length,1); assert.equal(received,0); assert.equal(stats.canceled,2);
});
