import { StateActions } from './stateActions';
export var setScoreAction = function (score) {
    return {
        type: StateActions.SET_SCORE,
        payload: { score: score },
    };
};
export var addScoreAction = function (score) {
    return {
        type: StateActions.ADD_SCORE,
        payload: { score: score },
    };
};
export var setGameOverAction = function () {
    return {
        type: StateActions.SET_GAME_OVER,
    };
};
export var unsetGameOverAction = function () {
    return {
        type: StateActions.UNSET_GAME_OVER,
    };
};
