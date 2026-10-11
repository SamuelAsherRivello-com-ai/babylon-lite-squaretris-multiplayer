/* Browser-test injection only. Install before navigating to the actual game. */
(() => {
  const NativeWebSocket = globalThis.WebSocket;
  const settings = globalThis.__relayLatencySettings ?? {oneWayMs:75, jitterMs:25};
  const stats = {sent:0, received:0, canceled:0};
  globalThis.__relayLatencyStats = stats;
  globalThis.__testRelaySockets = [];
  globalThis.WebSocket = class DelayedWebSocket extends NativeWebSocket {
    constructor(...args) {
      super(...args);
      globalThis.__testRelaySockets.push(this);
      this.pending = new Set();
      this.queues = {outboundAt:[], inboundAt:[]};
      this.outboundAt = 0;
      this.inboundAt = 0;
      this.redispatched = new WeakSet();
      this.addEventListener('message', event => {
        if (this.redispatched.has(event)) return;
        event.stopImmediatePropagation();
        this.schedule('inboundAt', () => {
          if (this.readyState !== NativeWebSocket.OPEN) return;
          const copy = new MessageEvent('message', {data:event.data, origin:event.origin});
          this.redispatched.add(copy);
          stats.received++;
          this.dispatchEvent(copy);
        });
      });
      this.addEventListener('close', () => this.cancelPending());
    }
    schedule(direction, callback) {
      const delay = Math.max(0, settings.oneWayMs + (Math.random()*2-1)*settings.jitterMs);
      const now = performance.now();
      // TCP ordering survives jitter, including several messages in one frame.
      const at = Math.max(this[direction], now+delay);
      this[direction] = at;
      const queue = this.queues[direction];
      queue.push({at, callback});
      if (queue.length === 1) this.drain(direction);
    }
    drain(direction) {
      const queue = this.queues[direction];
      while (queue.length && queue[0].at <= performance.now()) queue.shift().callback();
      if (!queue.length) return;
      const timer = setTimeout(() => {
        this.pending.delete(timer);
        this.drain(direction);
      }, Math.max(1, Math.ceil(queue[0].at-performance.now())));
      this.pending.add(timer);
    }
    send(data) {
      if (this.readyState !== NativeWebSocket.OPEN) return super.send(data);
      // Native send consumes bytes immediately; preserve that ownership behavior.
      const payload = data instanceof ArrayBuffer ? data.slice(0)
        : ArrayBuffer.isView(data) ? data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength)
        : data;
      this.schedule('outboundAt', () => {
        if (this.readyState !== NativeWebSocket.OPEN) return;
        stats.sent++;
        super.send(payload);
      });
    }
    cancelPending() {
      for (const timer of this.pending) clearTimeout(timer);
      this.pending.clear();
      for (const queue of Object.values(this.queues)) {
        stats.canceled += queue.length;
        queue.length = 0;
      }
    }
    close(...args) { this.cancelPending(); return super.close(...args); }
  };
})();
