// 3 composite types used by view

export * from './controller';
export * from './movement';
export * from './entity';
export * from './game';
export * from './factory';
export * from './profile';

import { Observable, Subject, timer, } from 'rxjs';
import { filter, map, timeInterval } from 'rxjs/operators';
import { IController, IActionable } from './controller';
import { IMovement, Rotation } from './movement';
import { IEntity } from './entity';
import { IEntityFactory } from './factory';
import { IProfile, Mode } from './profile';
import { IGame, GameState, IGameRecord, IView } from './game';
import { IBlock, IBoard } from './board';


export interface IRobot extends IEntity {
  controller: IController;
  movement: IMovement;
}

export interface IDestination extends IEntity {
  controller: IController;
  movement: IMovement;
}

// Types of events
/*
 * onCreate
 * onDestroy
 * onUpdate
 * onError
 * -- Entity
 * onPosition
 * -- Game
 * onGameOver
 * onStart
 * onTick
 * onPause
 * onResume
 */
export type StateEvents = "create" | "destroy" | "update" | "error" | "position" | "game_over" | "game_start" | "tick" | "game_pause" | "game_start";
export class State {

  public state$: Subject<StateEvents> = new Subject<StateEvents>();
  public onState(event: StateEvents) {
    return this.state$.pipe(filter(type => event == type));
  }
}

export abstract class Entity extends State implements IEntity {
  entityFactory: IEntityFactory;
  disabled: boolean;
  profile: IProfile;
  mode: Mode;
  game: IGame;
}

export class Controller implements IController {
  input: Subject<IActionable> = new Subject<IActionable>();
  protected _disabled: boolean;
  public get disabled(): boolean {
    return this._disabled;
  }
  public set disabled(val: boolean) {
    this._disabled = val;
  }
  actions: { [action: string]: (action: IActionable) => void } = {};

  constructor(entity: IEntity) {
    this.entity = entity;
    this.input
      .pipe(filter(actionable => !this.disabled && !(!this.actions[actionable.action])))
      .subscribe(actionable => {
        this.actions[actionable.action](actionable);
      });

    this.entity.game.onState('game_over').subscribe(() => {
      this.disabled = true;
    });
  }
  entity: IEntity & { movement?: IMovement; };

}
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

export class DestinationController extends Controller {

  constructor(entity: IEntity) {
    super(entity);
    this.entity.mode = Mode.Solid;
    this.entity.game.onState('update').subscribe(() => {
      if (this.entity.movement && this.entity.movement.position && this.entity.movement.position.resident !== this.entity) {
        this.teleport();
      }
    });
  }

  public teleport() {
    const tiles = this.entity.game.board.getTiles(block => !block.resident && !block.disabled && block.mode > Mode.Invisible);
    

    this.entity.movement.move(tiles[getRandomInt(tiles.length - 1)]);
    this.entity.game.gameRecord.score += 1;
    this.entity.game.view.playAudio('/assets/audio/bowser.mp3');
  }


}

export class RobotController extends Controller {


  public constructor(entity: IEntity) {
    super(entity);
    this.actions.right = this.rotateRight.bind(this);
    this.actions.left = this.rotateLeft.bind(this);
    this.actions.forward = this.forward.bind(this);
    this.entity.game.onState('update').subscribe(() => {
      if (this.entity.game.gameState > GameState.Blank && (this.entity.movement.position === null || this.entity.movement.position.disabled || this.entity.movement.position.mode == Mode.Invisible)) {

        this.entity.game.gameState = GameState.Over;
      }
    });
  }

  public rotateRight() {
    
    this.entity.movement.rotation =  ( Math.sign(this.entity.movement.rotation) || 1 ) * ((this.entity.movement.rotation + 90) % 360);
  }

  public rotateLeft() {
    this.entity.movement.rotation = ( Math.sign(this.entity.movement.rotation) || 1 ) * ((this.entity.movement.rotation - 90) % 360);
  }

  public forward() {
    console.log('destination', this.entity.movement.destination);
    this.entity.movement.move(this.entity.movement.destination);
  }

}

export class Block extends Entity implements IBlock {
  resident: IEntity = null;
  coordinate: [number, number];
  connections: { [rotation: number]: IBlock; } = {};
  mode = Mode.Board;

  public constructor(coordinate?: [number, number]) {
    super();
    if (coordinate) this.coordinate = coordinate;
  }
}
export class Board extends Entity implements IBoard {
  public getTiles(filter: (block: IBlock) => boolean): IBlock[] {
    const tiles = [];
    this.state.forEach(row => {
      row.forEach(block => {
        if (filter(block)) tiles.push(block);
      })

    });
    return tiles;
  }
  public state: IBlock[][];
  public history: string[];

  public constructor(game: IGame, entityFactory: IEntityFactory) {
    super();
    this.entityFactory = entityFactory;
    this.game = game;
    this.disabled = false;

  }



  //notation
  public getStateNotation(): string {
    let notation = '';

    this.state.forEach(row => {
      row.forEach(tile => {
        notation += `,${tile.disabled ? 1 : 0},${(tile.resident.profile && tile.resident.profile.id) ? tile.resident.profile.id : ''}`;
      });

      notation += '/'
    });
    return notation;
  }
  /*
   * / dilineates rows
   * number indicates skip
   * , dilineates between number and type
   */

  public notation: string;
  public setState(length: number, notation: string): void {

    console.log(notation);
    // set board
    this.state = Array<any>(length).fill(null, 0, length);
    for (let j = 0; j < this.state.length; j++) {
      this.state[j] = Array<any>(length).fill(null, 0, length);
      for (let i = 0; i < this.state[j].length; i++) {
        this.state[j][i] = new Block([i, j]);
      }
    }


    //set board pieces

    const rows = notation.split('/');
    const cursor: [number, number] = [0, 0];
    for (let j = 0; j < rows.length; j++) {
      const row = rows[j];
      cursor[1] = j;
      cursor[0] = 0;
      const actions = row.split(',');
      for (let i = 0; i < actions.length; i += 4) {

        const skip = parseInt(actions[i]) || 1;
        const disabled = parseInt(actions[i + 1]);
        const mode = parseInt(actions[i + 2]);
        const action = actions[i + 3];

        cursor[0] += skip;
        //if (skip) cursor[0] += skip;
        //else cursor[0] += 1;
        this.initBlock(this.getBlock(cursor), disabled as 0 | 1, mode, action);


      }
    }

    // set connections
    this.state.forEach(row => {
      row.forEach(tile => {
        tile.connections = {

          [0]: this.getBlock([
            tile.coordinate[0],
            tile.coordinate[1] + 1
          ]),
          [90]: this.getBlock([
            tile.coordinate[0] + 1,
            tile.coordinate[1]
          ]),
          [180]: this.getBlock([
            tile.coordinate[0],
            tile.coordinate[1] - 1
          ]),
          [270]: this.getBlock([
            tile.coordinate[0] - 1,
            tile.coordinate[1]
          ]),

        };

      })
    });

    console.log(this.state);

  }
  public getBlock(index: [number, number]): IBlock {
    if (this.state[index[1]] && this.state[index[1]][index[0]]) {
      return this.state[index[1]][index[0]];
    }
    return null;
  }

  protected initBlock(block: IBlock, disabled: 0 | 1, mode: Mode, action: string) {
    console.log(block, disabled, mode, action);
    if (disabled) {

      block.disabled = true;

    }
    if (mode > -2) {
      block.mode = mode;
    }
    if (!action) return;
    else {
      block.resident = this.entityFactory.create(action, this.game, { block });
    }
  }
}

export class Game extends Entity implements IGame {
  public static defaultboardlength = 5;
  public static defaultnotation: string = `//1,,,,0,,0,r`;
  public static gamelength: number = 60;
  public static tickperiod: number = 1000;
  public error_message: string;
  public state_message: string;
  public timer: number = Game.gamelength;
  public tick: Observable<number>;

  public board_tile_length: number = Game.defaultboardlength;

  public constructor() {
    super();

  }
  view: IView;
  public board: IBoard;
  public gameRecord: IGameRecord = { name: 'Player', playerId: 'We are all one', score: 0 };
  protected start() {
    this.tick = timer(0, Game.tickperiod).pipe(map(time => time));
    this.tick.subscribe(val => {
      if (this.gameState === GameState.Start) {
        this.timer = Math.floor(Game.gamelength - val);
        this.state$.next('tick');
        if (this.timer < 0) {
          this.gameState = GameState.Over;
        }

      }

    });



  }

  protected _gameState: GameState = GameState.Blank;
  public get gameState() {
    return this._gameState;
  }
  public set gameState(val: GameState) {
    if (val != this._gameState) {
      if (this._gameState == GameState.Blank) {
        this._gameState = val;
        this.start();
        return;
      }
      this._gameState = val;
      if (this.gameState == GameState.Pause) {
        this.state$.next('game_pause');
      } else if (this.gameState == GameState.Over) {
        console.log("Adding score", this.gameRecord);
        this.view.firestoreService.db.collection('score').doc(this.gameRecord.playerId).get().then(ref => {
          if (!ref.exists || ref.data().score < this.gameRecord.score) {

            this.view.firestoreService.db.collection('scores').doc(this.gameRecord.playerId + '-5x5').set({
              gameId: '5x5',
              score: this.gameRecord.score,
              playerId: this.gameRecord.playerId,
              playerName: this.gameRecord.playerId
            });
          }

        }, err => console.error(err))
        
        this.state$.next('game_over');
      } else if (this.gameState == GameState.Start) {
        this.state$.next('game_start');
      }
    }
  }


}




export class Movement implements IMovement {
  public rotation: Rotation = 0;
  public entity: IEntity;
  public speed: number = 1;
  public history: [number, number, IBlock][] = [];
  protected _position: IBlock;
  public get position(): IBlock { return this._position; }
  public set position(val: IBlock) {
    if (val) {
      this.history.push([val.coordinate[0], val.coordinate[1], val]);
    }
    
    this._position = val;
  }
  public constructor(entity: IEntity) {
    this.entity = entity;
  }

  protected rotation_directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  public get destination(): IBlock {
    
    let direction = Math.floor(this.rotation / 90);

    if (direction < 0) {
      direction = 4 + direction;
    }
    console.log('direction',this.rotation, direction);
    const vector = this.rotation_directions[direction] || [0, 0];
    vector[0] *= this.speed;
    vector[1] *= this.speed;
    console.log('vector', vector);
    const destination: [number, number] = [this.position.coordinate[0] + vector[0], this.position.coordinate[1] - vector[1]];
    return this.entity.game.board.getBlock(destination);
  }

  public move(block: IBlock) {
    console.log('move', block);
    // invalid move
    if (!block) {
      // nullify position
      if(this.position) this.position.resident = null;
      this.position = null;
    } else {

      if (block.resident) {
        // invalid move
        if (block.resident == this.entity) return;
        // illegal move
        if (block.resident.mode == this.entity.mode) return;

      }


      if (this.position && this.position.resident == this.entity) this.position.resident = null;

      this.position = block;
      this.position.resident = this.entity;
      console.log('coordinate', this.position.coordinate);
    }

    this.entity.game.state$.next('update');

  }

}
