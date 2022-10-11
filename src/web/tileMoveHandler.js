import { createTile } from './webUtils';

export var tileMoveHandler = function (game) {
    var container = document.querySelector('.tile-container');
    var tileStore = [];
    var tileMap = {};
    game.model.doOnPositionChange.subscribe(function (posObj) {
        var pos = posObj.pos,
            value = posObj.value,
            level = posObj.level,
            noview = posObj.noview,
            posFrom = posObj.posFrom,
            tile;
        if (!noview) {
            if (posFrom && posFrom.length > 0) {
                tile = tileMap[posFrom.toString()];
                if (tile) {
                    tile.setPositionClass(pos);
                    tile.setNumberClass(level);
                    tile.innerText = value;
                    tileMap[pos.toString()] = tile;
                    tile.removeClass('newtile');
                    delete tileMap[posFrom.toString()];
                }
            } else if (value) {
                tile = tileMap[pos.toString()];
                if (!tile) {
                    if (tileStore.length === 0) {
                        tile = createTile();
                    } else {
                        tile = tileStore.pop();
                        tile.addClass('newtile');
                    }
                    tileMap[pos.toString()] = tile;
                    container.appendChild(tile);
                }
                tile.setPositionClass(pos);
                tile.setNumberClass(level);
                tile.innerText = value;
                if (posObj.action === 'double') {
                    tile.removeClass('movetile');
                    void tile.offsetWidth;
                    tile.addClass('movetile');
                }
            } else {
                tile = tileMap[pos.toString()];
                if (tile) {
                    container.removeChild(tile);
                    tile.removeClass('newtile');
                    tile.removeClass('movetile');
                    tileStore.push(tile);
                    delete tileMap[pos.toString()];
                }
            }
        }
    });
};
