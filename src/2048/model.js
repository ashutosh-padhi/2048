import { deepCopy } from '../utils';
import { createPubSub } from '../pubsub';

var createModel = function (size) {
    var doOnPositionChange = createPubSub();
    var doOnModelReset = createPubSub();
    if (!size || typeof size !== 'number') {
        size = 4;
    }
    var createEmptyModel = function (size) {
        var i,
            j,
            model = [];
        for (i = 0; i < size; i++) {
            model.push([]);
            for (j = 0; j < size; j++) {
                model[i].push({ value: 0, level: 0 });
            }
        }
        return model;
    };
    var createEmptyTiles = function (size) {
        var tiles = [],
            i,
            j;
        for (i = 0; i < size; i++) {
            for (j = 0; j < size; j++) {
                tiles.push({
                    pos: [i, j],
                    filled: false,
                });
            }
        }
        return tiles;
    };
    var baseModel = createEmptyModel(size);
    var tiles = createEmptyTiles(size);
    var getEmptyTiles = function () {
        return deepCopy(
            tiles.filter(function (tile) {
                return !tile.filled;
            })
        );
    };
    var getModel = function () {
        return deepCopy(baseModel);
    };
    var setPosition = function (posObj) {
        var pos = posObj.pos,
            value = posObj.value;
        if (pos === null) return;
        doOnPositionChange.publish(posObj);
        baseModel[pos[0]][pos[1]].value = value;
        baseModel[pos[0]][pos[1]].level = posObj.level;
        tiles.filter(function (tile) {
            return tile.pos[0] === pos[0] && tile.pos[1] === pos[1];
        })[0].filled = value ? true : false;
    };
    var getTileAtPosition = function (row, col) {
        var args = Array.prototype.slice.apply(arguments, [0]);
        if (Object.prototype.toString.apply(args[0]) === '[object Array]') {
            row = args[0][0];
            col = args[0][1];
        }
        return baseModel[row] && baseModel[row][col];
    };
    var reset = function () {
        setModel(createEmptyModel(size));
        tiles = createEmptyTiles(size);
        doOnModelReset.publish();
    };
    var setModel = function (model) {
        var i, j;
        for (i = 0; i < size; i++) {
            for (j = 0; j < size; j++) {
                setPosition({
                    pos: [i, j],
                    value: model[i][j].value,
                    level: model[i][j].level,
                });
            }
        }
    };
    var getSize = function () {
        return size;
    };
    return {
        getModel: getModel,
        getEmptyTiles: getEmptyTiles,
        setPosition: setPosition,
        getTile: getTileAtPosition,
        reset: reset,
        setModel: setModel,
        getSize: getSize,
        doOnPositionChange: doOnPositionChange,
        doOnModelReset: doOnModelReset,
    };
};

export { createModel };
