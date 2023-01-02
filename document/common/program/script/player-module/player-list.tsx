/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {
  ReactElement
} from "react";
import PlayerPane from "./player-pane";
import {
  SongSpec
} from "./player-pane";


const PlayerList = function ({
  songSpecs
}: {
  songSpecs: Array<SongSpec>
}): ReactElement {

  const node = (
    <div className="player-list">
      {songSpecs.map((songSpec) => (
        <PlayerPane key={songSpec.number} songSpec={songSpec}/>
      ))}
    </div>
  );
  return node;

};


export default PlayerList;