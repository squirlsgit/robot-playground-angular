import { IGame, IView } from './game';
import { IEntity } from './entity';

export interface IEntityFactory {
  create(entity_type: string, game: IGame, options?: any): IEntity;
}

export interface IGameFactory {
  newGame(view: IView): IGame;
}

