/* Test-only legal placement planner. It reads one player's visible state and
 * returns keyboard actions; it never writes a board or sends a server command. */
(() => {
  const bases={I:['1111'],O:['11','11'],T:['010','111'],S:['011','110'],Z:['110','011'],J:['100','111'],L:['001','111']};
  function cells(shape,rotation) {
    let result=bases[shape].flatMap((row,y)=>[...row].flatMap((v,x)=>v==='1'?[[x,y]]:[]));
    for(let n=0;n<rotation;n++) {
      result=result.map(([x,y])=>[-y,x]);
      const minX=Math.min(...result.map(([x])=>x)),minY=Math.min(...result.map(([,y])=>y));
      result=result.map(([x,y])=>[x-minX,y-minY]);
    }
    return result;
  }
  globalThis.__testPlanPlacement=(own,avoidClear=false)=>{
    if(own?.piece?.stage!=='aiming')return null;
    const shape=own.piece.shape, candidates=[], seen=new Set(), queue=[{x:own.piece.x,rotation:own.piece.rotation,actions:[]}];
    const legal=(x,rotation)=>cells(shape,rotation).every(([dx])=>x+dx>=0&&x+dx<10);
    while(queue.length) {
      const current=queue.shift(), key=`${current.x}:${current.rotation}`;
      if(seen.has(key))continue;seen.add(key);
      const squares=cells(shape,current.rotation);
      const fits=y=>squares.every(([dx,dy])=>y+dy<24&&!own.board[y+dy][current.x+dx]);
      if(fits(0)) {
        let landing=0;while(fits(landing+1))landing++;
        const board=own.board.map(row=>[...row]);
        for(const [dx,dy] of squares)board[landing+dy][current.x+dx]=shape;
        const rest=board.filter(row=>row.some(cell=>!cell)),lines=24-rest.length;
        while(rest.length<24)rest.unshift(Array(10).fill(null));
        const heights=Array.from({length:10},(_,x)=>{const first=rest.findIndex(row=>row[x]);return first<0?0:24-first;});
        let holes=0;
        for(let x=0;x<10;x++)for(let y=24-heights[x];y<24;y++)if(!rest[y][x])holes++;
        const bump=heights.slice(1).reduce((sum,h,x)=>sum+Math.abs(h-heights[x]),0);
        const score=holes*8+heights.reduce((sum,h)=>sum+h,0)*.5+bump*.3+Math.max(...heights)*.8-lines*1.5-(lines>=2?12:0);
        candidates.push({...current,landing,lines,score,topout:rest.slice(0,4).some(row=>row.some(Boolean))});
      }
      for(const action of ['left','right','cw','ccw']) {
        const rotation=action==='cw'?(current.rotation+1)%4:action==='ccw'?(current.rotation+3)%4:current.rotation;
        const x=current.x+(action==='left'?-1:action==='right'?1:0);
        for(const kick of action==='left'||action==='right'?[0]:[0,-1,1,-2,2]) {
          if(legal(x+kick,rotation)) {queue.push({x:x+kick,rotation,actions:[...current.actions,action]});break;}
        }
      }
    }
    return candidates.filter(candidate=>!avoidClear||candidate.lines===0).sort((a,b)=>Number(a.topout)-Number(b.topout)||a.score-b.score||a.actions.length-b.actions.length)[0]??null;
  };
})();
