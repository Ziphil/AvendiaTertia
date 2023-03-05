/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {
  Howl
} from "howler";
import {
  ReactElement,
  RefObject,
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
  spec,
  stopsRef
}: {
  spec: SongSpec,
  stopsRef: RefObject<Map<number, () => void>>
}): ReactElement {

  const [state, setState] = useState<"playing" | "pausing" | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [descriptionHeight, setDescriptionHeight] = useState(0);
  const howlRef = useRef(createHowl(spec));
  const descriptionElementRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const playOrPause = useCallback(function (): void {
    const howl = howlRef.current;
    const stops = stopsRef.current;
    if (howl.playing()) {
      howl.pause();
      setState("pausing");
    } else {
      howl.load();
      howl.play();
      setState("playing");
    }
    if (stops !== null) {
      for (const [number, stop] of stops) {
        if (number !== spec.number) {
          stop();
        }
      }
    }
  }, []);

  const stop = useCallback(function (): void {
    const howl = howlRef.current;
    howl.stop();
    setState(null);
  }, []);

  const handleClick = useCallback(function (): void {
    setDescriptionHeight((descriptionHeight) => {
      if (descriptionHeight <= 0) {
        const nextDescriptionHeight = descriptionElementRef.current?.clientHeight ?? 0;
        return nextDescriptionHeight;
      } else {
        return 0;
      }
    });
  }, []);

  useEffect(() => {
    const stops = stopsRef.current;
    if (stops !== null) {
      stops.set(spec.number, stop);
    }
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
      <button className="player-item-top" onClick={handleClick}>
        <div className="player-number" {...data({number: spec.number.toString()})}/>
        <div className="player-information">
          <div className="player-title">
            <div className="player-title-shaleian">
              {spec.title?.shaleian ?? <>{"reláf ac'"}<span className="player-title-number">{spec.number}</span></>}
            </div>
            <div className="player-title-normal">
              {spec.title?.normal ?? <>{"Musique n°"}<span className="player-title-number">{spec.number}</span></>}
            </div>
          </div>
          <div className="player-detail-list">
            <div className="player-detail-item" {...data({type: "date"})}>{spec.date}</div>
            <div className="player-detail-item" {...data({type: "length"})}>{formatTime(spec.length)}</div>
          </div>
        </div>
      </button>
      <div className="player-item-middle" style={{height: descriptionHeight}}>
        <div className="player-item-middle-inner" ref={descriptionElementRef} dangerouslySetInnerHTML={createHtmlObject(spec.description)}>
        </div>
      </div>
      <div className="player-item-bottom">
        <div className="player-item-bottom-left">
          <button className="player-button" id={id} onClick={playOrPause} {...data({type: "play"})} {...aria({label: "Play or pause"})}/>
          <button className="player-button" onClick={stop} {...data({type: "stop"})} {...aria({label: "Stop"})}/>
          <div className="player-separator"/>
          <a className="player-button" href={getSourceUrl(spec)} {...data({type: "download"})} {...aria({label: "Download"})}/>
          <a className="player-button" target="_blank" rel="noreferrer" href={getExternalUrl(spec)} {...data({type: "external"})} {...aria({label: "Open in new tab"})}/>
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
    src: [getSourceUrl(spec)],
    html5: true,
    preload: false
  });
  return howl;
}

function createHtmlObject(html: string): any {
  const object = {} as any;
  object["__html"] = html;
  return object;
}

function getSourceUrl(spec: SongSpec): string {
  const url = `https://drive.google.com/uc?export=download&id=${spec.googleId}`;
  return url;
}

function getExternalUrl(spec: SongSpec): string {
  const url = `https://drive.google.com/file/d/${spec.googleId}/view`;
  return url;
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
  googleId: string,
  description: string
};

export default PlayerPane;