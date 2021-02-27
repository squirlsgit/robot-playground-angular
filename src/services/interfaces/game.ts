import { IProfile } from './profile';
import { Observable, Subject } from 'rxjs';
import { IBoard } from './board';
import firebase from 'firebase';
export enum GameState {
  Blank,
  Start,
  Pause,
  Over
}
export interface IGameRecord {
  name?: string;
  score: number;
  playerId: string;
}

export interface IView {
  // Lets outline some services it might have later
  firestoreService: { db: firebase.firestore.Firestore };
}

export interface IGame {
  error_message: string;
  state_message: string;
  profile: IProfile;
  timer: number;
  tick: Observable<number>;
  state$: Subject<string>;
  onState(event: string): Observable<string>;
  board_tile_length: number;
  board: IBoard;
  gameState: GameState;
  gameRecord: IGameRecord;
  view: IView;
}
