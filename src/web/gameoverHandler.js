export var createGameOverHandler = function (gameOverContainer) {
    return {
        set: function () {
            gameOverContainer.style.display = 'flex';
        },
        release: function () {
            gameOverContainer.style.display = 'none';
        },
    };
};
