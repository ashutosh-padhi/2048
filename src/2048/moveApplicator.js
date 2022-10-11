import { bind } from '../utils';
var createMoveApplicator = function (doOnDouble, model, movementMatrix) {
    var actionIterator = function (row, col, cb) {
        var movement = true;
        var actions = movementMatrix.getActions(row, col).sort(function (a, b) {
            return a.action - b.action;
        });
        var movementOperations = movementMatrix
            .getActions(row, col)
            .filter(function (action) {
                return action.action === movementMatrix.actions.MOVE;
            });
        if (movementOperations.length === 0) {
            movement = false;
        }
        if (actions && actions.length > 0) {
            actions.forEach(function (action) {
                if (cb) {
                    cb(action, row, col);
                }
            });
        }
        return { movement: movement };
    };
    var actionApplicator = function (mover, action, row, col) {
        var newvalue;
        switch (action.action) {
            case movementMatrix.actions.DEL:
                model.setPosition({ pos: [row, col], value: 0, level: 0 });
                break;
            case movementMatrix.actions.MOVE:
                if (mover) {
                    mover(row, col, action);
                }
                model.setPosition({
                    pos: [row, col],
                    value: 0,
                    noview: true,
                    level: 0,
                });
                break;
            case movementMatrix.actions.DOUBLE:
                var oldTileState = model.getTile(row, col);
                newvalue = window.app2048.collision(oldTileState.value);
                model.setPosition({
                    pos: [row, col],
                    value: newvalue,
                    level: oldTileState.level + 1,
                    action: 'double',
                });
                if (typeof doOnDouble === 'function') doOnDouble(newvalue);
                break;
        }
    };
    var moveUp = function (row, col, action) {
        model.getTile(row, col).value &&
            model.setPosition({
                pos: [row - action.distance, col],
                value: model.getTile(row, col).value,
                level: model.getTile(row, col).level,
                noview: false,
                posFrom: [row, col],
            });
    };
    var moveDown = function (row, col, action) {
        model.getTile(row, col).value &&
            model.setPosition({
                pos: [row + action.distance, col],
                value: model.getTile(row, col).value,
                level: model.getTile(row, col).level,
                noview: false,
                posFrom: [row, col],
            });
    };
    var moveLeft = function (row, col, action) {
        model.getTile(row, col).value &&
            model.setPosition({
                pos: [row, col - action.distance],
                value: model.getTile(row, col).value,
                level: model.getTile(row, col).level,
                noview: false,
                posFrom: [row, col],
            });
    };
    var moveRight = function (row, col, action) {
        model.getTile(row, col).value &&
            model.setPosition({
                pos: [row, col + action.distance],
                value: model.getTile(row, col).value,
                level: model.getTile(row, col).level,
                noview: false,
                posFrom: [row, col],
            });
    };
    var doAction = function (row, col, movefn) {
        return actionIterator(row, col, bind(actionApplicator, movefn));
    };
    return {
        up: function (row, col) {
            return doAction(row, col, moveUp);
        },
        down: function (row, col) {
            return doAction(row, col, moveDown);
        },
        left: function (row, col) {
            return doAction(row, col, moveLeft);
        },
        right: function (row, col) {
            return doAction(row, col, moveRight);
        },
    };
};
export { createMoveApplicator };
