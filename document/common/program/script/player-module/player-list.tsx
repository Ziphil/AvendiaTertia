/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {
  ReactElement
} from "react";
import PlayerPane from "./player-pane";


const PlayerList = function ({
}: {
}): ReactElement {

  const node = (
    <div className="player-list">
      <PlayerPane
        number="1"
        title="xalíh acís"
        date="2022/12/30"
        length="2:40"
      />
      <PlayerPane
        number="2"
        title={null}
        date="2022/12/31"
        length="2:40"
      />
    </div>
  );
  return node;

};


export default PlayerList;