import { IBlock } from './board';
import { IEntity } from './entity';

export enum Rotation {
  Up = 0, Right = 90, Bottom = 180, Left = 270
}

export interface IMovement {
  speed: number;
  history: Array<[number, number, IBlock]>;
  position: IBlock;
  destination: IBlock;
  rotation: Rotation;
  move(block: IBlock);
  entity: IEntity;
}
