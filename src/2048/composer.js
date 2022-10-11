import { createModel } from './model';
import { createRandomizer } from './randomizer';
import { gameEngine } from './engine';
import { deepCopy } from '../utils';
export var setupGame = function (config) {
    var size = config.size,
        cacheSize = config.cacheSize,
        chanceOf2 = config.chanceOf2 || 90,
        winTile = config.winTile,
        store = config.store;
    var model = createModel(size);
    var randomizer = createRandomizer(chanceOf2, model);
    var game = gameEngine({
        model: model,
        randomizer: randomizer,
        cacheSize: cacheSize,
        winTile: winTile,
    });
    if (store && store.storage) {
        setTimeout(function () {
            var gameStateId = `${size}-gamestate`;
            var currentStateId = `${size}-currentstate`;
            var oldstore = localStorage.getItem(gameStateId);
            if (oldstore) {
                game.restoreStore(JSON.parse(oldstore));
            }
            var oldstate = localStorage.getItem(currentStateId);
            if (oldstate) {
                game.restoreState(JSON.parse(oldstate));
            } else {
                game.start();
            }
            game.doOnStorePush.subscribe(function (store) {
                localStorage.setItem(gameStateId, JSON.stringify(store));
            });
            game.doOnAfterNewTile.subscribe(function (state) {
                localStorage.setItem(currentStateId, JSON.stringify(state));
            });
            game.doOnBackSizeChange.subscribe(function (storeLength) {
                if (storeLength === 0) {
                    localStorage.setItem(gameStateId, '');
                }
            });
        }, 0);
    } else {
        setTimeout(function () {
            game.start();
        }, 0);
    }
    var frontGame = deepCopy(Object.assign(game, { model: model }));
    delete frontGame.start;
    delete frontGame.restoreStore;
    delete frontGame.restoreState;
    return frontGame;
};
