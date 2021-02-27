import { Observable } from 'rxjs';
import { IEntity } from './entity';
import { IMovement } from './movement';

export interface IActionable {
  action: string;
  agent: IEntity;
}

export interface IController {
  input: Observable<IActionable>;
  disabled: boolean;
  actions: { [action: string]: (action?: IActionable) => void };
  entity: IEntity & { movement?: IMovement };
}
