import { Observable } from 'rxjs';
import { IProfile, Mode } from './profile';
import { IGame } from './game';
import { IEntityFactory } from './factory';


export interface IEntity {

  state$: Observable<string>;
  disabled: boolean;
  profile?: IProfile;
  game: IGame;
  entityFactory: IEntityFactory
  mode: Mode;
}
