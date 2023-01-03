/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {
  Howl
} from "howler";
import {
  ReactElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState
} from "react";
import {
  aria,
  data
} from "../util/data";


const PlayerPane = function ({
  spec
}: {
  spec: SongSpec
}): ReactElement {

  const [state, setState] = useState<"playing" | "pausing" | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const howlRef = useRef(createHowl(spec));
  const id = useId();

  const handlePlayOrPause = useCallback(function (): void {
    const howl = howlRef.current;
    if (howl.playing()) {
      howl.pause();
      setState("pausing");
    } else {
      howl.load();
      howl.play();
      setState("playing");
    }
  }, []);

  const handleStop = useCallback(function (): void {
    const howl = howlRef.current;
    howl.stop();
    setState(null);
  }, []);

  useEffect(() => {
    const howl = howlRef.current;
    howl.on("load", () => {
      const totalTime = howl.duration();
      setLoading(false);
      setTotalTime(totalTime);
    });
    howl.on("end", () => {
      howl.stop();
      setState(null);
    });
    setInterval(() => {
      const currentTime = howl.seek();
      const totalTime = howl.duration();
      const currentProgress = (totalTime > 0) ? currentTime / totalTime * 100 : 0;
      setCurrentTime(currentTime);
      setTotalTime(totalTime);
      setCurrentProgress(currentProgress);
    }, 100);
  }, []);

  const node = (
    <div className="player-item" {...data({state})}>
      <label className="player-item-top" htmlFor={id}>
        <div className="player-number" {...data({number: spec.number.toString()})}/>
        <div className="player-information">
          <div className="player-title" {...data({none: spec.title === null})}>
            {spec.title !== null && <div className="player-title-shaleian">{spec.title.shaleian}</div>}
            {spec.title !== null && <div className="player-title-normal">{spec.title.normal}</div>}
          </div>
          <div className="player-detail-list">
            <div className="player-detail-item" {...data({type: "date"})}>{spec.date}</div>
            <div className="player-detail-item" {...data({type: "length"})}>{formatTime(spec.length)}</div>
          </div>
        </div>
      </label>
      <div className="player-item-bottom">
        <div className="player-item-bottom-left">
          <button className="player-button" id={id} onClick={handlePlayOrPause} {...data({type: "play"})} {...aria({label: "Play or pause"})}/>
          <button className="player-button" onClick={handleStop} {...data({type: "stop"})} {...aria({label: "Stop"})}/>
          <div className="player-separator"/>
          <a className="player-button" href={spec.url} {...data({type: "download"})} {...aria({label: "Download"})}/>
        </div>
        <div className="player-item-bottom-right">
          {(state !== null) && ((loading) ? "Loading" : `${formatTime(currentTime)} / ${formatTime(totalTime)}`)}
        </div>
        <div className="player-progress-container">
          <div className="player-progress" style={{width: `${currentProgress}%`}}/>
        </div>
      </div>
    </div>
  );
  return node;

};


function createHowl(spec: SongSpec): Howl {
  const howl = new Howl({
    src: [spec.url],
    html5: true,
    preload: false
  });
  return howl;
}

function formatTime(time: number): string {
  const minute = Math.floor(time / 60).toString();
  const second = Math.floor(time % 60).toString().padStart(2, "0");
  return `${minute}:${second}`;
}

export type SongSpec = {
  number: number,
  title: {shaleian: string, normal: string} | null,
  date: string,
  length: number,
  url: string,
  description: string
};

export default PlayerPane;