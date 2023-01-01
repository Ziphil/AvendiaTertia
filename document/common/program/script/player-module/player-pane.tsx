/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {
  Howl
} from "howler";
import {
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import {
  data
} from "../util/data";


const PlayerPane = function ({
  number,
  title,
  date,
  length
}: {
  number: number,
  title: string | null,
  date: string,
  length: number
}): ReactElement {

  const [state, setState] = useState<"playing" | "pausing" | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const howlRef = useRef(createHowl(number));

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
      <div className="player-item-top">
        <div className="player-number" {...data({number: number.toString()})}/>
        <div className="player-information">
          <div className="player-title" {...data({none: title === null})}>{title}</div>
          <div className="player-detail-list">
            <div className="player-detail-item" {...data({type: "date"})}>{date}</div>
            <div className="player-detail-item" {...data({type: "length"})}>{formatTime(length)}</div>
          </div>
        </div>
      </div>
      <div className="player-item-bottom">
        <div className="player-item-bottom-left">
          <button className="player-button" onClick={handlePlayOrPause} {...data({type: "play"})}/>
          <button className="player-button" onClick={handleStop} {...data({type: "reset"})}/>
        </div>
        <div className="player-item-bottom-right">
          {formatTime(currentTime)} / {formatTime(totalTime)}
        </div>
        <div className="player-progress-container">
          <div className="player-progress" style={{width: `${currentProgress}%`}}/>
        </div>
      </div>
    </div>
  );
  return node;

};


function createHowl(number: number): Howl {
  const howl = new Howl({
    src: [`/file/song/${number}.mp3`],
    preload: false
  });
  return howl;
}

function formatTime(time: number): string {
  const minute = Math.floor(time / 60).toString();
  const second = Math.floor(time % 60).toString().padStart(2, "0");
  return `${minute}:${second}`;
}


export default PlayerPane;