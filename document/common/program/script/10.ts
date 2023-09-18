/// <reference path="../../../../node_modules/typescript/lib/lib.dom.d.ts"/>
/// <reference path="../../../../node_modules/typescript/lib/lib.dom.iterable.d.ts"/>

import query from "jquery";
import {
  BaseExecutor
} from "./module/executor";


type MayNull<T> = T | null;
type MayUndefined<T> = T | undefined;

type TilePosition = number;
type EdgePosition = number;
type Symmetry = number;
type Rotation = number;
type Connections = Array<EdgePosition>;


export class Stone {

  public number: number;
  public tilePosition: TilePosition;
  public edgePosition: EdgePosition;

  public constructor(number: number, tilePosition: TilePosition, edgePosition: EdgePosition) {
    this.number = number;
    this.tilePosition = tilePosition;
    this.edgePosition = edgePosition;
  }

  public opposite(): MayNull<Stone> {
    const tilePosition = this.tilePosition;
    const edgePosition = this.edgePosition;
    let nextTilePosition = null as MayNull<TilePosition>;
    let nextEdgePosition = null as MayNull<EdgePosition>;
    if (edgePosition === 0 || edgePosition === 1) {
      if (tilePosition >= 6) {
        nextTilePosition = tilePosition - 6;
        nextEdgePosition = 5 - edgePosition;
      }
    } else if (edgePosition === 2 || edgePosition === 3) {
      if (tilePosition % 6 !== 5) {
        nextTilePosition = tilePosition + 1;
        nextEdgePosition = 9 - edgePosition;
      }
    } else if (edgePosition === 4 || edgePosition === 5) {
      if (tilePosition <= 29) {
        nextTilePosition = tilePosition + 6;
        nextEdgePosition = 5 - edgePosition;
      }
    } else if (edgePosition === 6 || edgePosition === 7) {
      if (tilePosition % 6 !== 0) {
        nextTilePosition = tilePosition - 1;
        nextEdgePosition = 9 - edgePosition;
      }
    }
    if (nextTilePosition !== null && nextEdgePosition !== null) {
      const nextStone = new Stone(this.number, nextTilePosition, nextEdgePosition);
      return nextStone;
    } else {
      return null;
    }
  }

}


export class Tile {

  public number: number;
  public symmetry: Symmetry;
  public rotation: Rotation;
  public connections: Connections;

  public constructor(number: number, symmetry: Symmetry, connections: Connections) {
    this.number = number;
    this.symmetry = symmetry;
    this.rotation = 0;
    this.connections = connections;
  }

  /** このタイルに沿って与えられた石を動かしたときの、移動後の位置情報をもった石を返します。
   * 石のタイル位置を変化しません。*/
  public movedStone(stone: Stone): Stone {
    const edgePosition = stone.edgePosition;
    const nextEdgePosition = this.connections[edgePosition];
    const nextStone = new Stone(stone.number, stone.tilePosition, nextEdgePosition);
    return nextStone;
  }

  public rotate(rotation: Rotation = 1): Tile {
    if (rotation > 0) {
      const connections = this.connections;
      const nextConnections = new Array<EdgePosition>(8);
      for (let i = 0 ; i < 8 ; i ++) {
        nextConnections[i] = (connections[(i + 6) % 8] + 2) % 8;
      }
      let nextTile = new Tile(this.number, this.symmetry, nextConnections);
      nextTile.rotation = (this.rotation + 1) % 4;
      nextTile = nextTile.rotate(rotation - 1);
      return nextTile;
    } else {
      return this;
    }
  }

}


export class Board {

  public tiles: Array<MayUndefined<Tile>>;

  public constructor() {
    this.tiles = new Array<Tile>(36);
  }

  public place(tile: Tile, tilePosition: TilePosition): Board {
    const nextTiles = this.tiles.concat();
    const nextBoard = new Board();
    nextTiles[tilePosition] = tile;
    nextBoard.tiles = nextTiles;
    return nextBoard;
  }

  public isEmpty(tilePosition: TilePosition): boolean {
    return this.tiles[tilePosition] === undefined;
  }

  public isFacingStone(tilePosition: TilePosition, stones: Array<Stone>): boolean {
    for (const stone of stones) {
      if (stone.tilePosition === tilePosition) {
        return true;
      }
    }
    return false;
  }

  /** この盤面に従って与えられた石を動かしたときの、移動後の位置情報をもった石を返します。
   * 石が盤外に出てしまう場合は `null` を返します。*/
  public movedStone(stone: Stone): MayNull<Stone> {
    const tiles = this.tiles;
    let nextStone = stone as MayNull<Stone>;
    let tile = undefined as MayUndefined<Tile>;
    while (nextStone && (tile = tiles[nextStone.tilePosition])) {
      nextStone = tile.movedStone(nextStone).opposite();
    }
    return nextStone;
  }

}


const TILES = [
  new Tile(0, 1, [1, 0, 3, 2, 5, 4, 7, 6]),
  new Tile(1, 4, [1, 0, 3, 2, 6, 7, 4, 5]),
  new Tile(2, 4, [1, 0, 3, 2, 7, 6, 5, 4]),
  new Tile(3, 4, [1, 0, 4, 6, 2, 7, 3, 5]),
  new Tile(4, 4, [1, 0, 4, 7, 2, 6, 5, 3]),
  new Tile(5, 4, [1, 0, 5, 6, 7, 2, 3, 4]),
  new Tile(6, 4, [1, 0, 5, 7, 6, 2, 4, 3]),
  new Tile(7, 4, [1, 0, 6, 4, 3, 7, 2, 5]),
  new Tile(8, 4, [1, 0, 6, 5, 7, 3, 2, 4]),
  new Tile(9, 2, [1, 0, 6, 7, 5, 4, 2, 3]),
  new Tile(10, 4, [1, 0, 7, 4, 3, 6, 5, 2]),
  new Tile(11, 4, [1, 0, 7, 5, 6, 3, 4, 2]),
  new Tile(12, 2, [1, 0, 7, 6, 5, 4, 3, 2]),
  new Tile(13, 2, [2, 3, 0, 1, 6, 7, 4, 5]),
  new Tile(14, 4, [2, 3, 0, 1, 7, 6, 5, 4]),
  new Tile(15, 4, [2, 4, 0, 6, 1, 7, 3, 5]),
  new Tile(16, 4, [2, 4, 0, 7, 1, 6, 5, 3]),
  new Tile(17, 4, [2, 5, 0, 6, 7, 1, 3, 4]),
  new Tile(18, 2, [2, 5, 0, 7, 6, 1, 4, 3]),
  new Tile(19, 4, [2, 6, 0, 4, 3, 7, 1, 5]),
  new Tile(20, 4, [2, 6, 0, 5, 7, 3, 1, 4]),
  new Tile(21, 4, [2, 7, 0, 4, 3, 6, 5, 1]),
  new Tile(22, 2, [2, 7, 0, 5, 6, 3, 4, 1]),
  new Tile(23, 2, [3, 2, 1, 0, 7, 6, 5, 4]),
  new Tile(24, 4, [3, 4, 6, 0, 1, 7, 2, 5]),
  new Tile(25, 4, [3, 4, 7, 0, 1, 6, 5, 2]),
  new Tile(26, 2, [3, 5, 6, 0, 7, 1, 2, 4]),
  new Tile(27, 1, [3, 6, 5, 0, 7, 2, 1, 4]),
  new Tile(28, 4, [4, 2, 1, 6, 0, 7, 3, 5]),
  new Tile(29, 2, [4, 2, 1, 7, 0, 6, 5, 3]),
  new Tile(30, 2, [4, 3, 6, 1, 0, 7, 2, 5]),
  new Tile(31, 1, [4, 5, 6, 7, 0, 1, 2, 3]),
  new Tile(32, 2, [4, 5, 7, 6, 0, 1, 3, 2]),
  new Tile(33, 1, [5, 4, 7, 6, 1, 0, 3, 2]),
  new Tile(34, 1, [7, 2, 1, 4, 3, 6, 5, 0])
];
const INITIAL_STONES = [
  new Stone(0, 1, 1),
  new Stone(1, 4, 0),
  new Stone(2, 11, 3),
  new Stone(3, 29, 2),
  new Stone(4, 34, 5),
  new Stone(5, 31, 4),
  new Stone(6, 24, 7),
  new Stone(7, 6, 6)
];

const ROW_SYMBOLS = ["1", "2", "3", "4", "5", "6"];
const COLUMN_SYMBOLS = ["A", "B", "C", "D", "E", "F"];
const ROTATION_SYMBOLS = ["T", "R", "B", "L"];

const TOP_SHIFT = [-9, -9, 24, 58, 91, 91, 58, 24];
const LEFT_SHIFT = [24, 58, 91, 91, 58, 24, -9, -9];
const RECORD_REGEXP = /(?:(?:([0-9]+)\s*:\s*)?([0-9])\s*([A-Z])\s*([0-9]+)\s*([A-Z])\s*(\*|x)?(?:\s*\[([0-9]+)\s*:\s*([0-9]+)\])?)|(?:(?:([0-9]+)\s*:\s*)?([0-9]+)\s*\/)/;

const TWITTER_WIDTH = 560;
const TWITTER_HEIGHT = 320;
const TWITTER_MESSAGE = "Time: %t";
const TWITTER_HASHTAG = "Tsuro";


export class HistoryEntry {

  public board: Board;
  public stones: Array<Stone>;
  public tile: MayNull<Tile>;
  public tilePosition: MayNull<TilePosition>;

  public constructor(board: Board, stones: Array<Stone>, tile: MayNull<Tile> = null, tilePosition: MayNull<TilePosition> = null) {
    this.board = board;
    this.stones = stones;
    this.tile = tile;
    this.tilePosition = tilePosition;
  }

}


export class History {

  private undoEntries: Array<HistoryEntry>;
  private redoEntries: Array<HistoryEntry>;
  private currentEntry: HistoryEntry;

  public constructor(board: Board, stones: Array<Stone>) {
    this.undoEntries = [];
    this.redoEntries = [];
    this.currentEntry = new HistoryEntry(board, stones);
  }

  public place(board: Board, stones: Array<Stone>, tile: MayNull<Tile> = null, tilePosition: MayNull<TilePosition> = null): void {
    const entry = new HistoryEntry(board, stones, tile, tilePosition);
    this.undoEntries.push(this.currentEntry);
    this.redoEntries = [];
    this.currentEntry = entry;
  }

  public undo(): MayNull<HistoryEntry> {
    if (this.canUndo()) {
      const entry = this.undoEntries.pop()!;
      this.redoEntries.push(this.currentEntry);
      this.currentEntry = entry;
      return entry;
    } else {
      return null;
    }
  }

  public redo(): MayNull<HistoryEntry> {
    if (this.canRedo()) {
      const entry = this.redoEntries.pop()!;
      this.undoEntries.push(this.currentEntry);
      this.currentEntry = entry;
      return entry;
    } else {
      return null;
    }
  }

  public canUndo(): boolean {
    return this.undoEntries.length > 0;
  }

  public canRedo(): boolean {
    return this.redoEntries.length > 0;
  }

}


export class RecordEntry {

  public tile: Tile;
  public tilePosition: TilePosition;
  public round: number;
  public elapsedTime: MayNull<number>;
  public withdrawn: boolean;

  public constructor(tile: Tile, tilePosition: TilePosition, round: number, elapsedTime: MayNull<number> = null) {
    this.tile = tile;
    this.tilePosition = tilePosition;
    this.round = round;
    this.elapsedTime = elapsedTime;
    this.withdrawn = false;
  }

  public withdraw(): void {
    this.withdrawn = true;
  }

  public toString(short: boolean): string {
    const row = ROW_SYMBOLS[Math.floor(this.tilePosition / 6)];
    const column = COLUMN_SYMBOLS[this.tilePosition % 6];
    const tileNumber = this.tile.number;
    const rotation = ROTATION_SYMBOLS[this.tile.rotation % this.tile.symmetry];
    let string = row + column + tileNumber + rotation;
    if (this.withdrawn) {
      string += "*";
    }
    if (!short) {
      string = this.round + ": " + string;
      if (this.elapsedTime !== null) {
        const minute = ("0" + Math.floor(this.elapsedTime / 60)).slice(-2);
        const second = ("0" + (this.elapsedTime % 60)).slice(-2);
        string = string + " [" + minute + ":" + second + "]";
      }
    }
    return string;
  }

}


export class Record {

  public entries: Array<RecordEntry>;

  public constructor() {
    this.entries = [];
  }

  public place(tile: Tile, tilePosition: TilePosition, round: number, elapsedTime: MayNull<number>): void {
    const entry = new RecordEntry(tile, tilePosition, round, elapsedTime);
    this.entries.push(entry);
  }

  public undo(): void {
    for (let i = this.entries.length - 1 ; i >= 0 ; i --) {
      const entry = this.entries[i];
      if (!entry.withdrawn) {
        entry.withdraw();
        break;
      }
    }
  }

  public toString(short: boolean): string {
    const strings = [] as Array<string>;
    for (const entry of this.entries) {
      const entryString = entry.toString(short);
      strings.push(entryString);
    }
    const separator = (short) ? " " : "\n";
    const string = strings.join(separator);
    return string;
  }

}


export class Tsuro {

  private hands: Array<Tile>;
  public stones: Array<Stone>;
  public board: Board;
  public history: History;
  public record: Record;
  private beginDate: MayNull<Date>;
  private finishDate: MayNull<Date>;
  private round: number;

  public constructor(string: MayNull<string> = null) {
    this.hands = [];
    this.stones = INITIAL_STONES;
    this.board = new Board();
    this.history = new History(this.board, this.stones);
    this.record = new Record();
    this.beginDate = new Date();
    this.finishDate = null;
    this.round = 0;
    if (string !== null) {
      this.beginDate = null;
      this.load(string);
    } else {
      this.start();
    }
  }

  public start(): void {
    const unusedTiles = TILES.concat();
    Tsuro.shuffle(unusedTiles);
    this.hands.push(...unusedTiles);
  }

  public load(string: string): void {
    let unusedTiles = TILES.concat();
    const regexp = new RegExp(RECORD_REGEXP, "g");
    let match = null as MayNull<RegExpExecArray>;
    while ((match = regexp.exec(string)) !== null) {
      if (match[2] !== undefined) {
        const row = ROW_SYMBOLS.indexOf(match[2]);
        const column = COLUMN_SYMBOLS.indexOf(match[3]);
        const tileNumber = parseInt(match[4]);
        const rotation = ROTATION_SYMBOLS.indexOf(match[5]);
        const withdrawn = !!match[6];
        const elapsedTime = (match[7] !== undefined) ? parseInt(match[7]) * 60 + parseInt(match[8]) : null;
        if (!withdrawn) {
          if (row >= 0 && column >= 0 && tileNumber < TILES.length && rotation >= 0) {
            const tile = TILES[tileNumber];
            const tilePosition = row * 6 + column;
            this.hands[this.round] = tile;
            const result = this.place(rotation, tilePosition, elapsedTime);
            if (result) {
              unusedTiles = unusedTiles.filter((unusedTile) => {
                return unusedTile.number !== tileNumber;
              });
            } else {
              throw new Error("Invalid Move");
            }
          } else {
            throw new Error("Invalid Record");
          }
        }
      } else {
        const tileNumber = parseInt(match[10]);
        const tile = TILES[tileNumber];
        this.hands[this.round] = tile;
        unusedTiles = unusedTiles.filter((unusedTile) => {
          return unusedTile.number !== tileNumber;
        });
      }
    }
    Tsuro.shuffle(unusedTiles);
    this.hands.push(...unusedTiles);
  }

  public place(rotation: Rotation, tilePosition: TilePosition, elapsedTime: MayNull<number> = null): boolean {
    const result = this.check(rotation, tilePosition);
    if (result !== null) {
      const tile = this.nextHand!.rotate(rotation);
      this.board = result.board;
      this.stones = result.stones;
      this.round ++;
      this.history.place(this.board, this.stones, tile, tilePosition);
      this.record.place(tile, tilePosition, this.round, (elapsedTime !== null) ? elapsedTime : this.elapsedTime);
      if (this.finishDate === null && this.remainingHandSize <= 0) {
        this.finishDate = new Date();
      }
      return true;
    } else {
      return false;
    }
  }

  public undo(): boolean {
    const entry = this.history.undo();
    if (entry) {
      this.board = entry.board;
      this.stones = entry.stones;
      this.round --;
      this.record.undo();
      return true;
    } else {
      return false;
    }
  }

  public redo(): boolean {
    const entry = this.history.redo();
    if (entry) {
      this.board = entry.board;
      this.stones = entry.stones;
      this.round ++;
      this.record.place(entry.tile!, entry.tilePosition!, this.round, this.elapsedTime);
      return true;
    } else {
      return false;
    }
  }

  public canUndo(): boolean {
    return this.history.canUndo();
  }

  public canRedo(): boolean {
    return this.history.canRedo();
  }

  /** 次に置くべきタイルを特定の場所に特定の回転で置けるかどうかを調べます。
   * 置けるのであれば、置いた後の盤面と石の状態を返します。
   * その場所に石が面していなかったり石が盤外に出てしまうなどの理由で置けない場合は、`null` を返します。
   * また、全てのタイルを置き切っていて次のタイルがない場合も、`null` を返します。*/
  private check(rotation: Rotation, tilePosition: TilePosition): MayNull<{board: Board, stones: Array<Stone>}> {
    const board = this.board;
    if (this.nextHand && board.isEmpty(tilePosition) && board.isFacingStone(tilePosition, this.stones)) {
      const placedTile = this.nextHand.rotate(rotation);
      const nextBoard = this.board.place(placedTile, tilePosition);
      const nextStones = new Array(this.stones.length);
      for (let i = 0 ; i < this.stones.length ; i ++) {
        const stone = this.stones[i];
        const nextStone = nextBoard.movedStone(stone);
        if (nextStone !== null) {
          nextStones[i] = nextStone;
        } else {
          return null;
        }
      }
      return {board: nextBoard, stones: nextStones};
    } else {
      return null;
    }
  }

  public placeableTilePositions(rotation: Rotation): Array<TilePosition> {
    const tilePositions = [] as Array<TilePosition>;
    for (let tilePosition = 0 ; tilePosition < 36 ; tilePosition ++) {
      const result = this.check(rotation, tilePosition);
      if (result !== null) {
        tilePositions.push(tilePosition);
      }
    }
    return tilePositions;
  }

  public isPlaceable(): boolean {
    for (let rotation = 0 ; rotation < 4 ; rotation ++) {
      if (this.placeableTilePositions(rotation).length > 0) {
        return true;
      }
    }
    return false;
  }

  private static shuffle<T>(array: Array<T>): void {
    for (let i = array.length - 1 ; i > 0 ; i --) {
      const j = Math.floor(Math.random() * (i + 1));
      const temporary = array[i];
      array[i] = array[j];
      array[j] = temporary;
    }
  }

  public get remainingHands(): Array<Tile> {
    return this.hands.slice(this.round);
  }

  public get remainingHandSize(): number {
    return this.hands.length - this.round;
  }

  public get nextHand(): MayUndefined<Tile> {
    return this.hands[this.round];
  }

  public get elapsedTime(): MayNull<number> {
    const beginDate = this.beginDate;
    if (beginDate) {
      const endDate = this.finishDate || new Date();
      let elapsedTime = Math.floor((endDate.getTime() - beginDate.getTime()) / 1000);
      if (elapsedTime > 3600) {
        elapsedTime = 3600;
      }
      return elapsedTime;
    } else {
      return null;
    }
  }

}


export class Executor extends BaseExecutor {

  private tsuro: Tsuro;
  private rotation: Rotation;
  private hoveredTilePosition: MayNull<TilePosition>;

  public constructor() {
    super();
    this.tsuro = new Tsuro();
    this.rotation = 0;
    this.hoveredTilePosition = null;
  }

  private start(force: boolean): void {
    if (!force) {
      const result = confirm("新しいゲームを開始します。");
      if (!result) {
        return;
      }
    }
    this.tsuro = new Tsuro();
    this.rotation = 0;
    this.hoveredTilePosition = null;
    this.render();
  }

  private load(force: boolean): void {
    if (!force) {
      const result = confirm("棋譜を読み込みます。");
      if (!result) {
        return;
      }
    }
    const string = query("#history").val() as string;
    try {
      this.tsuro = new Tsuro(string);
    } catch {
      alert("棋譜が異常です。新しいゲームを開始します。");
      this.tsuro = new Tsuro();
    }
    this.rotation = 0;
    this.render();
  }

  private init(): void {
    let string = null;
    const pairs = location.search.substring(1).split("&");
    for (const pair of pairs) {
      let match;
      if ((match = pair.match(/q=(.+)/)) !== null) {
        string = decodeURIComponent(match[1]);
      }
    }
    if (string !== null) {
      query("#history").val(string);
      this.load(true);
    } else {
      this.start(true);
    }
  }

  protected prepare(): void {
    this.prepareTiles();
    this.prepareStones();
    this.prepareNextHand();
    this.prepareRemainingHands();
    this.prepareTimer();
    this.prepareCheckBoxes();
    this.prepareButtons();
    this.init();
    this.render();
  }

  private prepareTiles(): void {
    const maskDiv = query("#mask");
    for (let i = 0 ; i < 36 ; i ++) {
      const j = i;
      const tileDiv = query("<div>");
      const rowNumber = Math.floor(i / 6);
      if ((rowNumber % 2 === 0 && i % 2 === 0) || (rowNumber % 2 === 1 && i % 2 === 1)) {
        tileDiv.attr("class", "tile alternative");
      } else {
        tileDiv.attr("class", "tile");
      }
      tileDiv.attr("id", "tile-" + i);
      tileDiv.on("mousedown", (event) => {
        if (event.button === 0) {
          this.place(j);
        } else if (event.button === 2) {
          this.rotate();
        }
      });
      tileDiv.on("contextmenu", (event) => {
        event.preventDefault();
      });
      tileDiv.on("mouseenter", (event) => {
        this.hover(j);
      });
      tileDiv.on("mouseleave", (event) => {
        this.hover(null);
      });
      maskDiv.before(tileDiv);
    }
  }

  private prepareRemainingHands(): void {
    const remainingHandDiv = query("#remaining");
    for (let i = 0 ; i < 35 ; i ++) {
      const tileDiv = query("<div>");
      const rowNumber = Math.floor(i / 6);
      if ((rowNumber % 2 === 0 && i % 2 === 0) || (rowNumber % 2 === 1 && i % 2 === 1)) {
        tileDiv.attr("class", "tile alternative");
      } else {
        tileDiv.attr("class", "tile");
      }
      tileDiv.attr("id", "tile-" + i);
      remainingHandDiv.append(tileDiv);
    }
  }

  private prepareStones(): void {
    const maskDiv = query("#mask");
    for (let i = 0 ; i < 8 ; i ++) {
      const stoneDiv = query("<div>");
      stoneDiv.attr("class", "stone");
      stoneDiv.attr("id", "stone-" + i);
      stoneDiv.css("background-image", "url(\"../../material/tsuro/" + (i + 37) + ".png\")");
      maskDiv.before(stoneDiv);
    }
  }

  private prepareNextHand(): void {
    const tileDiv = query("#next-tile");
    tileDiv.on("mousedown", (event) => {
      this.rotate();
    });
    tileDiv.on("contextmenu", (event) => {
      event.preventDefault();
    });
  }

  private prepareTimer(): void {
    setInterval(() => {
      const elapsedTime = this.tsuro.elapsedTime;
      const minute = (elapsedTime !== null) ? ("0" + Math.floor(elapsedTime / 60)).slice(-2) : "  ";
      const second = (elapsedTime !== null) ? ("0" + (elapsedTime % 60)).slice(-2) : "  ";
      if (query("#minute").text() !== minute) {
        query("#minute").text(minute);
      }
      if (query("#second").text() !== second) {
        query("#second").text(second);
      }
    }, 50);
  }

  private prepareCheckBoxes(): void {
    query("#show-suggest").on("change", (event) => {
      this.render();
    });
    query("#show-remaining").on("change", (event) => {
      this.render();
    });
    query("#show-mask").on("change", (event) => {
      this.render();
    });
    query("#show-information").on("change", (event) => {
      this.render();
    });
  }

  private prepareButtons(): void {
    query("#undo").on("click", (event) => {
      this.undo();
    });
    query("#redo").on("click", (event) => {
      this.redo();
    });
    query("#start").on("click", (event) => {
      this.start(false);
    });
    query("#load").on("click", (event) => {
      this.load(false);
    });
    query("#tweet").on("click", (event) => {
      this.tweet();
    });
  }

  private place(tilePosition: TilePosition): void {
    const result = this.tsuro.place(this.rotation, tilePosition);
    if (result) {
      this.rotation = 0;
    }
    this.render();
  }

  private rotate(): void {
    this.rotation = (this.rotation + 1) % 4;
    this.render();
  }

  private hover(tilePosition: MayNull<TilePosition>): void {
    this.hoveredTilePosition = tilePosition;
    this.render();
  }

  private undo(): void {
    const result = this.tsuro.undo();
    if (result) {
      this.rotation = 0;
    }
    this.render();
  }

  private redo(): void {
    const result = this.tsuro.redo();
    if (result) {
      this.rotation = 0;
    }
    this.render();
  }

  private render(): void {
    this.renderTiles();
    this.renderStones();
    this.renderHoveredTile();
    this.renderPlaceableTilePositions();
    this.renderInformation();
    this.renderNextHand();
    this.renderNextHandInformation();
    this.renderRemainingHands();
    this.renderRemainingHandSize();
    this.renderButtons();
    this.renderRecord();
  }

  private renderTiles(): void {
    const tiles = this.tsuro.board.tiles;
    for (let i = 0 ; i < tiles.length ; i ++) {
      const tile = tiles[i];
      const tileDiv = query("#board #tile-" + i);
      tileDiv.empty();
      if (tile) {
        const tileTextureDiv = query("<div>");
        tileTextureDiv.attr("class", "background");
        tileTextureDiv.css("background-image", "url(\"../../material/tsuro/" + (tile.number + 1) + ".png\")");
        tileTextureDiv.css("transform", "rotate(" + (tile.rotation * 90) + "deg)");
        tileDiv.append(tileTextureDiv);
      }
    }
  }

  private renderRemainingHands(): void {
    const remainingHands = this.tsuro.remainingHands;
    for (let i = 0 ; i < 35 ; i ++) {
      const tileDiv = query("#remaining #tile-" + i);
      tileDiv.empty();
    }
    if (query("#show-remaining").is(":checked")) {
      for (const tile of remainingHands) {
        const tileDiv = query("#remaining #tile-" + tile.number);
        const tileTextureDiv = query("<div>");
        tileTextureDiv.attr("class", "background");
        tileTextureDiv.css("background-image", "url(\"../../material/tsuro/" + (tile.number + 1) + ".png\")");
        tileTextureDiv.css("transform", "rotate(" + (tile.rotation * 90) + "deg)");
        tileDiv.append(tileTextureDiv);
      }
    }
  }

  private renderStones(): void {
    const stones = this.tsuro.stones;
    for (const stone of stones) {
      const top = Math.floor(stone.tilePosition / 6) * 100 + TOP_SHIFT[stone.edgePosition];
      const left = (stone.tilePosition % 6) * 100 + LEFT_SHIFT[stone.edgePosition];
      const stoneDiv = query("#stone-" + stone.number);
      stoneDiv.css("top", (top + 50) + "px");
      stoneDiv.css("left", (left + 50) + "px");
    }
  }

  private renderHoveredTile(): void {
    const tile = this.tsuro.nextHand;
    if (tile) {
      const tilePosition = this.hoveredTilePosition;
      const tileDiv = query("#board #tile-" + tilePosition);
      const tileTextureDiv = query("<div>");
      tileTextureDiv.attr("class", "background hover");
      tileTextureDiv.css("background-image", "url(\"../../material/tsuro/" + (tile.number + 1) + ".png\")");
      tileTextureDiv.css("transform", "rotate(" + (this.rotation * 90) + "deg)");
      tileDiv.append(tileTextureDiv);
    }
  }

  private renderPlaceableTilePositions(): void {
    if (query("#show-suggest").is(":checked")) {
      const tilePositions = this.tsuro.placeableTilePositions(this.rotation);
      for (const tilePosition of tilePositions) {
        const tileDiv = query("#board #tile-" + tilePosition);
        const highlightDiv = query("<div>");
        highlightDiv.attr("class", "highlight");
        tileDiv.append(highlightDiv);
      }
    }
    if (query("#show-mask").is(":checked") && !this.tsuro.isPlaceable() && this.tsuro.remainingHandSize > 0) {
      query("#mask").css("display", "flex");
    } else {
      query("#mask").css("display", "none");
    }
  }

  private renderInformation(): void {
    if (query("#show-information").is(":checked")) {
      for (const entry of this.tsuro.record.entries) {
        if (!entry.withdrawn) {
          const tileDiv = query("#board #tile-" + entry.tilePosition);
          const tileInformationDiv = query("<div>");
          tileInformationDiv.attr("class", "information");
          tileInformationDiv.html(entry.round + ":<br>" + entry.toString(true));
          tileDiv.append(tileInformationDiv);
        }
      }
    }
  }

  private renderNextHand(): void {
    const tile = this.tsuro.nextHand;
    const tileDiv = query("#next-tile");
    tileDiv.empty();
    if (tile) {
      const tileTextureDiv = query("<div>");
      tileTextureDiv.attr("class", "background");
      tileTextureDiv.css("background-image", "url(\"../../material/tsuro/" + (tile.number + 1) + ".png\")");
      tileTextureDiv.css("transform", "rotate(" + (this.rotation * 90) + "deg)");
      tileDiv.append(tileTextureDiv);
    }
  }

  private renderNextHandInformation(): void {
    if (query("#show-information").is(":checked")) {
      const tile = this.tsuro.nextHand;
      const tileDiv = query("#next-tile");
      if (tile) {
        const tileInformationDiv = query("<div>");
        const tileNumber = tile.number;
        const rotation = ROTATION_SYMBOLS[this.rotation % tile.symmetry];
        const string = tileNumber + rotation;
        tileInformationDiv.attr("class", "information");
        tileInformationDiv.html(string);
        tileDiv.append(tileInformationDiv);
      }
    }
  }

  private renderRemainingHandSize(): void {
    const remainingHandSize = this.tsuro.remainingHandSize;
    const remainingHandSizeDiv = query("#remaining-size");
    remainingHandSizeDiv.text(remainingHandSize);
  }

  private renderButtons(): void {
    if (this.tsuro.canUndo()) {
      query("#undo").attr("class", "");
    } else {
      query("#undo").attr("class", "disabled");
    }
    if (this.tsuro.canRedo()) {
      query("#redo").attr("class", "");
    } else {
      query("#redo").attr("class", "disabled");
    }
  }

  private renderRecord(): void {
    query("#history").val(this.tsuro.record.toString(false));
  }

  private tweet(): void {
    const string = this.tsuro.record.toString(false);
    const elapsedTime = this.tsuro.elapsedTime!;
    const minute = ("0" + Math.floor(elapsedTime / 60)).slice(-2);
    const second = ("0" + (elapsedTime % 60)).slice(-2);
    let url = location.protocol + "//" + location.host + location.pathname;
    const option = "width=" + TWITTER_WIDTH + ",height=" + TWITTER_HEIGHT + ",menubar=no,toolbar=no,scrollbars=no";
    let href = "https://twitter.com/intent/tweet";
    url += "?q=" + encodeURIComponent(string);
    href += "?text=" + TWITTER_MESSAGE.replace(/%t/g, minute + ":" + second);
    href += "&url=" + encodeURIComponent(url);
    href += "&hashtags=" + TWITTER_HASHTAG;
    window.open(href, "_blank", option);
  }

}


Executor.register();