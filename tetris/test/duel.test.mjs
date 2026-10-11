import assert from 'node:assert/strict';
import {test} from 'node:test';
import {DuelPrediction} from '../src/content/duel-state.js';
import {DuelControls} from '../src/content/duel-controls.js';
import {emptyBoard,landing} from '@rmc/multiplayer-client/tetris-duel';
import {fitViewport,defaultLayout} from '../src/ui/layout.js';

const snapshot=(patch={})=>({protocolVersion:1,epoch:1,revision:1,serverTime:1000,phase:'playing',paused:false,own:{ack:0,out:false,board:emptyBoard(),piece:{id:1,shape:'T',x:3,rotation:0,stage:'aiming',deadline:6000}},...patch});
test('predicts aim immediately, replays only unacknowledged commands and rejects stale snapshots',()=>{
  const model=new DuelPrediction(()=>0);model.connected=true;const initial=snapshot();model.receive(initial);
  const left=model.command('left'),right=model.command('right');assert.equal(model.read().piece.x,3);
  const update=structuredClone(initial);update.revision=2;update.own.ack=left.seq;update.own.piece.x=2;
  model.receive(update);assert.equal(model.pending.length,1);assert.equal(model.read().piece.x,3);
  assert.equal(model.receive(initial),false);assert.equal(model.read().piece.x,3);
  update.revision=3;update.own.ack=right.seq;update.own.piece.x=3;model.receive(update);assert.equal(model.pending.length,0);
});
test('commit freezes steering and retains cosmetic descent start only for matching authoritative pose',()=>{
  let now=0;const model=new DuelPrediction(()=>now);model.connected=true;model.receive(snapshot());now=50;
  model.command('commit');const predicted=model.read().piece;
  assert.equal(predicted.stage,'falling');assert.equal(predicted.landing,22);assert.equal(model.command('left'),null);
  now=180;const update=snapshot({revision:2,serverTime:1150});update.own.ack=1;update.own.piece={...predicted,committedAt:1150};model.receive(update);
  assert.equal(model.read().piece.committedAt,1050);
  update.revision=3;update.own.piece.x=4;model.receive(update);assert.equal(model.read().piece.committedAt,1150);
});
test('never leaks old input into a new piece or rematch, and stops clocks when paused',()=>{
  let now=0;const model=new DuelPrediction(()=>now);model.connected=true;model.receive(snapshot());model.command('left');
  const update=snapshot({revision:2});update.own.piece.id=2;model.receive(update);assert.equal(model.pending.length,0);assert.equal(model.read().piece.x,3);
  model.command('right');const restart=snapshot({epoch:2,revision:3,paused:true});model.receive(restart);now=1000;
  assert.equal(model.seq,0);assert.equal(model.read().time,1000);assert.equal(model.command('commit'),null);
});
test('ghost uses authoritative collision including hidden entry and stable O rotation',()=>{
  const board=emptyBoard(),piece={shape:'O',rotation:0,x:3,stage:'aiming'};
  board[23][3]='G';assert.equal(landing(board,piece),21);assert.equal(landing(board,{...piece,rotation:1}),21);
  board[0][3]='G';assert.equal(landing(board,piece),null);
});
test('concurrent input owners share one repeat and cancellation clears every owner',async()=>{
  const sent=[];const controls=new DuelControls(action=>sent.push(action));
  controls.press('key','left');controls.press('touch1','left');controls.press('touch2','cw');
  assert.deepEqual(sent,['left','cw']);controls.release('key');assert.equal(controls.timers.size,1);
  await new Promise(resolve=>setTimeout(resolve,175));assert.equal(sent.filter(v=>v==='left').length,2);
  controls.reset();const count=sent.length;await new Promise(resolve=>setTimeout(resolve,80));assert.equal(sent.length,count);assert.equal(controls.owners.size,0);
});
test('fixed portrait fits integer pixels where possible and remains usable on smaller displays',()=>{
  assert.deepEqual(fitViewport(1280,1080,defaultLayout),{width:576,height:1024,x:352,y:28});
  const tiny=fitViewport(250,450,defaultLayout);assert.equal(tiny.width,250);assert.ok(tiny.height<450);
});
