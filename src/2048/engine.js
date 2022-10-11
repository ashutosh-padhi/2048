import { createMovementMatrix } from './movementMatrix';
import { Actions } from './actions';
import { createMovementDecider } from './movementDecider';
import { createMoveApplicator } from './moveApplicator';
import { bind } from '../utils';
import { createCacheStore } from './stateCache';
import { createStateStore } from './stateStore';
import { StateActions } from './stateActions';
import {
    addScoreAction,
    setScoreAction,
    setGameOverAction,
    unsetGameOverAction,
} from './actionCreator';
import { gameReducer } from './gameReducer';
import { createPubSub } from '../pubsub';

var gameEngine = function (config) {
    var model = config.model;
    var randomizer = config.randomizer;
    var winTile = config.winTile || 2048;
    var stateStore = createStateStore({ highScore: 0, score: 0 }, gameReducer);
    var doOnScoreChange = createPubSub();
    var doOnWinTileReached = createPubSub();
    var doOnMoveFinished = createPubSub();
    var doOnGameOver = createPubSub();
    var doOnGameOverReset = createPubSub();
    var doOnAfterNewTile = createPubSub();
    var setScore = function (score) {
        stateStore.dispatch(setScoreAction(score));
    };
    var addScore = function (score) {
        stateStore.dispatch(addScoreAction(score));
    };
    stateStore.doOnStateChange.subscribe(function (action, _state) {
        if (action.restore) {
            _state = _state.getState();
            if (_state.gameover) {
                doOnGameOver.publish();
            }
            if (_state.won) {
                doOnWinTileReached.publish();
            }
            doOnScoreChange.publish({
                score: _state.score,
                highScore: _state.highScore || 0,
            });
            return;
        }
        switch (action.type) {
            case StateActions.SET_SCORE:
                doOnScoreChange.publish({
                    score: _state.getFromPath(['score']),
                    highScore: _state.getFromPath(['highScore']),
                });
                break;
            case StateActions.ADD_SCORE:
                (function () {
                    var currentScore = _state.getFromPath(['score']);
                    var currentHighscore = _state.getFromPath(['highScore']);
                    if (currentScore === winTile) {
                        doOnWinTileReached.publish(currentScore);
                    }
                    doOnScoreChange.publish({
                        score: currentScore,
                        highScore: currentHighscore,
                    });
                })();
                break;
            case StateActions.SET_GAME_OVER:
                doOnGameOver.publish();
                break;
            case StateActions.UNSET_GAME_OVER:
                doOnGameOverReset.publish();
                break;
        }
    });
    setScore(0);
    var store = createCacheStore(config.cacheSize || 5);
    var size = model.getSize();
    var movementMatrix = createMovementMatrix(size);

    var move = function (action) {
        var row,
            col,
            movementDecider = createMovementDecider(model, movementMatrix);
        switch (action) {
            case Actions.UP:
                for (col = 0; col < size; col++) {
                    for (row = 0; row < size; row++) {
                        movementDecider.decide(row, col);
                    }
                    movementDecider.reset();
                }
                break;
            case Actions.DOWN:
                for (col = 0; col < size; col++) {
                    for (row = size - 1; row >= 0; row--) {
                        movementDecider.decide(row, col);
                    }
                    movementDecider.reset();
                }
                break;
            case Actions.LEFT:
                for (row = 0; row < size; row++) {
                    for (col = 0; col < size; col++) {
                        movementDecider.decide(row, col);
                    }
                    movementDecider.reset();
                }
                break;
            case Actions.RIGHT:
                for (row = 0; row < size; row++) {
                    for (col = size - 1; col >= 0; col--) {
                        movementDecider.decide(row, col);
                    }
                    movementDecider.reset();
                }
                break;
        }
    };

    var createMoveApplicatorBound = bind(
        createMoveApplicator,
        function (score) {
            addScore(score);
        }
    );
    var applymove = function (motion) {
        var row,
            col,
            moveApplicator = createMoveApplicatorBound(model, movementMatrix),
            movement = false;
        switch (motion) {
            case Actions.UP:
                for (col = 0; col < size; col++) {
                    for (row = 0; row < size; row++) {
                        movement =
                            moveApplicator.up(row, col).movement || movement;
                    }
                }
                break;
            case Actions.DOWN:
                for (col = 0; col < size; col++) {
                    for (row = size - 1; row >= 0; row--) {
                        movement =
                            moveApplicator.down(row, col).movement || movement;
                    }
                }
                break;
            case Actions.LEFT:
                for (row = 0; row < size; row++) {
                    for (col = 0; col < size; col++) {
                        movement =
                            moveApplicator.left(row, col).movement || movement;
                    }
                }
                break;
            case Actions.RIGHT:
                for (row = 0; row < size; row++) {
                    for (col = size - 1; col >= 0; col--) {
                        movement =
                            moveApplicator.right(row, col).movement || movement;
                    }
                }
                break;
        }
        movementMatrix.reset();
        return { movement: movement };
    };
    var gameOverDecider = function (model) {
        var row,
            col,
            movePossible = false,
            currentValue;
        row: for (row = 0; row < size; row++) {
            for (col = 0; col < size; col++) {
                currentValue = model.getTile(row, col).value;
                if (currentValue === 0) {
                    movePossible = true;
                    break row;
                }
                movePossible =
                    currentValue === model.getTile(row - 1, col).value ||
                    currentValue === model.getTile(row + 1, col).value ||
                    currentValue === model.getTile(row, col - 1).value ||
                    currentValue === model.getTile(row, col + 1).value ||
                    movePossible;
                if (movePossible) {
                    break row;
                }
            }
        }
        return movePossible;
    };
    var play = function (action) {
        var oldState = {
            model: model.getModel(),
            state: stateStore.getState(),
        };
        move(action);
        if (applymove(action).movement) {
            store.push(oldState);
            doOnMoveFinished.publish(oldState.model);
            var newPos = randomizer.getNextPosition();
            var newValue = randomizer.getNextNumber();
            setTimeout(function () {
                model.setPosition({
                    pos: newPos,
                    value: newValue,
                    level: newValue === 2 ? 1 : 2,
                });
                //printGame(currentBaseModel);
                if (!gameOverDecider(model)) {
                    stateStore.dispatch(setGameOverAction());
                }
                doOnAfterNewTile.publish({
                    model: model.getModel(),
                    state: stateStore.getState(),
                });
            }, 100);
        }
    };
    var start = function () {
        var newPos = randomizer.getNextPosition();
        var newValue = randomizer.getNextNumber();
        model.setPosition({
            pos: newPos,
            value: newValue,
            level: newValue === 2 ? 1 : 2,
        });
        store.doOnSizeChange.publish(0);
    };
    //printGame(currentBaseModel);
    return {
        left: function () {
            play(Actions.LEFT);
        },
        right: function () {
            play(Actions.RIGHT);
        },
        up: function () {
            play(Actions.UP);
        },
        down: function () {
            play(Actions.DOWN);
        },
        reset: function () {
            model.reset();
            store.clean();
            setScore(0);
            stateStore.dispatch(unsetGameOverAction());
            var newPos = randomizer.getNextPosition();
            var newValue = randomizer.getNextNumber();
            model.setPosition({
                pos: newPos,
                value: newValue,
                level: newValue === 2 ? 1 : 2,
            });
            doOnAfterNewTile.publish({
                model: model.getModel(),
                state: stateStore.getState(),
            });
        },
        back: function () {
            var st = store.pop();
            model.setModel(st.model);
            if (st.state.gameover) {
                stateStore.dispatch(unsetGameOverAction());
            }
            setScore(st.state.score);
        },
        restoreStore: function (str) {
            store.restore(str);
            store.doOnSizeChange.publish(str.length);
        },
        restoreState: function (st) {
            model.setModel(st.model);
            stateStore.restore(st.state);
        },
        getModel: function () {
            return model.getModel();
        },
        start: start,
        doOnBackSizeChange: store.doOnSizeChange,
        doOnModelReset: model.doOnModelReset,
        doOnMoveFinished: doOnMoveFinished,
        doOnGameOver: doOnGameOver,
        doOnGameOverReset: doOnGameOverReset,
        doOnStorePush: store.doOnStorePush,
        doOnAfterNewTile: doOnAfterNewTile,
        doOnScoreChange: doOnScoreChange,
        doOnWinTileReached: doOnWinTileReached,
    };
};

export { gameEngine };
