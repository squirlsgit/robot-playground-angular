import { Injectable } from '@angular/core';
import { IEntityFactory, IGame, IEntity, RobotController, Movement, Mode, DestinationController, IDestination, IRobot } from '../interfaces';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EntityFactoryService implements IEntityFactory {

  public entity_map: {[type: string]: (game: IGame, options?: any) => IEntity} = {
    r: (game: IGame, options?: any) => {
      const robot: IRobot = {
        controller: null,
        movement: null,
        state$: new Subject<string>(),
        disabled: false,
        profile: {
          image: 'assets/images/robot.png',
          label: 'Mr. Can',
          id: 'r'
        },
        mode: Mode.Transparent,
        entityFactory: this,
        game

      }
      
      robot.controller = new RobotController(robot);
      robot.movement = new Movement(robot);
      robot.movement.rotation = 0;
      robot.movement.speed = 1;

      if (options && options.block) {
        robot.movement.position = options.block;
      }
      return robot;
    },
    d: (game: IGame, options?: any) => {
      const destination: IDestination = {
        controller: null,
        movement: null,
        state$: new Subject<string>(),
        disabled: false,
        mode: Mode.Solid,
        profile: {
          label: 'Star',
          image: 'assets/images/destination.png',
          id: 'd'
        },
        entityFactory: this,
        game
      };

      destination.controller = new DestinationController(destination);
      destination.movement = new Movement(destination);
      destination.movement.rotation = 0;
      
      destination.movement.speed = 1;
      if (options && options.block) {
        destination.movement.position = options.block;
      }
      return destination;

    }
  }

  constructor() { }
  create<T extends IEntity>(entity_type: string, game: IGame, options?: any): T {
    return this.entity_map[entity_type].bind(this)(game, options) as T;
  }

  
}
