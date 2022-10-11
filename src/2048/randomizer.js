var createRandomizer = function (chanceOf2, model) {
    if (typeof chanceOf2 !== 'number')
        throw {
            type: 'TypeError',
            message: 'expecting a number',
        };
    if (!(chanceOf2 <= 1)) chanceOf2 = chanceOf2 / 100;
    var getNextNumber = function () {
        return Math.random() <= chanceOf2 ? 2 : 4;
    };
    var getRandNumBetween0_n = function (n) {
        var base = ('' + n).length;
        return Math.floor(Math.random() * Math.pow(10, base)) % (n + 1);
    };
    var getNextPosition = function () {
        var modelLength = model.getEmptyTiles().length;
        if (modelLength === 0) return null;
        else
            return model.getEmptyTiles()[getRandNumBetween0_n(modelLength - 1)]
                .pos;
    };
    return {
        getNextNumber: getNextNumber,
        getNextPosition: getNextPosition,
    };
};

export { createRandomizer };
