import { Component, OnInit, HostListener } from '@angular/core';
import { IView, IProfile, GameState, IGame, IRobot, RobotController } from '../../services/interfaces';
import { FirestoreService } from '../../services/firestore.service';
import { GameFactoryService } from '../../services/factories/game-factory.service';
import { Router, ActivatedRoute, Route } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements IView {
  public player_name: string = '';
  public game: IGame;
  public game_over_message: string;
  public player: IProfile;
  public robot: RobotController;
  public load$: Subject<boolean>;
  public displayedColumns = ['rank', 'playerName', 'score']
  public leaderboard$: Subject<{ score: number, playerName: string }[]> = new Subject<{ score: number, playerName: string }[]>();
  public unsubscriber: Subject<void> = new Subject<void>();
  constructor(public firestoreService: FirestoreService, public gameFactory: GameFactoryService, public route: ActivatedRoute) {
    
  }
  panelOpenState = false;
  ngOnInit(): void {
    this.load$ = new Subject<boolean>();
    this.load$.subscribe(() => {
      this.game.gameState = GameState.Start;
      this.game.gameRecord.playerId = this.player_name;
      this.game.gameRecord.name = this.player_name;
      console.log("game", this.game.gameRecord);
      this.game.onState('game_over').subscribe(() => {
        this.playAudio('/assets/audio/gameover.mp3');
        this.game_over_message = `${this.player_name} receives ${this.game.gameRecord.score} Bowsers`;
      });
      this.firestoreService.db.collection('scores').where('gameId', '==', '5x5').where('score', '>', 0).orderBy('score', 'desc').get().then(scores => this.leaderboard$
        .next(scores.docs.map((docref, i) => { return { rank: i, ...docref.data() } as any; })));

    });

    this.route.queryParams.pipe(takeUntil(this.unsubscriber)).subscribe(query => {

      this.game = this.gameFactory.newGame(this);
      this.game.board.state.forEach(row => {
        row.forEach(tile => {
          if (tile && tile.resident && tile.resident['controller'] && tile.resident['controller'] instanceof RobotController) {

            this.robot = tile.resident['controller'];
          }
        })

      })
      if (query.playername) {
        this.setPlayer(query.playername);
      }

    });


    //this.debounceKeyPress.pipe(debounceTime(0)).subscribe(keypress => this.playerInput(keypress));
  }

  public setPlayer(name: string) {
    console.log(name);
    this.player = { label: name, image: '', id: name };
    this.player_name = name;
    this.load$.next(true);
  }

  ngOnDestroy(): void {
    this.unsubscriber.next();
  }

  //debounceKeyPress = new Subject<KeyboardEvent>();
  protected playerInput(ev: KeyboardEvent) {
    console.log("player input", ev.keyCode);
    if (ev.keyCode == 37) {
      this.robot.rotateLeft();
    }
    if (ev.keyCode == 38) {
      this.robot.forward();
    }
    if (ev.keyCode == 39) {
      this.robot.rotateRight();
    }
    if (ev.keyCode == 13) {
      if (!this.player) {
        this.setPlayer(this.player_name);
      }
      
    }
  }
  @HostListener('window:keydown', ['$event'])
  onKeyPress($event: KeyboardEvent) {
    this.playerInput($event);
  }
  public updatePlayerName(ev) {
    console.log(ev);
    this.player_name = ev;
  }
  public audio: HTMLAudioElement;
  public playAudio(src: string) {
    console.log("play audio", src);
    if (this.audio) return;
    this.audio = new Audio();
    this.audio.volume = 0.5;
    this.audio.src = src;
    this.audio.play()
    this.audio.load();
    this.audio.addEventListener('error', err => console.error(err));
    this.audio.addEventListener('canplay', () => this.audio.play());
    this.audio.addEventListener('ended', () => this.audio = null);
  }

}
