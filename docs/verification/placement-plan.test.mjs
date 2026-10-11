import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
// Backend preparation source; switch to the released package after bootstrap.
import {TetrisDuel,aim,landing} from '@rmc/multiplayer-client/tetris-duel';
const context=vm.createContext({});
vm.runInContext(await readFile(new URL('./placement-plan.js',import.meta.url),'utf8'),context);
test('browser test planner uses only reachable aim actions and agrees with authoritative collision',()=>{
  let placements=0, attacks=0;
  for(let seed=1;seed<=8;seed++) {
    const duel=new TetrisDuel(seed);duel.add('a');duel.add('b');duel.ready('a',true);duel.ready('b',true);duel.advance(3000);
    for(let n=0;n<80&&duel.phase==='playing';n++) {
      const own=duel.project('a').own, original=JSON.stringify(own),plan=context.__testPlanPlacement(own);
      assert.ok(plan);assert.equal(JSON.stringify(own),original,'planner is read-only');
      let piece=own.piece;
      for(const action of plan.actions)piece=aim(piece,action);
      assert.equal(piece.x,plan.x);assert.equal(piece.rotation,plan.rotation);
      assert.equal(landing(own.board,piece),plan.landing);
      let seq=own.ack;
      for(const action of [...plan.actions,'commit'])assert.ok(duel.command('a',{protocolVersion:1,epoch:duel.epoch,pieceId:piece.id,seq:++seq,action}));
      duel.advance(200);placements++;if(plan.lines>=2)attacks++;
    }
  }
  assert.ok(placements>=200);assert.ok(attacks>=3,'legal inputs reach real multi-line attacks');
});
