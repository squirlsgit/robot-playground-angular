import { Component, OnInit } from '@angular/core';
import { IView } from '../../services/interfaces';
import { FirestoreService } from '../../services/firestore.service';
import { GameFactoryService } from '../../services/factories/game-factory.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, IView {

  public game;

  constructor(public firestoreService: FirestoreService, public gameFactory: GameFactoryService) { }

  ngOnInit(): void {
    this.game = this.gameFactory.newGame(this);
    console.log(this.game);
  }
  

}
