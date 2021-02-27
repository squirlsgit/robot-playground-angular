import { Observable } from 'rxjs';
import { Mode } from './profile';

export interface IBlock  {
  coordinate: [number, number];
  connections: { [rotation: number]: IBlock }
  resident: {
    mode: Mode, profile?: {id?: string}};
  disabled: boolean;
  mode: Mode;

}

export interface IBoard {

  state$: Observable<string>;
  state: Array<Array<IBlock>>;
  history: string[];
  notation: string;
  setState(length: number, notation: string): void;
  getBlock(index: [number, number]): IBlock;
  getTiles(filter: (block: IBlock) => boolean): IBlock[];
}
