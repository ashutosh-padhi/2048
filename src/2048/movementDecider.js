var createMovementDecider = function (model, movementMatrix) {
    var prevValue = 0;
    var displacement = 0;
    var prevPosition = [];
    var decide = function (row, col) {
        if (model.getTile(row, col).value === 0) {
            displacement++;
        } else if (model.getTile(row, col).value === prevValue) {
            movementMatrix.addAction(
                { action: movementMatrix.actions.DEL },
                prevPosition[0],
                prevPosition[1]
            );
            displacement++;
            movementMatrix.addAction(
                {
                    action: movementMatrix.actions.DOUBLE,
                },
                row,
                col
            );
            movementMatrix.addAction(
                {
                    action: movementMatrix.actions.MOVE,
                    distance: displacement,
                },
                row,
                col
            );
            prevValue = 0;
        } else {
            prevValue = model.getTile(row, col).value;
            if (displacement !== 0) {
                movementMatrix.addAction(
                    {
                        action: movementMatrix.actions.MOVE,
                        distance: displacement,
                    },
                    row,
                    col
                );
            }
            prevPosition = [row, col];
        }
    };
    var reset = function () {
        prevPosition = [];
        displacement = 0;
        prevValue = 0;
    };
    return { decide: decide, reset: reset };
};
export { createMovementDecider };
