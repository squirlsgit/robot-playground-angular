import { Injectable } from '@angular/core';
import { EntityFactoryService } from './entity-factory.service';
import { IView, IGame, Game, Board, IDestination, DestinationController } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class GameFactoryService {

  constructor(protected entityService: EntityFactoryService) {

  }

  public newGame(view: IView): IGame {
    const game = new Game();
    game.view = view;
    game.board = new Board(game, this.entityService);

    game.board.setState(Game.defaultboardlength, Game.defaultnotation);

    const destination = this.entityService.create<IDestination>('d', game);

    (destination.controller as DestinationController).teleport();
    game.gameRecord.score = 0;
    return game;
  }

}
