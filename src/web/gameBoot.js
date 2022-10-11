import './assets/style.scss';
import { createScoreHandler } from './scoreHandler';
import { createGameOverHandler } from './gameoverHandler';
import { setupGame } from '../2048/composer';
import gameTemplate from './game.tmpl.html';
import { registerTouch } from './touchHandler';
import squareIcon from './assets/icons/square-round.svg';
import triangleIcon from './assets/icons/triangle-round.svg';
import { tileMoveHandler } from './tileMoveHandler';
import { createIcon, createDivWithClass } from './webUtils';

export var boot = function () {
    var size, cacheSize, chanceOf2, winTile, playSensitivity, touchSensitivity;
    (function intializeWebpackDefineVariables() {
        /* eslint-disable */
        size = MATRIX_SIZE;
        cacheSize = CACHE_SIZE;
        chanceOf2 = CHANCE_OF_2;
        winTile = WIN_TILE;
        playSensitivity = PLAY_SENSITIVITY;
        touchSensitivity = TOUCH_SENSITIVITY;
        document.body.innerHTML = gameTemplate;
        /* eslint-enable */
    })();

    Element.prototype.setPositionClass = function (pos) {
        var c = this.className;
        c = c
            .replace(/\bf[0-9]{1,2}-[0-9]{1,2}/, '')
            .replace(/\s+/, ' ')
            .trim();
        this.className =
            c +
            ' f' +
            pos
                .map(function (i) {
                    return '' + (i + 1);
                })
                .join('-');
    };
    Element.prototype.setNumberClass = function (num) {
        var c = this.className;
        c = c
            .replace(/\bt[0-9]+\b/g, '')
            .replace(/\s+/, ' ')
            .trim();
        this.className = c + ' t' + num;
    };
    Element.prototype.removeClass = function (classname) {
        var c = this.className;
        this.className = c
            .split(/\s/)
            .filter(function (ele) {
                return ele !== classname;
            })
            .join(' ');
    };
    Element.prototype.addClass = function (classname) {
        this.className = this.className + ' ' + classname;
    };
    // creates the placeholder grid
    (function (element, size) {
        var i, j, row;
        for (i = 1; i <= size; i++) {
            row = createDivWithClass('sqr-row');
            for (j = 1; j <= size; j++) {
                row.appendChild(createDivWithClass('sqr sqr' + i + '-' + j));
            }
            element.appendChild(row);
        }
    })(document.querySelector('.app'), size);

    var scoreHandler = createScoreHandler(
        document.querySelector('.action .score')
    );
    var highScoreHandler = createScoreHandler(
        document.querySelector('.action .high-score')
    );
    var gameOverHandler = createGameOverHandler(
        document.querySelector('.app .game-over')
    );
    var backCountHandler = createScoreHandler(
        document.querySelector('.action .refresh-count')
    );
    var game = setupGame({
        size: size,
        cacheSize: cacheSize,
        chanceOf2: chanceOf2,
        winTile: winTile,
        store: {
            storage: localStorage,
        },
    });
    tileMoveHandler(game);

    //reload button
    var reloadBtn = document.querySelector('.action .btn.refresh');
    reloadBtn.appendChild(createIcon(squareIcon));
    reloadBtn.addEventListener('click', function () {
        game.reset();
    });

    //back button
    var backBtn = document.querySelector('.action .btn.back');
    backBtn.appendChild(createIcon(triangleIcon));
    backBtn.addEventListener('click', function () {
        game.back();
    });

    game.doOnBackSizeChange.subscribe(function (s) {
        backCountHandler.set(s);
    });
    game.doOnGameOver.subscribe(function () {
        gameOverHandler.set();
    });
    game.doOnGameOverReset.subscribe(function () {
        gameOverHandler.release();
    });
    game.doOnScoreChange.subscribe(function (score) {
        scoreHandler.set(score.score);
        highScoreHandler.set(score.highScore);
    });
    registerTouch(
        document.querySelector('.app'),
        (function () {
            var lastPlayed = new Date().getTime();
            return function (e) {
                var currTime = new Date().getTime();
                if (currTime > lastPlayed + playSensitivity) {
                    switch (e.type) {
                        case 'down':
                            game.down();
                            break;
                        case 'right':
                            game.right();
                            break;
                        case 'up':
                            game.up();
                            break;
                        case 'left':
                            game.left();
                            break;
                    }
                }
                lastPlayed = currTime;
            };
        })(),
        touchSensitivity
    );
    document.body.addEventListener(
        'keydown',
        (function () {
            var lastPlayed = new Date().getTime();
            return function (e) {
                var currTime = new Date().getTime();
                if (currTime > lastPlayed + playSensitivity) {
                    switch (e.keyCode) {
                        case 40:
                            game.down();
                            break;
                        case 39:
                            game.right();
                            break;
                        case 38:
                            game.up();
                            break;
                        case 37:
                            game.left();
                            break;
                    }
                }
                lastPlayed = currTime;
            };
        })()
    );
};
