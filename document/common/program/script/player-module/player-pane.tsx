/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import {Howl} from "howler";
import {
  ReactElement,
  RefObject,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState
} from "react";
import {aria, data} from "../util/data";


const PlayerPane = function ({
  spec,
  stopsRef
}: {
  spec: SongSpec,
  stopsRef: RefObject<Map<string, () => void>>
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
      <button className="player-item-top" disabled={spec.description === undefined} onClick={handleClick}>
        <div className="player-number">
          <span className="player-number-inner">
            <span>{spec.number.match(/^\d+/)?.[0] ?? "?"}</span>
            {(!!spec.number.match(/\D+$/)) && (<span className="player-number-symbol">{spec.number.match(/\D+$/)?.[0].toUpperCase() ?? ""}</span>)}
          </span>
        </div>
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
      {(spec.description !== undefined) && (
        <div className="player-item-middle" style={{height: descriptionHeight}}>
          <div className="player-item-middle-inner" ref={descriptionElementRef}>
            <div className="player-description" dangerouslySetInnerHTML={createHtmlObject(spec.description)}>
            </div>
          </div>
        </div>
      )}
      <div className="player-item-bottom">
        <div className="player-item-bottom-left">
          <button className="player-button" id={id} onClick={playOrPause} {...data({type: "play"})} title="再生/中断" {...aria({label: "再生/中断"})}/>
          <button className="player-button" onClick={stop} {...data({type: "stop"})} title="停止" {...aria({label: "停止"})}/>
          <div className="player-separator"/>
          <a className="player-button" href={getSourceUrl(spec)} {...data({type: "download"})} title="ダウンロード" {...aria({label: "ダウンロード"})}/>
          <a className="player-button" target="_blank" rel="noreferrer" href={getSongExternalUrl(spec)} {...data({type: "external"})} title="新しいタブ" {...aria({label: "新しいタブ"})}/>
          {(spec.scorePath !== undefined) && <a className="player-button" target="_blank" rel="noreferrer" href={getScoreExternalUrl(spec)} {...data({type: "score"})} title="楽譜" {...aria({label: "楽譜"})}/>}
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
  const url = `${spec.songPath}`;
  return url;
}

function getSongExternalUrl(spec: SongSpec): string {
  const url = `${spec.songPath}`;
  return url;
}

function getScoreExternalUrl(spec: SongSpec): string {
  const url = `${spec.scorePath}`;
  return url;
}

function formatTime(time: number): string {
  const minute = Math.floor(time / 60).toString();
  const second = Math.floor(time % 60).toString().padStart(2, "0");
  return `${minute}:${second}`;
}

export type SongSpec = {
  number: string,
  title?: {shaleian: string, normal: string},
  date: string,
  length: number,
  songPath: string,
  scorePath?: string,
  description?: string
};

export default PlayerPane;