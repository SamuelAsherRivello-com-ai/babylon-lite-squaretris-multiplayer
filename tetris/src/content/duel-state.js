import { aim, landing } from '@rmc/multiplayer-client/tetris-duel';

/** Only recipient-visible snapshots enter this model. Inputs never invent settlements. */
export class DuelPrediction {
  constructor(now = () => performance.now()) {
    this.now = now;
    this.server = null;
    this.pending = [];
    this.seq = 0;
    this.receivedAt = 0;
    this.connected = false;
  }
  receive(server) {
    if (!server?.own) return false;
    if (this.server && (server.epoch < this.server.epoch ||
      (server.epoch === this.server.epoch && (server.revision < this.server.revision ||
      (server.revision === this.server.revision && server.serverTime < this.server.serverTime))))) return false;
    if (server.epoch !== this.server?.epoch) { this.seq = 0; this.pending = []; this.commitAnchor = null; }
    this.server = structuredClone(server);
    this.receivedAt = this.now();
    this.seq = Math.max(this.seq, server.own.ack ?? 0);
    this.pending = this.pending.filter(input => input.seq > server.own.ack && input.pieceId === server.own.piece?.id && input.epoch === server.epoch);
    return true;
  }
  read() {
    const server = this.server;
    if (!server) return {server:null,piece:null,time:0};
    const time = server.serverTime + (this.connected && !server.paused && ['playing','countdown'].includes(server.phase) ? this.now()-this.receivedAt : 0);
    let piece = server.own.piece && {...server.own.piece};
    for (const input of this.pending) {
      if (!piece || piece.stage !== 'aiming') break;
      if (input.action === 'commit') piece = {...piece,stage:'falling',landing:landing(server.own.board,piece),committedAt:input.predictedAt,resolvesAt:input.predictedAt+200};
      else piece = aim(piece,input.action);
    }
    const anchor = this.commitAnchor;
    if (piece?.stage === 'falling' && anchor?.epoch === server.epoch && anchor.id === piece.id &&
      anchor.x === piece.x && anchor.rotation === piece.rotation && anchor.landing === piece.landing) piece.committedAt = anchor.at;
    return {server,piece,time};
  }
  command(action) {
    const {server,piece,time} = this.read();
    if (!this.connected || server?.phase !== 'playing' || server.paused || server.own.out || piece?.stage !== 'aiming') return null;
    const input = {protocolVersion:1,epoch:server.epoch,pieceId:piece.id,seq:++this.seq,action};
    this.pending.push({...input,predictedAt:time});
    if (action === 'commit') this.commitAnchor = {epoch:server.epoch,id:piece.id,x:piece.x,rotation:piece.rotation,landing:landing(server.own.board,piece),at:time};
    return input;
  }
}
