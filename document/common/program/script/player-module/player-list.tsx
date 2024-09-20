/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {ReactElement, useRef} from "react";
import PlayerPane from "./player-pane";
import {SongSpec} from "./player-pane";


const PlayerList = function ({
  specs
}: {
  specs: Array<SongSpec>
}): ReactElement {

  const stopsRef = useRef<Map<string, () => void>>(new Map());

  const node = (
    <div className="player-list">
      {specs.map((spec) => (
        <PlayerPane key={spec.number} spec={spec} stopsRef={stopsRef}/>
      ))}
    </div>
  );
  return node;

};


export default PlayerList;