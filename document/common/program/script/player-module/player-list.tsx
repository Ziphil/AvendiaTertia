/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {
  ReactElement
} from "react";
import PlayerPane from "./player-pane";


const PlayerList = function ({
  songSpecs
}: {
  songSpecs: Array<SongSpec>
}): ReactElement {

  const node = (
    <div className="player-list">
      {songSpecs.map((songSpec) => (
        <PlayerPane
          key={songSpec.number}
          number={songSpec.number}
          title={songSpec.title}
          date={songSpec.date}
          length={songSpec.length}
          description={songSpec.description}
        />
      ))}
    </div>
  );
  return node;

};


export type SongSpec = {
  number: number,
  title: string | null,
  date: string,
  length: number,
  description: string
};

export default PlayerList;