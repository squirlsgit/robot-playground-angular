

## Some Business Logic details
game has its own runtime. The hooks into the interface are pretty agnostic. Can be ported to another framework so long as the dependencies are met.

Every game has a board. Every board has a 2d array of tiles. Every tile has a visibility state and whether it is disabled or not. Also can have a resident.

A resident can be anything, but for the 5x5 game it is either a robot or a destination, which are called entities.

An entity has a controller and a movement module. Module determines how it moves. Usually kept the same unless something special is needed. Controller can be used by external agents.

In the case of a robot the controller is guided by player input.

In the case of the destination it listens for updates on the game board and acts accordingly. Updating player score, and giving positive feedback.

The game board can be configured so it can be any shape. The interface can be tweaked to show only some blocks while ignoring others.

Obstacles can be added much like the destination is. It will just have a slightly different series of functions.

I only wrote one game, but many maps can be made by giving the factory a different notated string. (Similar to how chess games are built)

The leaderboard uses firestore because I thought it would be easiest. It is updated on game over. And fetched when refreshing the page. It can use an observable as well but ran out of time. It's a very easy change but they kind of stack.

Different games can be written by manipulating the timer and the entities on the game board. We can tie together the ends of the board so it's impossible to be out of bounds as well.

If more movement possibilities are needed, need to update the movement module to go by 45 degrees instead of 90.



# RobotPlaygroundAngular

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.0.6.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

