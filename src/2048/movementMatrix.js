import { deepCopy } from '../utils';
var createMovementMatrix = function (size) {
    var tileActions = { DOUBLE: 0, MOVE: 1, DEL: 2 };
    if (typeof size !== 'number') {
        size = 4;
    }
    var createEmptyMatrix = function () {
        var i,
            j,
            matrix = [];
        for (i = 0; i < size; i++) {
            matrix.push([]);
            for (j = 0; j < size; j++) {
                matrix[i].push([]);
            }
        }
        return matrix;
    };
    var matrix = createEmptyMatrix(size);
    var getMatrix = function () {
        return deepCopy(matrix);
    };
    var addAction = function (action, row, col) {
        if (action.action === tileActions.DEL) {
            matrix[row][col] = [action];
            return;
        }
        if (matrix[row][col]) {
            matrix[row][col].push(action);
        } else {
            matrix[row][col] = [action];
        }
    };
    var reset = function () {
        matrix = createEmptyMatrix(size);
    };
    var getActionsAtPosition = function (row, col) {
        return matrix[row] && matrix[row][col];
    };
    return {
        getMatrix: getMatrix,
        get actions() {
            return tileActions;
        },
        addAction: addAction,
        reset: reset,
        getActions: getActionsAtPosition,
    };
};
export { createMovementMatrix };
