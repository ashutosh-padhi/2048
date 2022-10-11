export var createScoreHandler = function (scoreContainer) {
    var setScore = function (scr) {
        scoreContainer.innerText = scr;
    };
    return {
        set: setScore,
    };
};
