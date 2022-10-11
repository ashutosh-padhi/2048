export var createDivWithClass = function (classname) {
    var div = document.createElement('div');
    div.className = classname;
    return div;
};
export var createIcon = function (icon) {
    var element = createDivWithClass('icon');
    element.innerHTML = icon;
    return element;
};
export var createTile = function () {
    var tile = document.createElement('div');
    tile.className = 'tile newtile';
    return tile;
};
